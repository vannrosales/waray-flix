import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getImageUrl } from '../services/tmdb';
import { storageService } from '../services/storageService';
import { ChevronLeft, ChevronRight, Film, Star, Play, Info, Bookmark } from 'lucide-react';
import QuickViewModal from './QuickViewModal';
import { useAuth } from '../context/AuthContext';

export default function MediaRow({ title, items, type = 'movie', subtitle }) {
  const rowRef = useRef(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedQuickMedia, setSelectedQuickMedia] = useState(null);

  const handleScroll = (direction) => {
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      const amount = direction === 'left' ? scrollLeft - clientWidth * 0.75 : scrollLeft + clientWidth * 0.75;
      rowRef.current.scrollTo({ left: amount, behavior: 'smooth' });
    }
  };

  if (!items || items.length === 0) return null;

  const isTop10 = title.toLowerCase().includes('top 10');

  return (
    <section className="space-y-3 px-6 md:px-12 my-10 max-w-[1440px] mx-auto content-auto select-none">
      {/* Row Header */}
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white">
            {title}
          </h2>
          {subtitle && (
            <p className="text-[11px] text-zinc-400 font-mono tracking-wide mt-0.5">{subtitle}</p>
          )}
        </div>
        
        {/* Outlined Navigation Controls */}
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
      
      {/* Scrollable Track */}
      <div className="relative group">
        <div ref={rowRef} className="flex gap-3.5 sm:gap-4 overflow-x-auto scrollbar-none scroll-smooth pb-3 pt-1">
          {items.map((item, index) => {
            const itemType = item.media_type || type;
            const posterImg = getImageUrl(item.poster_path, 'posterSmall') || getImageUrl(item.backdrop_path, 'backdropSmall');
            const releaseYear = item.release_date?.substring(0, 4) || item.first_air_date?.substring(0, 4) || '2026';
            const rank = index + 1;

            return (
              <div 
                key={item.id}
                onClick={() => navigate(`/details/${itemType}/${item.id}`)}
                className="w-[145px] sm:w-[175px] md:w-[195px] cursor-pointer group/item flex flex-col gap-2 flex-shrink-0 transition-all duration-200"
              >
                {/* Minimalist Poster Card */}
                <div className="relative aspect-[2/3] w-full rounded-2xl overflow-hidden bg-[#18181C] border border-white/[0.08] group-hover/item:border-white/40 transition-all duration-200 group-hover/item:scale-[1.02] shadow-sm hover:shadow-md">
                  {posterImg ? (
                    <img 
                      src={posterImg} 
                      alt={item.title || item.name} 
                      loading="lazy"
                      decoding="async"
                      className="absolute inset-0 w-full h-full object-cover transition duration-300 group-hover/item:brightness-105"
                    />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-3 text-center text-zinc-500 bg-[#18181C]">
                      <Film className="w-6 h-6 mb-1 opacity-30 stroke-[1.5]" />
                      <span className="text-[9px] font-mono text-zinc-500">{item.title || item.name}</span>
                    </div>
                  )}
                  
                  {/* Minimal Top 10 Rank Badge */}
                  {isTop10 && (
                    <div className="absolute top-2 left-2 z-20">
                      <span className="px-2 py-0.5 rounded-md bg-black/90 text-white font-mono text-[10px] font-bold tracking-wider shadow-sm border border-white/10">
                        #{rank}
                      </span>
                    </div>
                  )}

                  {/* Minimal Rating Badge */}
                  {item.vote_average > 0 && (
                    <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-md px-2 py-0.5 rounded-md flex items-center gap-1 border border-white/15 z-20 shadow-sm text-white">
                      <Star className="w-2.5 h-2.5 text-white fill-white stroke-[1.5]" />
                      <span className="text-[10px] font-mono font-bold text-white">{item.vote_average.toFixed(1)}</span>
                    </div>
                  )}

                  {/* Hover Action Overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/item:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2 z-30 p-2">
                    {/* Direct Play */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (itemType === 'tv') {
                          navigate(`/watch/tv/${item.id}/1/1`);
                        } else {
                          navigate(`/watch/movie/${item.id}`);
                        }
                      }}
                      className="w-9 h-9 rounded-full bg-white text-black flex items-center justify-center transition hover:bg-zinc-200 cursor-pointer shadow-md hover:scale-105"
                      title="Watch Now"
                    >
                      <Play className="w-3.5 h-3.5 stroke-[2] fill-black text-black" />
                    </button>

                    {/* Quick View Info */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedQuickMedia(item);
                      }}
                      className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 text-white backdrop-blur-md flex items-center justify-center border border-white/20 transition cursor-pointer shadow-sm hover:scale-105"
                      title="Quick Preview"
                    >
                      <Info className="w-3.5 h-3.5 stroke-[1.5]" />
                    </button>

                    {/* Save Bookmark */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        storageService.togglePlaylistItem({ ...item, media_type: itemType }, user?.id);
                      }}
                      className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 text-white backdrop-blur-md flex items-center justify-center border border-white/20 transition cursor-pointer shadow-sm hover:scale-105"
                      title="Save to My List"
                    >
                      <Bookmark className="w-3.5 h-3.5 stroke-[1.5]" />
                    </button>
                  </div>
                </div>

                {/* Title & Metadata */}
                <div className="space-y-0.5 px-0.5">
                  <h3 className="text-xs font-semibold text-white line-clamp-1 group-hover/item:text-zinc-300 transition">
                    {item.title || item.name}
                  </h3>
                  <div className="flex items-center gap-2 text-[10px] text-zinc-400 font-mono">
                    <span>{releaseYear}</span>
                    <span>·</span>
                    <span className="uppercase font-medium">{itemType}</span>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      </div>

      {/* Quick View Modal */}
      {selectedQuickMedia && (
        <QuickViewModal
          media={selectedQuickMedia}
          type={selectedQuickMedia.media_type || type}
          isOpen={Boolean(selectedQuickMedia)}
          onClose={() => setSelectedQuickMedia(null)}
        />
      )}
    </section>
  );
}
