import React from 'react';
import { useLocation } from 'react-router-dom';
import { Maximize2, X, Film, Tv } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { CONFIG } from '../config/siteConfig';

export default function FloatingMiniPlayer() {
  const { activeMedia, isPiPActive, closePiP, expandPiP } = usePlayer();
  const location = useLocation();

  // Hide mini player if not active or if currently on WatchPage or WatchPartyPage
  if (!isPiPActive || !activeMedia || location.pathname.startsWith('/watch') || location.pathname.startsWith('/party')) {
    return null;
  }

  const { type, id, season, episode, title, selectedPlayerId, currentTime } = activeMedia;
  const activePlayer = CONFIG.players.find((p) => p.id === selectedPlayerId) || CONFIG.players[0];

  const embedUrl = type === 'movie'
    ? activePlayer.getMovieUrl(id, currentTime)
    : activePlayer.getTvUrl(id, season || 1, episode || 1, currentTime);

  return (
    <div 
      className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 w-72 sm:w-84 md:w-96 aspect-video bg-[#0E1017] border border-white/15 rounded-2xl overflow-hidden shadow-2xl group animate-slide-up flex flex-col select-none"
    >
      {/* Top Hover Controls Header */}
      <div className="absolute top-0 inset-x-0 p-2.5 bg-gradient-to-b from-black/90 via-black/50 to-transparent z-20 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <div className="flex items-center gap-1.5 min-w-0 pr-2">
          {type === 'tv' ? (
            <Tv className="w-3.5 h-3.5 text-zinc-400 stroke-[1.5] flex-shrink-0" />
          ) : (
            <Film className="w-3.5 h-3.5 text-zinc-400 stroke-[1.5] flex-shrink-0" />
          )}
          <span className="text-[11px] font-medium text-white truncate font-['Outfit']">
            {title || 'Now Playing'}
          </span>
          {type === 'tv' && (
            <span className="text-[10px] font-mono text-zinc-400 flex-shrink-0">
              S{season}E{episode}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={expandPiP}
            className="p-1.5 rounded-full bg-black/60 hover:bg-black text-zinc-300 hover:text-white border border-white/15 transition cursor-pointer backdrop-blur-md"
            title="Expand to Fullscreen Player"
            aria-label="Expand player"
          >
            <Maximize2 className="w-3.5 h-3.5 stroke-[1.5]" />
          </button>

          <button
            onClick={closePiP}
            className="p-1.5 rounded-full bg-black/60 hover:bg-black text-zinc-300 hover:text-white border border-white/15 transition cursor-pointer backdrop-blur-md"
            title="Close Mini Player"
            aria-label="Close player"
          >
            <X className="w-3.5 h-3.5 stroke-[1.5]" />
          </button>
        </div>
      </div>

      {/* Embedded Video Stream */}
      <div className="w-full h-full bg-black relative">
        <iframe
          src={embedUrl}
          title="Floating Mini Player"
          className="w-full h-full border-0 pointer-events-auto"
          allowFullScreen
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        />
      </div>
    </div>
  );
}

