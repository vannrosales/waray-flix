import { Peer } from 'peerjs';

export function setupWatchPartyPeer({
  roomId,
  onPacketReceived,
  onConnected,
  onHostStatusChange
}) {
  const cleanRoom = roomId.toLowerCase().replace(/[^a-z0-9]/g, '');
  const hostPeerId = `wf-wp-room-${cleanRoom}`;
  const connections = [];
  let hostConn = null;

  // Try hosting
  const peer = new Peer(hostPeerId, {
    config: {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:global.stun.twilio.com:3478' }
      ]
    }
  });

  peer.on('open', () => {
    if (onHostStatusChange) onHostStatusChange(true);
    if (onConnected) onConnected();
  });

  peer.on('connection', (conn) => {
    connections.push(conn);
    conn.on('data', (data) => {
      if (onPacketReceived) onPacketReceived(data);
      // Relay to other peers
      connections.forEach((c) => {
        if (c !== conn && c.open) c.send(data);
      });
    });
    conn.on('close', () => {
      const idx = connections.indexOf(conn);
      if (idx !== -1) connections.splice(idx, 1);
    });
  });

  peer.on('error', (err) => {
    if (err.type === 'unavailable-id') {
      // Room host already exists, connect as guest
      if (onHostStatusChange) onHostStatusChange(false);
      const guestPeer = new Peer({
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:global.stun.twilio.com:3478' }
          ]
        }
      });
      guestPeer.on('open', () => {
        hostConn = guestPeer.connect(hostPeerId, { reliable: true });
        hostConn.on('open', () => {
          if (onConnected) onConnected();
        });
        hostConn.on('data', (data) => {
          if (onPacketReceived) onPacketReceived(data);
        });
      });
    }
  });

  return {
    sendData: (packet) => {
      connections.forEach((conn) => {
        if (conn.open) conn.send(packet);
      });
      if (hostConn && hostConn.open) {
        hostConn.send(packet);
      }
    },
    destroy: () => {
      try {
        peer.destroy();
      } catch {
        // ignore
      }
    }
  };
}

