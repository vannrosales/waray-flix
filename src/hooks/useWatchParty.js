import { useState, useEffect, useRef, useCallback } from 'react';
import { CONFIG } from '../config/siteConfig';
import { useWatchPartyChat } from './watchParty/useWatchPartyChat';
import { useWatchPartyScrubber } from './watchParty/useWatchPartyScrubber';
import { setupWatchPartyNetworking } from '../services/watchParty/watchPartyNetworking';
export { formatPlaybackTime as formatTime } from '../utils/formatters';

export function useWatchParty(roomId, username, initialPlayerId = CONFIG.players[0].id) {
  const [selectedPlayerId, setSelectedPlayerId] = useState(initialPlayerId);
  const [connectionStatus, setConnectionStatus] = useState('connecting');

  // Playback Sync State
  const [currentPlaybackSecs, setCurrentPlaybackSecs] = useState(0);
  const [hostTime, setHostTime] = useState(0);
  const [appliedTime, setAppliedTime] = useState(0);
  const [syncKey, setSyncKey] = useState(0);

  // Host-Only Control Lock State
  const [isHost, setIsHost] = useState(true);
  const [isHostOnlyLock, setIsHostOnlyLock] = useState(false);
  const [hostUsername, setHostUsername] = useState(username);

  // Chat & Reactions hook
  const {
    messages,
    addMessage,
    floatingReactions,
    triggerReaction: triggerChatReaction,
    sendMessage: sendChatMessage
  } = useWatchPartyChat(roomId, username);
  
  // Real-Time Active Peers Presence
  const [activePeers, setActivePeers] = useState({
    [username]: { username, lastSeen: Date.now(), isHost: true }
  });

  const networkingRef = useRef(null);
  const processedPacketIdsRef = useRef(new Set());
  const localPlayerRef = useRef(selectedPlayerId);
  const isHostOnlyLockRef = useRef(false);
  const hostUsernameRef = useRef(username);
  const isHostRef = useRef(true);

  const activePeersRef = useRef({
    [username]: { username, lastSeen: Date.now(), isHost: true }
  });

  useEffect(() => { localPlayerRef.current = selectedPlayerId; }, [selectedPlayerId]);
  useEffect(() => { isHostOnlyLockRef.current = isHostOnlyLock; }, [isHostOnlyLock]);
  useEffect(() => { hostUsernameRef.current = hostUsername; }, [hostUsername]);
  useEffect(() => { isHostRef.current = isHost; }, [isHost]);

  const broadcastData = useCallback((data) => {
    if (networkingRef.current) {
      networkingRef.current.broadcastData(data);
    }
  }, []);

  // Scrubber and playback tracking hook
  const { setManualTime, getCurrentSeconds } = useWatchPartyScrubber({
    roomId,
    isHostRef,
    localPlayerRef,
    hostUsernameRef,
    isHostOnlyLockRef,
    onBroadcastData: broadcastData,
    onTimeUpdated: (secs, isInitial) => {
      setCurrentPlaybackSecs(secs);
      if (isInitial) setAppliedTime(secs);
    }
  });

  const triggerReaction = useCallback((emoji) => {
    triggerChatReaction(emoji, broadcastData);
  }, [triggerChatReaction, broadcastData]);

  const sendMessage = useCallback((text) => {
    sendChatMessage(text, broadcastData);
  }, [sendChatMessage, broadcastData]);

  const recordPeerHeartbeat = useCallback((peerName, isPeerHost = false) => {
    if (!peerName) return;
    activePeersRef.current[peerName] = {
      username: peerName,
      lastSeen: Date.now(),
      isHost: isPeerHost,
    };
    setActivePeers({ ...activePeersRef.current });
  }, []);

  // Handle incoming packets
  const handleIncomingPacket = useCallback((data) => {
    if (!data || !data.type) return;
    if (data.packetId && processedPacketIdsRef.current.has(data.packetId)) return;
    if (data.packetId) processedPacketIdsRef.current.add(data.packetId);

    if (data.origin) {
      recordPeerHeartbeat(data.origin, data.isHost || false);
    }

    switch (data.type) {
      case 'HEARTBEAT': {
        if (data.isHost) {
          setHostUsername(data.hostUsername || data.origin);
          if (data.isHostOnlyLock !== undefined) setIsHostOnlyLock(data.isHostOnlyLock);
          if (data.origin !== username && isHostRef.current) setIsHost(false);
        }
        break;
      }
      case 'SYNC_PLAYBACK': {
        if (isHostOnlyLockRef.current && !data.isHost && data.origin !== hostUsernameRef.current) return;
        if (data.hostTime !== undefined && data.hostTime !== null) {
          setHostTime(data.hostTime);
          if (data.forceApply) {
            setManualTime(data.hostTime);
            setAppliedTime(data.hostTime);
            setCurrentPlaybackSecs(data.hostTime);
            setSyncKey((k) => k + 1);
          }
        }
        if (data.selectedPlayerId && data.selectedPlayerId !== localPlayerRef.current) {
          setSelectedPlayerId(data.selectedPlayerId);
        }
        if (data.isHostOnlyLock !== undefined) setIsHostOnlyLock(data.isHostOnlyLock);
        if (data.hostUsername) setHostUsername(data.hostUsername);
        break;
      }
      case 'CHAT_MESSAGE': {
        if (data.message && data.message.sender !== username) {
          addMessage(data.message);
        }
        break;
      }
      case 'REACTION': {
        if (data.emoji && data.origin !== username) {
          triggerReaction(data.emoji, false);
        }
        break;
      }
      case 'HOST_LOCK_TOGGLED': {
        if (data.isHostOnlyLock !== undefined) {
          setIsHostOnlyLock(data.isHostOnlyLock);
          if (data.hostUsername) setHostUsername(data.hostUsername);
          addMessage({
            id: Date.now().toString(),
            sender: 'System',
            text: data.isHostOnlyLock
              ? `🔒 ${data.hostUsername || 'Host'} enabled Host-Only Control.`
              : `🔓 ${data.hostUsername || 'Host'} enabled Room Control for everyone.`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isSystem: true,
          });
        }
        break;
      }
      case 'REQUEST_HOST_SYNC': {
        if (isHostRef.current) {
          const currentSecs = getCurrentSeconds();
          broadcastData({
            type: 'SYNC_PLAYBACK',
            hostTime: currentSecs,
            selectedPlayerId: localPlayerRef.current,
            isHost: true,
            hostUsername: hostUsernameRef.current,
            isHostOnlyLock: isHostOnlyLockRef.current,
            forceApply: true,
          });
        }
        break;
      }
      default:
        break;
    }
  }, [username, recordPeerHeartbeat, triggerReaction, addMessage, broadcastData, getCurrentSeconds]);

  // Networking lifecycle
  useEffect(() => {
    const net = setupWatchPartyNetworking({
      roomId,
      username,
      isHostRef,
      hostUsernameRef,
      isHostOnlyLockRef,
      getCurrentSeconds,
      onPacketReceived: handleIncomingPacket,
      onConnected: () => setConnectionStatus('connected'),
      onHostStatusChange: (isHostRole) => setIsHost(isHostRole),
      activePeersRef,
      onPeersUpdated: setActivePeers
    });

    networkingRef.current = net;
    return () => net.cleanup();
  }, [roomId, username, handleIncomingPacket, getCurrentSeconds]);

  const syncAllPeers = useCallback(() => {
    if (!isHost && username !== hostUsername) return;
    const currentSecs = getCurrentSeconds();
    setAppliedTime(currentSecs);
    setSyncKey((k) => k + 1);

    broadcastData({
      type: 'SYNC_PLAYBACK',
      hostTime: currentSecs,
      selectedPlayerId,
      isHost: true,
      hostUsername: username,
      isHostOnlyLock: true,
      forceApply: true,
    });
  }, [isHost, username, hostUsername, selectedPlayerId, broadcastData, getCurrentSeconds]);

  const handlePlayerChange = useCallback((newPlayerId) => {
    if (!isHost && username !== hostUsername) return;
    setSelectedPlayerId(newPlayerId);
    localPlayerRef.current = newPlayerId;

    const currentSecs = getCurrentSeconds();
    broadcastData({
      type: 'SYNC_PLAYBACK',
      hostTime: currentSecs,
      selectedPlayerId: newPlayerId,
      isHost: true,
      hostUsername: username,
      isHostOnlyLock: true,
      forceApply: true,
    });
  }, [isHost, username, hostUsername, broadcastData, getCurrentSeconds]);

  const toggleHostOnlyLock = useCallback(() => {
    if (!isHost && username !== hostUsername) return;
    const newLockState = !isHostOnlyLock;
    setIsHostOnlyLock(newLockState);
    isHostOnlyLockRef.current = newLockState;

    broadcastData({
      type: 'HOST_LOCK_TOGGLED',
      isHostOnlyLock: newLockState,
      hostUsername: username,
    });
  }, [isHost, username, hostUsername, isHostOnlyLock, broadcastData]);

  const adjustPlaybackTime = useCallback((deltaSecs) => {
    if (!isHost && username !== hostUsername) return;
    const currentSecs = getCurrentSeconds();
    const newTime = Math.max(0, currentSecs + deltaSecs);
    setManualTime(newTime);
    setAppliedTime(newTime);
    setCurrentPlaybackSecs(newTime);
    setSyncKey((k) => k + 1);

    broadcastData({
      type: 'SYNC_PLAYBACK',
      hostTime: newTime,
      selectedPlayerId,
      isHost: true,
      hostUsername: username,
      isHostOnlyLock: true,
      forceApply: true,
    });
  }, [isHost, username, hostUsername, selectedPlayerId, broadcastData, getCurrentSeconds, setManualTime]);

  const syncToHost = useCallback(() => {
    if (hostTime > 0) {
      setManualTime(hostTime);
      setAppliedTime(hostTime);
      setCurrentPlaybackSecs(hostTime);
      setSyncKey((k) => k + 1);
    } else {
      broadcastData({
        type: 'REQUEST_HOST_SYNC',
        origin: username,
      });
    }
  }, [hostTime, setManualTime, broadcastData, username]);

  return {
    selectedPlayerId,
    setSelectedPlayerId: handlePlayerChange,
    changePlayer: handlePlayerChange,
    connectionStatus,
    currentPlaybackSecs,
    hostTime,
    appliedTime,
    syncKey,
    isHost,
    isHostOnlyLock,
    hostUsername,
    toggleHostOnlyLock,
    toggleHostLock: toggleHostOnlyLock,
    syncAllPeers,
    broadcastSync: syncAllPeers,
    syncToHost,
    adjustPlaybackTime,
    messages,
    sendMessage,
    floatingReactions,
    triggerReaction,
    activePeers: Object.values(activePeers),
    peersList: Object.values(activePeers),
  };
}
