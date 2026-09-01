import React, { useState, useEffect } from 'react';
import { Tv, Play, Pause, RotateCcw, RotateCw, SkipForward, X, Server, Radio } from 'lucide-react';
import { tvCastService } from '../../services/tvCastService';
import { CONFIG } from '../../config/siteConfig';

export default function CastRemoteBar({ onOpenCastModal }) {
  const [isConnected, setIsConnected] = useState(tvCastService.connected);
  const [activeMedia, setActiveMedia] = useState(tvCastService.lastState);
  const [isPlaying, setIsPlaying] = useState(true);
  const [activePin, setActivePin] = useState(tvCastService.activePin);
  const [serverDropdownOpen, setServerDropdownOpen] = useState(false);

  useEffect(() => {
    setIsConnected(tvCastService.connected);
    setActiveMedia(tvCastService.lastState);
    setActivePin(tvCastService.activePin);

    const unsubscribe = tvCastService.subscribe((event, data) => {
      if (event === 'CONNECTED' || event === 'READY') {
        setIsConnected(true);
        setActivePin(tvCastService.activePin);
      } else if (event === 'DISCONNECTED') {
        setIsConnected(false);
        setActiveMedia(null);
        setActivePin(null);
      } else if (event === 'CAST_MEDIA') {
        setActiveMedia(data);
        setIsPlaying(true);
      } else if (event === 'CMD_PLAY') {
        setIsPlaying(true);
      } else if (event === 'CMD_PAUSE') {
        setIsPlaying(false);
      }
    });

    return () => unsubscribe();
  }, []);

  if (!isConnected || !activeMedia) return null;

  const handleTogglePlay = () => {
    if (isPlaying) {
      tvCastService.pause();
      setIsPlaying(false);
    } else {
      tvCastService.play();
      setIsPlaying(true);
    }
  };

  const handleSeekRelative = (seconds) => {
    const current = activeMedia.startAt || 0;
    const target = Math.max(0, current + seconds);
    setActiveMedia((prev) => ({ ...prev, startAt: target }));
    tvCastService.seek(target);
  };

  const handleSelectServer = (playerId) => {
    tvCastService.changeServer(playerId);
    setActiveMedia((prev) => ({ ...prev, playerId }));
    setServerDropdownOpen(false);
  };

  const handleNextEpisode = () => {
    if (activeMedia.mediaType !== 'tv') return;
    const nextEp = (activeMedia.episode || 1) + 1;
    tvCastService.nextEpisode(activeMedia.season || 1, nextEp);
    setActiveMedia((prev) => ({ ...prev, episode: nextEp, startAt: 0 }));
  };

  const handleStopCasting = () => {
    tvCastService.stopCasting();
    setIsConnected(false);
  };

  const activePlayer = CONFIG.players.find((p) => p.id === activeMedia.playerId) || CONFIG.players[0];

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-2xl bg-[#141418]/95 border border-cyan-500/30 backdrop-blur-2xl rounded-2xl shadow-2xl p-3 sm:px-4 sm:py-2.5 flex items-center justify-between gap-2.5 animate-slide-up select-none">
      {/* LEFT: TV Icon + Title info */}
      <div className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer" onClick={onOpenCastModal}>
        <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 flex-shrink-0">
          <Tv className="w-4 h-4 stroke-[2]" />
        </div>

        <div className="min-w-0 flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-cyan-400 flex items-center gap-1">
              <Radio className="w-2.5 h-2.5 animate-pulse text-emerald-400" />
              Casting to TV ({activePin})
            </span>
          </div>
          <h4 className="text-xs font-bold text-white truncate max-w-[150px] sm:max-w-[240px]">
            {activeMedia.title}
          </h4>
        </div>
      </div>

      {/* CENTER: Playback Controls */}
      <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
        {/* Rewind 10s */}
        <button
          onClick={() => handleSeekRelative(-10)}
          className="p-1.5 sm:p-2 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white transition cursor-pointer"
          title="Rewind 10s"
        >
          <RotateCcw className="w-3.5 h-3.5 stroke-[2]" />
        </button>

        {/* Play/Pause */}
        <button
          onClick={handleTogglePlay}
          className="p-2 sm:p-2.5 rounded-full bg-white hover:bg-zinc-200 text-black transition cursor-pointer shadow-md hover:scale-105"
          title={isPlaying ? 'Pause TV' : 'Play on TV'}
        >
          {isPlaying ? (
            <Pause className="w-4 h-4 fill-black stroke-0" />
          ) : (
            <Play className="w-4 h-4 fill-black stroke-0" />
          )}
        </button>

        {/* Forward 10s */}
        <button
          onClick={() => handleSeekRelative(10)}
          className="p-1.5 sm:p-2 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white transition cursor-pointer"
          title="Forward 10s"
        >
          <RotateCw className="w-3.5 h-3.5 stroke-[2]" />
        </button>

        {/* Next Ep if TV */}
        {activeMedia.mediaType === 'tv' && (
          <button
            onClick={handleNextEpisode}
            className="p-1.5 sm:p-2 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white transition cursor-pointer"
            title="Next Episode"
          >
            <SkipForward className="w-3.5 h-3.5 stroke-[2]" />
          </button>
        )}

        {/* Server Switcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => setServerDropdownOpen(!serverDropdownOpen)}
            className="px-2.5 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/10 text-zinc-300 text-xs font-bold border border-white/10 flex items-center gap-1.5 transition cursor-pointer"
            title="Switch TV Server"
          >
            <Server className="w-3 h-3 text-cyan-400" />
            <span className="hidden sm:inline">{activePlayer.name}</span>
          </button>

          {serverDropdownOpen && (
            <div className="absolute bottom-full mb-2 right-0 w-36 bg-[#18181C] border border-white/15 rounded-xl shadow-2xl p-1 z-50 space-y-0.5">
              {CONFIG.players.map((p) => (
                <button
                  key={p.id}
                  onClick={() => handleSelectServer(p.id)}
                  className={`w-full text-left px-2.5 py-1.5 text-xs rounded-lg font-bold transition flex items-center justify-between cursor-pointer ${
                    p.id === activePlayer.id
                      ? 'bg-cyan-500/20 text-cyan-300'
                      : 'text-zinc-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <span>{p.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT: Disconnect */}
      <button
        onClick={handleStopCasting}
        className="p-1.5 rounded-full bg-white/[0.06] hover:bg-red-500/20 text-zinc-400 hover:text-red-400 border border-white/10 transition cursor-pointer flex-shrink-0"
        title="Disconnect Cast"
      >
        <X className="w-4 h-4 stroke-[1.5]" />
      </button>
    </div>
  );
}
