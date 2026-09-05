import { connectWatchPartyMqtt } from './watchPartyMqtt';
import { setupWatchPartyPeer } from './watchPartyPeer';
import { setupWatchPartySupabase } from './watchPartySupabase';

export function setupWatchPartyNetworking({
  roomId,
  username,
  isHostRef,
  hostUsernameRef,
  isHostOnlyLockRef,
  getCurrentSeconds,
  onPacketReceived,
  onConnected,
  onHostStatusChange,
  activePeersRef,
  onPeersUpdated
}) {
  let channel = null;
  try {
    channel = new BroadcastChannel(`warayflix_wp_${roomId}`);
    channel.onmessage = (event) => onPacketReceived(event.data);
  } catch {
    // ignore
  }

  const mqttManager = connectWatchPartyMqtt(
    roomId,
    onPacketReceived,
    onConnected
  );

  const peerManager = setupWatchPartyPeer({
    roomId,
    onPacketReceived,
    onConnected,
    onHostStatusChange
  });

  const supabaseManager = setupWatchPartySupabase({
    roomId,
    onPacketReceived,
    onConnected
  });

  const broadcastData = (data) => {
    const packetId = data.packetId || `${Date.now()}-${Math.random()}`;
    const packet = { ...data, packetId, origin: username };

    if (channel) channel.postMessage(packet);
    if (mqttManager) mqttManager.publish(packet);
    if (peerManager) peerManager.sendData(packet);
    if (supabaseManager) supabaseManager.sendData(packet);
  };

  const hbInterval = setInterval(() => {
    const currentSecs = getCurrentSeconds();
    broadcastData({
      type: 'HEARTBEAT',
      origin: username,
      isHost: isHostRef.current,
      hostUsername: hostUsernameRef.current,
      isHostOnlyLock: isHostOnlyLockRef.current,
      currentTime: currentSecs,
    });

    const now = Date.now();
    const updated = { ...activePeersRef.current };
    let changed = false;
    Object.keys(updated).forEach((peerKey) => {
      if (peerKey !== username && now - updated[peerKey].lastSeen > 20000) {
        delete updated[peerKey];
        changed = true;
      }
    });
    if (changed && onPeersUpdated) {
      activePeersRef.current = updated;
      onPeersUpdated({ ...updated });
    }
  }, 4000);

  return {
    broadcastData,
    cleanup: () => {
      clearInterval(hbInterval);
      if (channel) channel.close();
      mqttManager.disconnect();
      peerManager.destroy();
      if (supabaseManager) supabaseManager.destroy();
    }
  };
}

