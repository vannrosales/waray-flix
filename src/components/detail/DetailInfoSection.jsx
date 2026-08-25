import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Star, Clock, Bookmark, Layers, QrCode, ArrowRight, Users2, Film } from 'lucide-react';

export default function DetailInfoSection({
  media,
  type,
  poster,
  releaseYear,
  runtime,
  watchProgress,
  progressPercent,
  totalSeconds,
  isAdded,
  user,
  onPlayClick,
  onToggleWatchlist,
  onOpenParty,
  onOpenShare
}) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col md:flex-row gap-8 items-start -mt-20 sm:-mt-28">
      {/* Floating Poster Card */}
      <div className="w-44 sm:w-56 md:w-60 flex-shrink-0 aspect-[2/3] rounded-3xl overflow-hidden bg-[#18181C] border border-white/10 shadow-2xl relative hidden sm:block">
        {poster ? (
          <img src={poster} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-zinc-500">
            <Film className="w-8 h-8 opacity-30 stroke-[1.5]" />
          </div>
        )}
      </div>

      {/* Metadata & Actions */}
      <div className="flex-1 space-y-5 pt-4 sm:pt-8">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-400 font-mono">
            <span className="px-2.5 py-0.5 rounded-full bg-white text-black font-bold uppercase text-[10px] shadow-sm">
              {type}
            </span>
            <span className="text-white font-bold text-xs">{releaseYear}</span>
            <span>·</span>
            {media.vote_average > 0 && (
              <>
                <span className="flex items-center gap-1 text-white font-bold">
                  <Star className="w-3.5 h-3.5 text-white fill-white stroke-[1.5]" /> {media.vote_average.toFixed(1)}
                </span>
                <span>·</span>
              </>
            )}
            {runtime && (
              <span className="flex items-center gap-1 text-zinc-400 font-medium">
                <Clock className="w-3.5 h-3.5 stroke-[1.5]" /> {runtime}m
              </span>
            )}
            <span className="text-zinc-400 text-[11px] font-bold">4K ULTRA HD</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white leading-[1.05]">
            {media.title || media.name}
          </h1>

          {media.genres && media.genres.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {media.genres.map((g) => (
                <span key={g.id} className="px-3 py-1 rounded-full bg-white/[0.06] border border-white/[0.08] text-[11px] text-zinc-300 font-mono font-semibold">
                  {g.name}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Saved Progress Bar if applicable */}
        {watchProgress && totalSeconds > 0 && (
          <div className="space-y-1.5 max-w-md p-3.5 rounded-2xl bg-[#18181C] border border-white/[0.08] shadow-sm">
            <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400">
              <span className="font-bold uppercase tracking-wider text-white">RESUME PROGRESS</span>
              <span className="text-white font-bold">{progressPercent}%</span>
            </div>
            <div className="w-full bg-white/15 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-white h-full rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-3 pt-1">
          <button 
            onClick={onPlayClick}
            className="px-7 py-2.5 rounded-full bg-white hover:bg-zinc-200 text-black font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition cursor-pointer shadow-md hover:shadow-lg hover:scale-105"
          >
            <Play className="w-3.5 h-3.5 stroke-[2] fill-black text-black" />
            <span>{watchProgress && totalSeconds > 0 ? 'Resume Watching' : 'Start Watching'}</span>
          </button>

          <button 
            onClick={onToggleWatchlist}
            className={`px-5 py-2.5 rounded-full border text-xs font-medium uppercase tracking-wider flex items-center gap-2 transition cursor-pointer backdrop-blur-md shadow-sm ${
              isAdded 
                ? 'bg-white border-white text-black font-bold' 
                : 'bg-white/[0.06] border-white/10 text-zinc-300 hover:text-white hover:bg-white/[0.12]'
            }`}
            title={user ? (isAdded ? 'Remove from Watchlist' : 'Add to Watchlist') : 'Sign in to save to Watchlist'}
          >
            <Bookmark className="w-3.5 h-3.5 stroke-[1.5]" />
            <span>{isAdded ? 'In Watchlist' : 'Add to Watchlist'}</span>
          </button>

          <button 
            onClick={onOpenParty}
            className="px-4 py-2.5 rounded-full border border-white/10 bg-white/[0.06] text-zinc-300 hover:text-white hover:bg-white/[0.12] text-xs font-medium uppercase tracking-wider flex items-center gap-2 transition cursor-pointer backdrop-blur-md shadow-sm"
            title={user ? 'Start a P2P Watch Party Room' : 'Sign in to start a Watch Party'}
          >
            <Users2 className="w-3.5 h-3.5 stroke-[1.5]" />
            <span className="hidden sm:inline">Watch Party</span>
          </button>

          <button 
            onClick={onOpenShare}
            className="px-4 py-2.5 rounded-full border border-white/10 bg-white/[0.06] text-zinc-300 hover:text-white hover:bg-white/[0.12] text-xs font-medium uppercase tracking-wider flex items-center gap-2 transition cursor-pointer backdrop-blur-md shadow-sm"
            title="Send to Phone via QR Code"
          >
            <QrCode className="w-3.5 h-3.5 stroke-[1.5]" />
            <span className="hidden sm:inline">Send to Phone</span>
          </button>
        </div>

        {/* Franchise / Collection Banner */}
        {media.belongs_to_collection && (
          <div 
            onClick={() => navigate(`/collection/${media.belongs_to_collection.id}`)}
            className="flex items-center justify-between p-4 rounded-2xl bg-[#18181C] hover:bg-[#222228] border border-white/[0.08] hover:border-white/30 transition cursor-pointer group shadow-sm hover:shadow-md"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center text-white">
                <Layers className="w-4 h-4 stroke-[1.5]" />
              </div>
              <div>
                <span className="text-[10px] font-mono text-zinc-400 uppercase font-semibold">Part of Universe</span>
                <h4 className="text-xs sm:text-sm font-semibold text-white group-hover:text-zinc-200">
                  {media.belongs_to_collection.name}
                </h4>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:translate-x-1 transition-transform" />
          </div>
        )}
      </div>
    </div>
  );
}
