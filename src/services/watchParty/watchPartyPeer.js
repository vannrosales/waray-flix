import { Peer } from 'peerjs';

export function setupWatchPartyPeer({
  roomId,
  isHost,
  onPacketReceived,
  onConnected
}) {
  const cleanRoom = roomId.toLowerCase().replace(/[^a-z0-9]/g, '');
  const hostPeerId = `wf-wp-room-${cleanRoom}`;
  const connections = [];
  let hostConn = null;
  let activePeer = null;

  const peerConfig = {
    config: {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:global.stun.twilio.com:3478' }
      ]
    }
  };

  if (isHost) {
    // Room Host: Register hostPeerId
    const peer = new Peer(hostPeerId, peerConfig);
    activePeer = peer;

    peer.on('open', () => {
      if (onConnected) onConnected();
    });

    peer.on('connection', (conn) => {
      connections.push(conn);
      conn.on('data', (data) => {
        if (onPacketReceived) onPacketReceived(data);
        // Relay to other connected peers
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
      console.warn('Host Peer error:', err?.type || err);
    });
  } else {
    // Guest: Connect directly to hostPeerId
    const guestPeer = new Peer(peerConfig);
    activePeer = guestPeer;

    guestPeer.on('open', () => {
      hostConn = guestPeer.connect(hostPeerId, { reliable: true });
      hostConn.on('open', () => {
        if (onConnected) onConnected();
      });
      hostConn.on('data', (data) => {
        if (onPacketReceived) onPacketReceived(data);
      });
    });

    guestPeer.on('error', (err) => {
      console.warn('Guest Peer error:', err?.type || err);
    });
  }

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
        if (activePeer) activePeer.destroy();
      } catch {
        // ignore
      }
    }
  };
}

