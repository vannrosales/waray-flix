import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { IMAGE_BASE_URL } from '../services/tmdb';
import { ChevronLeft, ChevronRight, Film, Star, Clock, X } from 'lucide-react';

export default function ContinueWatchingRow({ items, onRemove }) {
  const rowRef = useRef(null);
  const navigate = useNavigate();

  const handleScroll = (direction) => {
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      const amount = direction === 'left' ? scrollLeft - clientWidth / 1.5 : scrollLeft + clientWidth / 1.5;
      rowRef.current.scrollTo({ left: amount, behavior: 'smooth' });
    }
  };

  if (!items || items.length === 0) return null;

  return (
    <div className="space-y-3 px-6 md:px-16 my-10 max-w-[1400px] mx-auto">
      {/* Clean Minimalist Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
          <Clock className="w-4 h-4 text-zinc-400" />
          <span>Continue Watching</span>
        </h2>

        {/* Subtle Navigation Arrows */}
        <div className="flex items-center gap-1">
          <button 
            onClick={() => handleScroll('left')} 
            className="w-7 h-7 rounded-full bg-[#1D2128]/50 hover:bg-[#1D2128] text-zinc-400 hover:text-white flex items-center justify-center transition cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button 
            onClick={() => handleScroll('right')} 
            className="w-7 h-7 rounded-full bg-[#1D2128]/50 hover:bg-[#1D2128] text-zinc-400 hover:text-white flex items-center justify-center transition cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="relative group">
        {/* Horizontal Scrollable Track */}
        <div ref={rowRef} className="flex gap-4 overflow-x-auto scrollbar-none scroll-smooth pb-4 pt-1">
          {items.map((item) => {
            const itemType = item.media_type || (item.title ? 'movie' : 'tv');
            
            {/* Fallback image resolution check for history objects */}
            const imagePath = item.backdrop_path || item.poster_path;
            const backdropImg = imagePath ? `${IMAGE_BASE_URL}${imagePath}` : null;
            
            const watchMinute = item.lastWatchedMinute || 0;

            return (
              <div 
                key={item.id}
                onClick={() => navigate(`/watch/${itemType}/${item.id}?t=${watchMinute}`)}
                className="min-w-[280px] sm:min-w-[320px] md:min-w-[360px] h-[200px] cursor-pointer group/item relative rounded-2xl overflow-hidden bg-[#1D2128]/40 flex-shrink-0 transition-all duration-300 hover:scale-[1.02]"
              >
                {backdropImg ? (
                  <img 
                    src={backdropImg} 
                    alt={item.title || item.name} 
                    className="absolute inset-0 w-full h-full object-cover transition duration-500 group-hover/item:brightness-[0.6]"
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center text-zinc-600 bg-[#14171F]">
                    <Film className="w-8 h-8 mb-1 opacity-40" />
                    <span className="text-xs">{item.title || item.name}</span>
                  </div>
                )}

                {/* Remove button from local history */}
                {onRemove && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemove(item.id);
                    }}
                    className="absolute top-3 right-3 p-1.5 rounded-full bg-black/60 hover:bg-black text-zinc-300 hover:text-white transition opacity-0 group-hover/item:opacity-100 z-20 cursor-pointer"
                    title="Remove from history"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}

                {/* Clean Bottom Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B0D10]/90 via-transparent to-transparent opacity-80" />

                {/* Details Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-4 z-10 flex items-end justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2 text-[10px] text-zinc-400 font-mono">
                      <span>Watched at {watchMinute} min</span>
                      {item.vote_average > 0 && (
                        <span className="flex items-center gap-0.5 text-amber-400">
                          <Star className="w-2.5 h-2.5 fill-current" /> {item.vote_average.toFixed(1)}
                        </span>
                      )}
                    </div>
                    <h3 className="text-xs font-bold text-white line-clamp-1 group-hover/item:text-zinc-200">
                      {item.title || item.name}
                    </h3>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}