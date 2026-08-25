import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getImageUrl } from '../services/tmdb';
import { ChevronLeft, ChevronRight, Film, Star, X, Play } from 'lucide-react';

export default function ContinueWatchingRow({ items, onRemove }) {
  const rowRef = useRef(null);
  const navigate = useNavigate();

  const handleScroll = (direction) => {
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      const amount = direction === 'left' ? scrollLeft - clientWidth * 0.75 : scrollLeft + clientWidth * 0.75;
      rowRef.current.scrollTo({ left: amount, behavior: 'smooth' });
    }
  };

  if (!items || items.length === 0) return null;

  return (
    <section className="space-y-3 px-6 md:px-12 my-10 max-w-[1440px] mx-auto content-auto select-none">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white font-['Outfit']">
          Continue Watching
        </h2>
        
        <div className="flex items-center gap-1.5">
          <button 
            onClick={() => handleScroll('left')} 
            className="w-7 h-7 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.08] text-zinc-400 hover:text-white flex items-center justify-center transition cursor-pointer"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-3.5 h-3.5 stroke-[1.5]" />
          </button>
          <button 
            onClick={() => handleScroll('right')} 
            className="w-7 h-7 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.08] text-zinc-400 hover:text-white flex items-center justify-center transition cursor-pointer"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-3.5 h-3.5 stroke-[1.5]" />
          </button>
        </div>
      </div>
      
      {/* Track */}
      <div className="relative group">
        <div ref={rowRef} className="flex gap-3.5 sm:gap-4 overflow-x-auto scrollbar-none scroll-smooth pb-3 pt-1">
          {items.map((item) => {
            if (!item || !item.id) return null;

            const itemType = item.media_type || (item.title ? 'movie' : 'tv');
            const posterImg = getImageUrl(item.poster_path, 'posterSmall') || getImageUrl(item.backdrop_path, 'backdropSmall');
            const releaseYear = item.release_date?.substring(0, 4) || item.first_air_date?.substring(0, 4) || '2026';
            
            const totalSeconds = item.lastWatchedSeconds || 0;
            const durationSeconds = item.durationSeconds || (itemType === 'movie' ? 7200 : 2700);
            const progressPercent = durationSeconds > 0 ? Math.min(Math.round((totalSeconds / durationSeconds) * 100), 100) : 0;

            const watchUrl = itemType === 'tv'
              ? `/watch/tv/${item.id}/${item.season || 1}/${item.episode || 1}${totalSeconds > 0 ? `?startAt=${totalSeconds}` : ''}`
              : `/watch/movie/${item.id}${totalSeconds > 0 ? `?startAt=${totalSeconds}` : ''}`;

            return (
              <div 
                key={item.id}
                onClick={() => navigate(watchUrl)}
                className="w-[145px] sm:w-[175px] md:w-[195px] flex-shrink-0 cursor-pointer group/item flex flex-col gap-2 transition-all duration-200"
              >
                {/* Poster Card Container */}
                <div className="relative aspect-[2/3] w-full rounded-2xl overflow-hidden bg-[#18181C] border border-white/[0.08] group-hover/item:border-white/40 transition-all duration-200 group-hover/item:scale-[1.02] shadow-sm hover:shadow-md">
                  {posterImg ? (
                    <img 
                      src={posterImg} 
                      alt={item.title || item.name} 
                      loading="lazy"
                      className="absolute inset-0 w-full h-full object-cover transition duration-300 group-hover/item:brightness-105"
                    />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-3 text-center text-zinc-500 bg-[#18181C]">
                      <Film className="w-6 h-6 mb-1 opacity-30 stroke-[1.5]" />
                      <span className="text-[9px] font-mono text-zinc-500">{item.title || item.name}</span>
                    </div>
                  )}

                  {/* Remove Button */}
                  {onRemove && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemove(item.id);
                      }}
                      className="absolute top-2 left-2 p-1.5 rounded-full bg-black/80 hover:bg-black text-white transition opacity-0 group-hover/item:opacity-100 z-30 cursor-pointer backdrop-blur-md shadow-sm border border-white/10"
                      title="Remove from history"
                    >
                      <X className="w-3.5 h-3.5 stroke-[1.5]" />
                    </button>
                  )}

                  {/* Rating Badge */}
                  {item.vote_average > 0 && (
                    <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-md px-2 py-0.5 rounded-md flex items-center gap-1 border border-white/15 z-20 shadow-sm text-white">
                      <Star className="w-2.5 h-2.5 text-white fill-white stroke-[1.5]" />
                      <span className="text-[10px] font-mono font-bold text-white">{item.vote_average.toFixed(1)}</span>
                    </div>
                  )}

                  {/* Hover Resume Play Icon */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/item:opacity-100 transition-opacity flex items-center justify-center z-20">
                    <div className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center shadow-lg transition hover:scale-105">
                      <Play className="w-4 h-4 stroke-[2] fill-black text-black" />
                    </div>
                  </div>

                  {/* White Progress Bar */}
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-2 z-20">
                    <div className="w-full bg-white/20 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-white h-full rounded-full transition-all duration-300" 
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Title & Metadata */}
                <div className="space-y-0.5 px-0.5">
                  <h3 className="text-xs font-semibold text-white line-clamp-1 group-hover/item:text-zinc-300 transition">
                    {item.title || item.name}
                  </h3>
                  <div className="flex items-center justify-between text-[10px] text-zinc-400 font-mono">
                    <span>{itemType === 'tv' && item.season ? `S${item.season} E${item.episode}` : releaseYear}</span>
                    <span className="text-white font-bold">{progressPercent}%</span>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}