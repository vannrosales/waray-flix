import { CONFIG } from '../config/siteConfig';

// Multi-server public MQTT broker pool for resilient, zero-server-cost cross-device casting
const MQTT_BROKERS = [
  'wss://broker.emqx.io:8084/mqtt',
  'wss://broker.hivemq.com:8884/mqtt',
  'wss://test.mosquitto.org:8081/mqtt',
];

class TvCastService {
  constructor() {
    this.activePin = null;
    this.isReceiver = false;
    this.mqttClient = null;
    this.listeners = new Set();
    this.broadcastChannel = null;
    this.connected = false;
    this.pairedDeviceName = null;
    this.lastState = null;
  }

  generatePin() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  getTopic(pin) {
    return `warayflix/tv_cast/${pin}`;
  }

  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notify(event, data) {
    this.listeners.forEach((fn) => fn(event, data));
  }

  async initReceiver(customPin = null) {
    this.isReceiver = true;
    this.activePin = customPin || this.generatePin();
    await this._connect(this.activePin);
    return this.activePin;
  }

  async connectToTv(pin, senderName = 'Windows App') {
    this.isReceiver = false;
    this.activePin = pin.trim();
    this.pairedDeviceName = senderName;
    await this._connect(this.activePin);

    this.send({
      type: 'SENDER_CONNECTED',
      senderName,
      timestamp: Date.now(),
    });

    this.connected = true;
    this.notify('CONNECTED', { pin: this.activePin, target: 'TV' });
    return true;
  }

  async _connect(pin) {
    this._cleanup();

    try {
      this.broadcastChannel = new BroadcastChannel(`warayflix_cast_${pin}`);
      this.broadcastChannel.onmessage = (e) => this._handleMessage(e.data);
    } catch {
      // Ignore if unsupported
    }

    try {
      const mqtt = (await import('mqtt')).default;
      const brokerUrl = MQTT_BROKERS[0];
      const clientId = `wf_${this.isReceiver ? 'tv' : 'pc'}_${Math.random().toString(16).slice(2, 8)}`;

      this.mqttClient = mqtt.connect(brokerUrl, {
        clientId,
        clean: true,
        connectTimeout: 5000,
        reconnectPeriod: 3000,
      });

      const topic = this.getTopic(pin);

      this.mqttClient.on('connect', () => {
        this.mqttClient.subscribe(topic, { qos: 1 }, (err) => {
          if (!err) {
            this.connected = true;
            this.notify('READY', { pin });
          }
        });
      });

      this.mqttClient.on('message', (t, payload) => {
        if (t === topic) {
          try {
            const data = JSON.parse(payload.toString());
            this._handleMessage(data);
          } catch {
            // Malformed JSON ignored
          }
        }
      });

      this.mqttClient.on('error', (err) => {
        console.warn('Cast MQTT error:', err);
      });
    } catch (err) {
      console.warn('Failed to load MQTT client for Cast:', err);
    }
  }

  _handleMessage(data) {
    if (!data || !data.type) return;

    if (data.type === 'CAST_MEDIA' || data.type === 'SYNC_STATE') {
      this.lastState = data;
    }

    this.notify(data.type, data);
  }

  send(payload) {
    const message = {
      ...payload,
      pin: this.activePin,
      origin: this.isReceiver ? 'TV' : 'SENDER',
      timestamp: Date.now(),
    };

    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage(message);
      } catch {
        // ignore
      }
    }

    if (this.mqttClient && this.mqttClient.connected) {
      const topic = this.getTopic(this.activePin);
      this.mqttClient.publish(topic, JSON.stringify(message), { qos: 1 });
    }
  }

  castMedia({ media, type, id, season = 1, episode = 1, startAt = 0, playerId = CONFIG.players[0].id }) {
    const payload = {
      type: 'CAST_MEDIA',
      mediaType: type,
      id,
      season: parseInt(season),
      episode: parseInt(episode),
      startAt: Math.floor(startAt),
      playerId,
      title: media?.title || media?.name || 'Now Playing',
      posterPath: media?.poster_path || null,
      backdropPath: media?.backdrop_path || null,
      overview: media?.overview || '',
      voteAverage: media?.vote_average || 0,
      releaseDate: media?.release_date || media?.first_air_date || '',
    };
    this.lastState = payload;
    this.send(payload);
  }

  play() {
    this.send({ type: 'CMD_PLAY' });
  }

  pause() {
    this.send({ type: 'CMD_PAUSE' });
  }

  seek(seconds) {
    this.send({ type: 'CMD_SEEK', seconds: Math.floor(seconds) });
  }

  changeServer(playerId) {
    this.send({ type: 'CMD_CHANGE_SERVER', playerId });
  }

  nextEpisode(season, episode) {
    this.send({
      type: 'CMD_NEXT_EPISODE',
      season: parseInt(season),
      episode: parseInt(episode),
    });
  }

  stopCasting() {
    this.send({ type: 'CMD_STOP' });
    this.disconnect();
  }

  disconnect() {
    this._cleanup();
    this.connected = false;
    this.activePin = null;
    this.lastState = null;
    this.notify('DISCONNECTED', {});
  }

  _cleanup() {
    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.close();
      } catch {
        // ignore
      }
      this.broadcastChannel = null;
    }

    if (this.mqttClient) {
      try {
        this.mqttClient.end(true);
      } catch {
        // ignore
      }
      this.mqttClient = null;
    }
  }
}

export const tvCastService = new TvCastService();
