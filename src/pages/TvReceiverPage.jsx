import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CONFIG } from '../config/siteConfig';
import { tvCastService } from '../services/tvCastService';
import { Tv, Sparkles, Wifi, Play, Server, Maximize2, ShieldCheck, CheckCircle2 } from 'lucide-react';
import useDocumentTitle from '../hooks/useDocumentTitle';

export default function TvReceiverPage() {
  const [searchParams] = useSearchParams();
  const urlPin = searchParams.get('pin');

  const [pin, setPin] = useState(urlPin || '');
  const [connectedSender, setConnectedSender] = useState(null);
  const [activeMedia, setActiveMedia] = useState(null);
  const [selectedPlayerId, setSelectedPlayerId] = useState(CONFIG.players[0].id);
  const [overlayNotification, setOverlayNotification] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const notificationTimeoutRef = useRef(null);

  useDocumentTitle(activeMedia ? `📺 Playing: ${activeMedia.title} — WarayFlix TV` : '📺 WarayFlix TV Receiver');

  // Trigger floating on-screen display notification (OSD)
  const showOsd = (text) => {
    setOverlayNotification(text);
    if (notificationTimeoutRef.current) clearTimeout(notificationTimeoutRef.current);
    notificationTimeoutRef.current = setTimeout(() => setOverlayNotification(''), 3500);
  };

  // Initialize TV Receiver mode
  useEffect(() => {
    let unsubscribe = () => {};

    async function startReceiver() {
      const activePin = await tvCastService.initReceiver(urlPin || null);
      setPin(activePin);

      unsubscribe = tvCastService.subscribe((event, data) => {
        switch (event) {
          case 'SENDER_CONNECTED':
            setConnectedSender(data.senderName || 'Connected PC');
            showOsd(`🔗 Connected to ${data.senderName || 'PC'}`);
            break;

          case 'CAST_MEDIA':
            setActiveMedia(data);
            if (data.playerId) setSelectedPlayerId(data.playerId);
            showOsd(`▶ Now Playing: ${data.title}`);
            break;

          case 'CMD_PLAY':
            showOsd('▶ Resumed Playback');
            break;

          case 'CMD_PAUSE':
            showOsd('⏸ Paused');
            break;

          case 'CMD_SEEK':
            if (data.seconds !== undefined) {
              setActiveMedia((prev) => (prev ? { ...prev, startAt: data.seconds } : null));
              showOsd(`⏩ Seeked to ${Math.floor(data.seconds / 60)}m ${data.seconds % 60}s`);
            }
            break;

          case 'CMD_CHANGE_SERVER':
            if (data.playerId) {
              setSelectedPlayerId(data.playerId);
              const p = CONFIG.players.find((item) => item.id === data.playerId);
              showOsd(`🔄 Switched to Server: ${p?.name || data.playerId}`);
            }
            break;

          case 'CMD_NEXT_EPISODE':
            if (data.season && data.episode) {
              setActiveMedia((prev) =>
                prev ? { ...prev, season: data.season, episode: data.episode, startAt: 0 } : null
              );
              showOsd(`⏭ Next Episode: S${data.season} E${data.episode}`);
            }
            break;

          case 'CMD_STOP':
            setActiveMedia(null);
            showOsd('⏹ Playback stopped by PC');
            break;

          default:
            break;
        }
      });
    }

    startReceiver();

    return () => {
      unsubscribe();
      tvCastService.disconnect();
      if (notificationTimeoutRef.current) clearTimeout(notificationTimeoutRef.current);
    };
  }, [urlPin]);

  const activePlayer = useMemo(() => {
    return CONFIG.players.find((p) => p.id === selectedPlayerId) || CONFIG.players[0];
  }, [selectedPlayerId]);

  const embedUrl = useMemo(() => {
    if (!activeMedia) return '';
    const { mediaType, id, season, episode, startAt } = activeMedia;
    return mediaType === 'tv'
      ? activePlayer.getTvUrl(id, season || 1, episode || 1, startAt || 0)
      : activePlayer.getMovieUrl(id, startAt || 0);
  }, [activeMedia, activePlayer]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://warayflix.app';
  const qrConnectUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(
    `${currentOrigin}/cast?pin=${pin}`
  )}&bgcolor=141416&color=FFFFFF&margin=14`;

  return (
    <div className="fixed inset-0 z-50 bg-[#090A0F] text-white flex flex-col items-center justify-center font-sans overflow-hidden select-none">
      {/* ─── ACTIVE STREAM PLAYER ─── */}
      {activeMedia && embedUrl ? (
        <div className="relative w-full h-full bg-black">
          <iframe
            src={embedUrl}
            key={`${selectedPlayerId}-${activeMedia.id}-${activeMedia.season}-${activeMedia.episode}-${activeMedia.startAt}`}
            title="TV Stream Player"
            className="w-full h-full border-0"
            allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          />

          {/* Floating On-Screen-Display (OSD) HUD */}
          {overlayNotification && (
            <div className="absolute top-8 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-2xl bg-black/85 border border-white/20 backdrop-blur-2xl shadow-2xl text-base font-black tracking-wide text-white flex items-center gap-3 animate-fade-in pointer-events-none">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <span>{overlayNotification}</span>
            </div>
          )}

          {/* Top Subtle Status Bar */}
          <div className="absolute top-4 left-6 z-40 flex items-center gap-3 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 opacity-40 hover:opacity-100 transition-opacity">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-bold text-zinc-300">
              Casting: {activeMedia.title} {activeMedia.mediaType === 'tv' && `(S${activeMedia.season}·E${activeMedia.episode})`}
            </span>
            <span className="text-[10px] text-zinc-400 bg-white/10 px-2 py-0.5 rounded font-mono">
              PIN: {pin}
            </span>
          </div>

          <button
            onClick={toggleFullscreen}
            className="absolute bottom-6 right-6 z-40 p-3 rounded-full bg-black/70 hover:bg-black/90 text-zinc-300 hover:text-white border border-white/15 backdrop-blur-md transition cursor-pointer opacity-30 hover:opacity-100"
            title="Toggle Fullscreen"
          >
            <Maximize2 className="w-5 h-5 stroke-[2]" />
          </button>
        </div>
      ) : (
        /* ─── READY TO PAIR STANDBY SCREEN (Smart TV View) ─── */
        <div className="relative w-full h-full flex flex-col items-center justify-center p-6 sm:p-12 text-center bg-radial from-[#181822] via-[#090A0F] to-[#000000]">
          {/* Ambient Glow */}
          <div className="absolute w-[600px] h-[600px] rounded-full bg-cyan-500/10 blur-[140px] pointer-events-none -top-24" />

          {/* Floating On-Screen-Display */}
          {overlayNotification && (
            <div className="absolute top-8 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-2xl bg-black/85 border border-white/20 backdrop-blur-2xl shadow-2xl text-base font-black tracking-wide text-white flex items-center gap-3 animate-fade-in pointer-events-none">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <span>{overlayNotification}</span>
            </div>
          )}

          {/* Main Card */}
          <div className="relative z-10 max-w-2xl w-full bg-[#121216]/80 border border-white/10 backdrop-blur-2xl rounded-3xl p-8 sm:p-12 shadow-2xl space-y-8 animate-fade-in">
            {/* Header Badge */}
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/[0.06] border border-white/10 text-xs font-bold text-zinc-300 uppercase tracking-wider">
              <Tv className="w-4 h-4 text-cyan-400 stroke-[2]" />
              <span>WarayFlix TV Receiver</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-1" />
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
                Ready to Cast
              </h1>
              <p className="text-sm sm:text-base text-zinc-400 max-w-md mx-auto font-medium">
                Enter this 6-digit TV PIN in your WarayFlix Windows app or scan the QR code to stream instantly.
              </p>
            </div>

            {/* 6-Digit PIN Display */}
            <div className="p-6 bg-black/60 rounded-3xl border border-white/15 max-w-md mx-auto shadow-inner space-y-2">
              <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Your TV PIN</span>
              <div className="text-4xl sm:text-6xl font-mono font-black tracking-[0.25em] text-cyan-400 pl-4">
                {pin || '••••••'}
              </div>
            </div>

            {/* QR Code & Status */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-2">
              {pin && (
                <div className="p-3 bg-[#141416] rounded-2xl border border-white/10 shadow-lg">
                  <img
                    src={qrConnectUrl}
                    alt="Scan QR code to connect TV"
                    className="w-36 h-36 rounded-xl object-contain"
                  />
                </div>
              )}

              <div className="text-left space-y-2.5 max-w-xs">
                <div className="flex items-center gap-2 text-xs font-bold text-zinc-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>
                    {connectedSender ? `Paired with: ${connectedSender}` : 'Waiting for connection...'}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-zinc-400 font-medium">
                  <Wifi className="w-4 h-4 text-zinc-400" />
                  <span>Works across any WiFi or Mobile Hotspot</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-zinc-400 font-medium">
                  <ShieldCheck className="w-4 h-4 text-zinc-400" />
                  <span>Zero Ads · Fullscreen Cinema Mode</span>
                </div>
              </div>
            </div>

            {/* Fullscreen Button */}
            <button
              onClick={toggleFullscreen}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-black uppercase tracking-wider transition cursor-pointer shadow-lg hover:scale-105"
            >
              <Maximize2 className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Enter Fullscreen Mode on TV</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
