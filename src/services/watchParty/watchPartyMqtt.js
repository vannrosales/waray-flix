import mqtt from 'mqtt';

export function connectWatchPartyMqtt(roomId, onPacketReceived, onConnected, onError) {
  const cleanRoom = roomId.toLowerCase().replace(/[^a-z0-9]/g, '');
  const topic = `warayflix/rooms/${cleanRoom}`;

  const client = mqtt.connect('wss://broker.emqx.io:8084/mqtt', {
    clientId: `warayflix_${Math.random().toString(16).slice(2, 8)}`,
    clean: true,
    connectTimeout: 8000,
    keepalive: 20,
    reconnectPeriod: 2000,
  });

  client.on('connect', () => {
    client.subscribe(topic, { qos: 0 }, (err) => {
      if (!err && onConnected) onConnected();
    });
  });

  client.on('message', (t, message) => {
    try {
      const packet = JSON.parse(message.toString());
      if (packet && onPacketReceived) {
        onPacketReceived(packet);
      }
    } catch {
      // ignore
    }
  });

  client.on('error', (err) => {
    if (onError) onError(err);
  });

  return {
    client,
    publish: (packet) => {
      if (client && client.connected) {
        client.publish(topic, JSON.stringify(packet));
      }
    },
    disconnect: () => {
      try {
        client.end(true);
      } catch {
        // ignore
      }
    }
  };
}

