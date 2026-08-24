import { useState, useEffect, useRef, useCallback } from 'react';
import { Peer } from 'peerjs';
import { CONFIG } from '../config/siteConfig';

export function useWatchParty(roomId, username, initialPlayerId = CONFIG.players[0].id) {
  const [selectedPlayerId, setSelectedPlayerId] = useState(initialPlayerId);
  const [connectionStatus, setConnectionStatus] = useState('connecting'); // 'connected' | 'connecting' | 'offline'

  // Playback Sync State
  const [currentPlaybackSecs, setCurrentPlaybackSecs] = useState(0);
  const [hostTime, setHostTime] = useState(0);
  const [appliedTime, setAppliedTime] = useState(0);

  // Chat & Reactions
  const [messages, setMessages] = useState([
    { id: 'sys-1', sender: 'System', text: `Room #${roomId} active. Share invite link to sync playback.`, time: 'Just now', isSystem: true }
  ]);
  const [floatingReactions, setFloatingReactions] = useState([]);
  
  // Real-Time Active Peers Presence
  const [activePeers, setActivePeers] = useState({
    [username]: { username, lastSeen: Date.now(), isHost: true }
  });

  const channelRef = useRef(null);
  const localTimeRef = useRef(0);
  const localPlayerRef = useRef(selectedPlayerId);
  const peerRef = useRef(null);
  const connectionsRef = useRef([]);
  const hostConnRef = useRef(null);
  const activePeersRef = useRef({
    [username]: { username, lastSeen: Date.now(), isHost: true }
  });

  useEffect(() => {
    localPlayerRef.current = selectedPlayerId;
  }, [selectedPlayerId]);

  // Broadcast helper across WebRTC peers and BroadcastChannel
  const broadcastData = useCallback((data) => {
    if (channelRef.current) {
      channelRef.current.postMessage(data);
    }
    connectionsRef.current.forEach((conn) => {
      if (conn.open) conn.send(data);
    });
    if (hostConnRef.current && hostConnRef.current.open) {
      hostConnRef.current.send(data);
    }
  }, []);

  const triggerReaction = useCallback((emoji, broadcast = true) => {
    const reactionId = Date.now() + Math.random();
    const newReaction = {
      id: reactionId,
      emoji,
      left: Math.floor(20 + Math.random() * 60),
    };

    setFloatingReactions((prev) => [...prev, newReaction]);
    setTimeout(() => {
      setFloatingReactions((prev) => prev.filter((r) => r.id !== reactionId));
    }, 2000);

    if (broadcast) {
      broadcastData({ type: 'REACTION', emoji });
    }
  }, [broadcastData]);

  // Update peer presence timestamp
  const recordPeerHeartbeat = useCallback((peerName, isHost = false) => {
    if (!peerName) return;
    activePeersRef.current[peerName] = {
      username: peerName,
      lastSeen: Date.now(),
      isHost
    };
    setActivePeers({ ...activePeersRef.current });
  }, []);

  // Remove peer on disconnect
  const removePeer = useCallback((peerName) => {
    if (!peerName || peerName === username) return;
    delete activePeersRef.current[peerName];
    setActivePeers({ ...activePeersRef.current });
    setMessages((prev) => [
      ...prev,
      { id: `sys-${Date.now()}`, sender: 'System', text: `${peerName} disconnected.`, time: 'Now', isSystem: true }
    ]);
  }, [username]);

  // Process incoming data packet
  const handleIncomingData = useCallback((data) => {
    if (!data) return;

    if (data.type === 'CHAT_MESSAGE') {
      setMessages((prev) => {
        if (prev.some(m => m.id === data.message.id)) return prev;
        return [...prev, data.message];
      });
    } else if (data.type === 'REACTION') {
      triggerReaction(data.emoji, false);
    } else if (data.type === 'HEARTBEAT' || data.type === 'USER_PRESENT') {
      recordPeerHeartbeat(data.username, data.isHost);
      if (data.currentTime > 0) {
        setHostTime(data.currentTime);
        if (localTimeRef.current === 0) {
          setAppliedTime(data.currentTime);
          setCurrentPlaybackSecs(data.currentTime);
          localTimeRef.current = data.currentTime;
        }
      }
    } else if (data.type === 'USER_JOINED') {
      recordPeerHeartbeat(data.username, false);
      setMessages((prev) => [
        ...prev, 
        { id: `sys-${Date.now()}`, sender: 'System', text: `${data.username} connected.`, time: 'Now', isSystem: true }
      ]);
      // Reply with current state snapshot & announce presence
      broadcastData({
        type: 'USER_PRESENT',
        username,
        currentTime: localTimeRef.current,
        player: localPlayerRef.current,
        isHost: true
      });
    } else if (data.type === 'USER_LEFT') {
      removePeer(data.username);
    } else if (data.type === 'TIMESTAMP_BEAT') {
      setHostTime(data.time);
      recordPeerHeartbeat(data.from, true);
    } else if (data.type === 'FORCE_SYNC') {
      setHostTime(data.time);
      setAppliedTime(data.time);
      setCurrentPlaybackSecs(data.time);
      localTimeRef.current = data.time;
      if (data.player) setSelectedPlayerId(data.player);
      setMessages((prev) => [
        ...prev,
        { id: `sys-${Date.now()}`, sender: 'System', text: `Room synchronized to ${formatTime(data.time)}.`, time: 'Now', isSystem: true }
      ]);
    }
  }, [triggerReaction, username, broadcastData, recordPeerHeartbeat, removePeer]);

  // Periodic heartbeat & stale peer pruning
  useEffect(() => {
    const heartbeatInterval = setInterval(() => {
      // 1. Refresh self timestamp
      activePeersRef.current[username] = {
        username,
        lastSeen: Date.now(),
        isHost: true
      };

      // 2. Broadcast heartbeat to peers
      broadcastData({
        type: 'HEARTBEAT',
        username,
        currentTime: localTimeRef.current,
        player: localPlayerRef.current
      });

      // 3. Prune inactive peers (> 8 seconds without heartbeat)
      const now = Date.now();
      let changed = false;
      Object.keys(activePeersRef.current).forEach((peerKey) => {
        if (peerKey !== username && now - activePeersRef.current[peerKey].lastSeen > 8000) {
          delete activePeersRef.current[peerKey];
          changed = true;
        }
      });

      if (changed) {
        setActivePeers({ ...activePeersRef.current });
      }
    }, 3000);

    return () => clearInterval(heartbeatInterval);
  }, [username, broadcastData]);

  // Handle window unload / leave
  useEffect(() => {
    const handleUnload = () => {
      broadcastData({ type: 'USER_LEFT', username });
    };

    window.addEventListener('beforeunload', handleUnload);
    return () => window.removeEventListener('beforeunload', handleUnload);
  }, [username, broadcastData]);

  // Setup WebRTC and BroadcastChannel
  useEffect(() => {
    const channelName = `warayflix_room_${roomId}`;
    const channel = new BroadcastChannel(channelName);
    channelRef.current = channel;

    channel.onmessage = (event) => handleIncomingData(event.data);

    const cleanRoom = roomId.toLowerCase().replace(/[^a-z0-9]/g, '');
    const hostPeerId = `wf-host-${cleanRoom}`;
    const myPeerId = `wf-peer-${cleanRoom}-${Math.floor(1000 + Math.random() * 9000)}`;

    let peerInstance = null;

    try {
      peerInstance = new Peer(hostPeerId, {
        debug: 0,
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' }
          ]
        }
      });

      peerInstance.on('open', () => setConnectionStatus('connected'));

      peerInstance.on('connection', (conn) => {
        connectionsRef.current.push(conn);
        conn.on('data', (data) => handleIncomingData(data));
        conn.on('close', () => {
          removePeer(conn.peer);
        });
        conn.on('open', () => {
          conn.send({
            type: 'FORCE_SYNC',
            time: localTimeRef.current,
            player: localPlayerRef.current
          });
        });
      });

      peerInstance.on('error', (err) => {
        if (err.type === 'unavailable-id') {
          peerInstance.destroy();
          const clientPeer = new Peer(myPeerId, {
            debug: 0,
            config: {
              iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' }
              ]
            }
          });

          clientPeer.on('open', () => {
            setConnectionStatus('connected');
            const conn = clientPeer.connect(hostPeerId);
            hostConnRef.current = conn;

            conn.on('open', () => {
              conn.send({ type: 'USER_JOINED', username });
            });
            conn.on('data', (data) => handleIncomingData(data));
            conn.on('close', () => {
              setConnectionStatus('offline');
            });
          });

          peerRef.current = clientPeer;
        }
      });

      peerRef.current = peerInstance;
    } catch (err) {
      console.warn("PeerJS fallback:", err);
    }

    broadcastData({ type: 'USER_JOINED', username });

    return () => {
      broadcastData({ type: 'USER_LEFT', username });
      channel.close();
      if (peerRef.current) peerRef.current.destroy();
    };
  }, [roomId, username, handleIncomingData, broadcastData, removePeer]);

  // Iframe progress listener
  useEffect(() => {
    function handlePlayerMessage(event) {
      if (event.data) {
        const rawTime = event.data.currentTime || (event.data.data && event.data.data.time);
        if (typeof rawTime === 'number' && rawTime > 0) {
          const currentSecs = Math.floor(rawTime);
          setCurrentPlaybackSecs(currentSecs);
          localTimeRef.current = currentSecs;

          broadcastData({
            type: 'TIMESTAMP_BEAT',
            time: currentSecs,
            from: username,
            player: selectedPlayerId
          });
        }
      }
    }

    window.addEventListener('message', handlePlayerMessage);
    return () => window.removeEventListener('message', handlePlayerMessage);
  }, [username, selectedPlayerId, broadcastData]);

  const sendMessage = useCallback((text) => {
    if (!text.trim()) return;
    const newMsg = {
      id: `msg-${Date.now()}-${Math.random()}`,
      sender: username,
      text: text.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSystem: false
    };
    setMessages((prev) => [...prev, newMsg]);
    broadcastData({ type: 'CHAT_MESSAGE', message: newMsg });
  }, [username, broadcastData]);

  const syncToHost = useCallback(() => {
    const targetTime = hostTime > 0 ? hostTime : currentPlaybackSecs;
    if (targetTime > 0) {
      setAppliedTime(targetTime);
      setCurrentPlaybackSecs(targetTime);
      localTimeRef.current = targetTime;
    }
  }, [hostTime, currentPlaybackSecs]);

  const broadcastSync = useCallback(() => {
    const targetTime = currentPlaybackSecs > 0 ? currentPlaybackSecs : hostTime;
    if (targetTime > 0) {
      broadcastData({
        type: 'FORCE_SYNC',
        time: targetTime,
        player: selectedPlayerId,
        from: username
      });
      setAppliedTime(targetTime);
      setMessages((prev) => [
        ...prev,
        { id: `sys-${Date.now()}`, sender: 'System', text: `Broadcasted sync at ${formatTime(targetTime)}.`, time: 'Now', isSystem: true }
      ]);
    }
  }, [currentPlaybackSecs, hostTime, selectedPlayerId, username, broadcastData]);

  const changePlayer = useCallback((playerId) => {
    setSelectedPlayerId(playerId);
    broadcastData({
      type: 'FORCE_SYNC',
      time: currentPlaybackSecs,
      player: playerId,
      from: username
    });
  }, [currentPlaybackSecs, username, broadcastData]);

  const peersList = Object.values(activePeers);

  return {
    selectedPlayerId,
    appliedTime,
    currentPlaybackSecs,
    hostTime,
    connectionStatus,
    messages,
    floatingReactions,
    peersList,
    viewerCount: peersList.length,
    sendMessage,
    triggerReaction,
    syncToHost,
    broadcastSync,
    changePlayer
  };
}

export function formatTime(seconds) {
  if (!seconds || isNaN(seconds) || seconds <= 0) return '00:00';
  const totalSecs = Math.floor(seconds);
  const mins = Math.floor(totalSecs / 60);
  const secs = Math.floor(totalSecs % 60);
  const hrs = Math.floor(mins / 60);
  if (hrs > 0) {
    const remMins = mins % 60;
    return `${hrs}:${String(remMins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
  return `${mins}:${String(secs).padStart(2, '0')}`;
}
