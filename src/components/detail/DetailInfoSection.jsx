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
      <div className="w-44 sm:w-56 md:w-60 flex-shrink-0 aspect-[2/3] rounded-3xl overflow-hidden bg-white border border-black/10 shadow-2xl relative hidden sm:block">
        {poster ? (
          <img src={poster} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-zinc-400">
            <Film className="w-8 h-8 opacity-30 stroke-[1.5]" />
          </div>
        )}
      </div>

      {/* Metadata & Actions */}
      <div className="flex-1 space-y-5 pt-4 sm:pt-8">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-3 text-xs text-[#52525B] font-mono">
            <span className="px-2.5 py-0.5 rounded-full bg-[#09090B] text-white font-bold uppercase text-[10px] shadow-sm">
              {type}
            </span>
            <span className="text-[#09090B] font-bold text-xs">{releaseYear}</span>
            <span>·</span>
            {media.vote_average > 0 && (
              <>
                <span className="flex items-center gap-1 text-[#09090B] font-bold">
                  <Star className="w-3.5 h-3.5 text-[#2563EB] fill-[#2563EB] stroke-[1.5]" /> {media.vote_average.toFixed(1)}
                </span>
                <span>·</span>
              </>
            )}
            {runtime && (
              <span className="flex items-center gap-1 text-[#52525B] font-medium">
                <Clock className="w-3.5 h-3.5 stroke-[1.5]" /> {runtime}m
              </span>
            )}
            <span className="text-[#52525B] text-[11px] font-bold">4K ULTRA HD</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-[#09090B] font-['Outfit'] leading-[1.05]">
            {media.title || media.name}
          </h1>

          {media.genres && media.genres.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {media.genres.map((g) => (
                <span key={g.id} className="px-3 py-1 rounded-full bg-black/[0.05] border border-black/[0.08] text-[11px] text-[#09090B] font-mono font-semibold">
                  {g.name}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Saved Progress Bar if applicable */}
        {watchProgress && totalSeconds > 0 && (
          <div className="space-y-1.5 max-w-md p-3.5 rounded-2xl bg-white border border-black/[0.08] shadow-sm">
            <div className="flex items-center justify-between text-[10px] font-mono text-[#52525B]">
              <span className="font-bold uppercase tracking-wider text-[#09090B]">RESUME PROGRESS</span>
              <span className="text-[#2563EB] font-bold">{progressPercent}%</span>
            </div>
            <div className="w-full bg-zinc-100 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-[#2563EB] h-full rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-3 pt-1">
          <button 
            onClick={onPlayClick}
            className="px-7 py-2.5 rounded-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition cursor-pointer shadow-md hover:shadow-lg hover:scale-105"
          >
            <Play className="w-3.5 h-3.5 stroke-[2] fill-white text-white" />
            <span>{watchProgress && totalSeconds > 0 ? 'Resume Watching' : 'Start Watching'}</span>
          </button>

          <button 
            onClick={onToggleWatchlist}
            className={`px-5 py-2.5 rounded-full border text-xs font-medium uppercase tracking-wider flex items-center gap-2 transition cursor-pointer backdrop-blur-md shadow-sm ${
              isAdded 
                ? 'bg-[#2563EB]/10 border-[#2563EB]/30 text-[#2563EB] font-bold' 
                : 'bg-white border-black/10 text-[#09090B] hover:bg-zinc-50'
            }`}
            title={user ? (isAdded ? 'Remove from Watchlist' : 'Add to Watchlist') : 'Sign in to save to Watchlist'}
          >
            <Bookmark className="w-3.5 h-3.5 stroke-[1.5]" />
            <span>{isAdded ? 'In Watchlist' : 'Add to Watchlist'}</span>
          </button>

          <button 
            onClick={onOpenParty}
            className="px-4 py-2.5 rounded-full border border-black/10 bg-white text-[#09090B] hover:bg-zinc-50 text-xs font-medium uppercase tracking-wider flex items-center gap-2 transition cursor-pointer backdrop-blur-md shadow-sm"
            title={user ? 'Start a P2P Watch Party Room' : 'Sign in to start a Watch Party'}
          >
            <Users2 className="w-3.5 h-3.5 stroke-[1.5]" />
            <span className="hidden sm:inline">Watch Party</span>
          </button>

          <button 
            onClick={onOpenShare}
            className="px-4 py-2.5 rounded-full border border-black/10 bg-white text-[#09090B] hover:bg-zinc-50 text-xs font-medium uppercase tracking-wider flex items-center gap-2 transition cursor-pointer backdrop-blur-md shadow-sm"
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
            className="flex items-center justify-between p-4 rounded-2xl bg-white hover:bg-zinc-50 border border-black/[0.08] hover:border-[#2563EB]/40 transition cursor-pointer group shadow-sm hover:shadow-md"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-black/[0.04] border border-black/10 flex items-center justify-center">
                <Layers className="w-4 h-4 text-[#2563EB] stroke-[1.5]" />
              </div>
              <div>
                <span className="text-[10px] font-mono text-[#52525B] uppercase tracking-wider block font-semibold">Part of the Franchise</span>
                <h4 className="text-xs sm:text-sm font-bold text-[#09090B] group-hover:text-[#2563EB] transition">
                  {media.belongs_to_collection.name}
                </h4>
              </div>
            </div>
            <span className="text-xs font-mono text-[#52525B] group-hover:text-[#2563EB] flex items-center gap-1 font-medium">
              View Franchise <ArrowRight className="w-3.5 h-3.5 stroke-[1.5] group-hover:translate-x-1 transition-transform" />
            </span>
          </div>
        )}

        {/* Synopsis */}
        <div className="space-y-1.5 pt-3 border-t border-black/[0.08]">
          <span className="text-[10px] font-mono text-[#52525B] uppercase tracking-widest font-bold">SYNOPSIS</span>
          <p className="text-[#52525B] text-sm leading-relaxed font-normal max-w-3xl">
            {media.overview || "No synopsis available for this selection."}
          </p>
        </div>
      </div>
    </div>
  );
}

