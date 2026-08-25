import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Trash2, Play, Info, Film } from 'lucide-react';
import { getImageUrl } from '../../services/tmdb';

export default function WatchlistCard({ item, onRemove }) {
  const navigate = useNavigate();
  if (!item) return null;

  const poster = getImageUrl(item.poster_path, 'poster');
  const itemType = item.media_type || (item.first_air_date ? 'tv' : 'movie');
  const releaseYear = (item.release_date || item.first_air_date || '').substring(0, 4);

  return (
    <div 
      onClick={() => navigate(`/details/${itemType}/${item.id}`)}
      className="group relative flex flex-col space-y-2 select-none cursor-pointer transition-all duration-200"
    >
      {/* Poster Card */}
      <div className="relative aspect-[2/3] w-full rounded-2xl overflow-hidden bg-[#18181C] border border-white/[0.08] group-hover:border-white/40 transition-all duration-300 shadow-sm hover:shadow-md">
        {poster ? (
          <img
            src={poster}
            alt={item.title || item.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-zinc-500 gap-2 bg-[#18181C]">
            <Film className="w-8 h-8 opacity-30 stroke-[1.5]" />
            <span className="text-[9px] font-mono">NO POSTER</span>
          </div>
        )}

        {/* Media Type Chip */}
        <div className="absolute top-2.5 left-2.5 z-20">
          <span className="px-2 py-0.5 rounded bg-black/90 text-white text-[9px] font-mono uppercase tracking-wider font-semibold shadow-sm border border-white/10">
            {itemType}
          </span>
        </div>

        {/* Rating Badge */}
        {item.vote_average > 0 && (
          <div className="absolute top-2.5 right-2.5 bg-black/80 backdrop-blur-md px-2 py-0.5 rounded flex items-center gap-1 border border-white/20 z-20 shadow-sm text-white">
            <Star className="w-2.5 h-2.5 text-white fill-white stroke-[1.5]" />
            <span className="text-[10px] font-mono font-bold text-white">{item.vote_average.toFixed(1)}</span>
          </div>
        )}

        {/* Gradient Overlay on Hover with Quick Actions */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-3 z-30">
          
          {/* Top Remove Button */}
          <div className="flex justify-end pt-8">
            <button
              onClick={(e) => onRemove(e, item)}
              className="p-1.5 rounded-full bg-black/80 hover:bg-white hover:text-black text-zinc-300 transition cursor-pointer backdrop-blur-md shadow-md hover:scale-110 border border-white/10"
              title="Remove from Watchlist"
            >
              <Trash2 className="w-3.5 h-3.5 stroke-[1.5]" />
            </button>
          </div>

          {/* Bottom Action Bar */}
          <div className="space-y-1.5">
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (itemType === 'tv') {
                  navigate(`/watch/tv/${item.id}/1/1`);
                } else {
                  navigate(`/watch/movie/${item.id}`);
                }
              }}
              className="w-full py-2 rounded-xl bg-white text-black font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-lg hover:bg-zinc-200 transition cursor-pointer hover:scale-[1.02]"
            >
              <Play className="w-3.5 h-3.5 stroke-[2] fill-black text-black" />
              <span>Watch Now</span>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/details/${itemType}/${item.id}`);
              }}
              className="w-full py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-medium text-[11px] uppercase tracking-wider flex items-center justify-center gap-1 backdrop-blur-md transition cursor-pointer"
            >
              <Info className="w-3 h-3 stroke-[1.5]" />
              <span>Details</span>
            </button>
          </div>
        </div>
      </div>

      {/* Title & Metadata */}
      <div className="space-y-0.5 px-0.5">
        <h3 className="text-xs sm:text-sm font-semibold text-white truncate group-hover:text-zinc-300 transition">
          {item.title || item.name}
        </h3>
        <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-400">
          {releaseYear && <span>{releaseYear}</span>}
          {item.vote_average > 0 && (
            <>
              <span>·</span>
              <span className="flex items-center gap-0.5 text-white font-bold">
                <Star className="w-2.5 h-2.5 text-white fill-white stroke-[1.5]" />
                {item.vote_average.toFixed(1)}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
