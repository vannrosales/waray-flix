import React, { useState, useEffect } from 'react';
import { X, Tv, Cast, Wifi, ArrowRight, Smartphone, Check, Loader2, Play, Radio, Volume2 } from 'lucide-react';
import { tvCastService } from '../../services/tvCastService';

export default function CastModal({
  isOpen,
  onClose,
  media,
  type,
  id,
  season = 1,
  episode = 1,
  currentSeconds = 0,
  selectedPlayerId,
  onCastStarted,
}) {
  const [pinInput, setPinInput] = useState('');
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState('');
  const [isConnected, setIsConnected] = useState(tvCastService.connected);
  const [activePin, setActivePin] = useState(tvCastService.activePin);

  useEffect(() => {
    setIsConnected(tvCastService.connected);
    setActivePin(tvCastService.activePin);

    const unsubscribe = tvCastService.subscribe((event, data) => {
      if (event === 'CONNECTED' || event === 'READY') {
        setIsConnected(true);
        setActivePin(tvCastService.activePin);
        setConnecting(false);
      } else if (event === 'DISCONNECTED') {
        setIsConnected(false);
        setActivePin(null);
      }
    });

    return () => unsubscribe();
  }, []);

  if (!isOpen) return null;

  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://warayflix.app';
  const tvUrl = `${currentOrigin}/tv`;

  const handleConnectPin = async (e) => {
    e?.preventDefault();
    const cleanPin = pinInput.trim();
    if (!cleanPin || cleanPin.length < 4) {
      setError('Please enter a valid 6-digit PIN.');
      return;
    }

    try {
      setConnecting(true);
      setError('');
      await tvCastService.connectToTv(cleanPin, 'Windows App');
      
      // Immediately stream the media to the TV
      tvCastService.castMedia({
        media,
        type,
        id,
        season,
        episode,
        startAt: currentSeconds,
        playerId: selectedPlayerId,
      });

      if (onCastStarted) onCastStarted();
      setTimeout(() => onClose(), 1200);
    } catch (err) {
      console.error('Failed to connect to TV:', err);
      setError('Failed to reach TV. Make sure the TV page is open.');
    } finally {
      setConnecting(false);
    }
  };

  const handleCastCurrentMedia = () => {
    tvCastService.castMedia({
      media,
      type,
      id,
      season,
      episode,
      startAt: currentSeconds,
      playerId: selectedPlayerId,
    });
    if (onCastStarted) onCastStarted();
    onClose();
  };

  const handleDisconnect = () => {
    tvCastService.stopCasting();
    setIsConnected(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-[#18181C] border border-white/[0.12] rounded-3xl overflow-hidden shadow-2xl animate-slide-up p-6 space-y-6 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Outlined Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-zinc-400 hover:text-white border border-white/10 transition cursor-pointer"
          aria-label="Close"
        >
          <X className="w-4 h-4 stroke-[1.5]" />
        </button>

        {/* Header */}
        <div className="space-y-1 pt-1">
          <div className="flex items-center justify-center gap-1.5 text-xs text-cyan-400 font-bold uppercase tracking-wider">
            <Tv className="w-4 h-4 stroke-[2]" />
            <span>Cast to Smart TV</span>
          </div>
          <h3 className="text-xl font-bold text-white tracking-tight">
            {media?.title || media?.name || 'Now Playing'}
          </h3>
        </div>

        {/* If already connected, show active controller quick switch */}
        {isConnected ? (
          <div className="space-y-4 bg-emerald-500/10 border border-emerald-500/20 p-5 rounded-2xl">
            <div className="flex items-center justify-center gap-2 text-emerald-400 font-bold text-sm">
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>Connected to TV (PIN: {activePin})</span>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={handleCastCurrentMedia}
                className="px-5 py-2.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-black text-xs font-black uppercase tracking-wider flex items-center gap-2 transition cursor-pointer shadow-md hover:scale-105"
              >
                <Play className="w-3.5 h-3.5 fill-black stroke-0" />
                <span>Stream This Title to TV</span>
              </button>

              <button
                onClick={handleDisconnect}
                className="px-4 py-2.5 rounded-xl bg-white/[0.06] hover:bg-red-500/20 text-zinc-300 hover:text-red-400 border border-white/10 text-xs font-bold transition cursor-pointer"
              >
                Disconnect
              </button>
            </div>
          </div>
        ) : (
          /* Step-by-Step Instructions & PIN Entry */
          <div className="space-y-5">
            <div className="p-4 bg-[#141416] rounded-2xl border border-white/10 text-left space-y-3">
              <div className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-white/10 text-white text-[11px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                  1
                </span>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  On your Smart TV or Chromecast browser, open:{' '}
                  <span className="font-mono text-cyan-400 font-bold underline select-all">{tvUrl}</span>
                </p>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-white/10 text-white text-[11px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                  2
                </span>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  Enter the 6-digit PIN displayed on your TV screen below:
                </p>
              </div>
            </div>

            {/* PIN Form */}
            <form onSubmit={handleConnectPin} className="space-y-3">
              <div className="relative">
                <input
                  type="text"
                  maxLength={6}
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="Enter 6-Digit PIN"
                  className="w-full bg-[#141416] text-center text-2xl font-mono font-bold text-white tracking-[0.25em] py-3 px-4 rounded-2xl border border-white/15 focus:border-cyan-400 focus:outline-none placeholder:text-zinc-600 placeholder:tracking-normal placeholder:text-sm placeholder:font-sans"
                  autoFocus
                />
              </div>

              {error && <p className="text-xs text-red-400 font-semibold">{error}</p>}

              <button
                type="submit"
                disabled={connecting || pinInput.length < 4}
                className="w-full py-3.5 rounded-2xl bg-white hover:bg-zinc-200 text-black text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition cursor-pointer shadow-lg hover:scale-[1.02] disabled:opacity-40 disabled:cursor-not-allowed disabled:scale-100"
              >
                {connecting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin stroke-[2.5]" />
                    <span>Connecting to TV...</span>
                  </>
                ) : (
                  <>
                    <Cast className="w-4 h-4 stroke-[2]" />
                    <span>Connect & Start Casting</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        <div className="flex items-center justify-center gap-4 text-[11px] text-zinc-500 font-medium pt-1 border-t border-white/[0.06]">
          <span className="flex items-center gap-1.5">
            <Radio className="w-3 h-3 text-emerald-400" /> WebRTC / MQTT Direct
          </span>
          <span>·</span>
          <span>Works on LG, Samsung, Sony, Roku & Apple TV</span>
        </div>
      </div>
    </div>
  );
}
