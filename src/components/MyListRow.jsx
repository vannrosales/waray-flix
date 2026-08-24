import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getImageUrl } from '../services/tmdb';
import { storageService } from '../services/storageService';
import { ChevronLeft, ChevronRight, Film, Star, X, Play } from 'lucide-react';
import QuickViewModal from './QuickViewModal';

export default function MyListRow() {
  const rowRef = useRef(null);
  const navigate = useNavigate();
  const [myList, setMyList] = useState([]);
  const [quickMedia, setQuickMedia] = useState(null);

  useEffect(() => {
    setMyList(storageService.getPlaylist());
  }, []);

  const handleScroll = (direction) => {
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      const amount = direction === 'left' ? scrollLeft - clientWidth * 0.75 : scrollLeft + clientWidth * 0.75;
      rowRef.current.scrollTo({ left: amount, behavior: 'smooth' });
    }
  };

  const handleRemove = (e, item) => {
    e.stopPropagation();
    storageService.togglePlaylistItem(item);
    setMyList(storageService.getPlaylist());
  };

  if (!myList || myList.length === 0) return null;

  return (
    <section className="space-y-3 px-6 md:px-12 my-10 max-w-[1440px] mx-auto content-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white font-['Outfit'] flex items-center gap-2">
          <span>My Watchlist</span>
          <span className="text-xs font-mono text-zinc-500 font-normal">({myList.length})</span>
        </h2>
        
        <div className="flex items-center gap-1">
          <button 
            onClick={() => handleScroll('left')} 
            className="w-7 h-7 rounded-full bg-white/[0.04] hover:bg-white/[0.1] border border-white/[0.08] text-zinc-400 hover:text-white flex items-center justify-center transition cursor-pointer"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-3.5 h-3.5 stroke-[1.5]" />
          </button>
          <button 
            onClick={() => handleScroll('right')} 
            className="w-7 h-7 rounded-full bg-white/[0.04] hover:bg-white/[0.1] border border-white/[0.08] text-zinc-400 hover:text-white flex items-center justify-center transition cursor-pointer"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-3.5 h-3.5 stroke-[1.5]" />
          </button>
        </div>
      </div>
      
      {/* Track */}
      <div className="relative group">
        <div ref={rowRef} className="flex gap-3.5 sm:gap-4 overflow-x-auto scrollbar-none scroll-smooth pb-3 pt-1">
          {myList.map((item) => {
            const itemType = item.media_type || (item.title ? 'movie' : 'tv');
            const posterImg = getImageUrl(item.poster_path, 'posterSmall') || getImageUrl(item.backdrop_path, 'backdropSmall');
            const releaseYear = item.release_date?.substring(0, 4) || item.first_air_date?.substring(0, 4) || '2026';

            return (
              <div 
                key={item.id}
                onClick={() => navigate(`/details/${itemType}/${item.id}`)}
                className="w-[145px] sm:w-[175px] md:w-[195px] flex-shrink-0 cursor-pointer group/item flex flex-col gap-2 transition-all duration-200"
              >
                {/* Poster Card Container */}
                <div className="relative aspect-[2/3] w-full rounded-xl overflow-hidden bg-[#11131A] border border-white/[0.06] group-hover/item:border-white/20 transition-all duration-200 group-hover/item:scale-[1.02] shadow-sm">
                  {posterImg ? (
                    <img 
                      src={posterImg} 
                      alt={item.title || item.name} 
                      loading="lazy"
                      className="absolute inset-0 w-full h-full object-cover transition duration-300 group-hover/item:brightness-105"
                    />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-3 text-center text-zinc-600 bg-[#0E1017]">
                      <Film className="w-6 h-6 mb-1 opacity-30 stroke-[1.5]" />
                      <span className="text-[9px] font-mono">{item.title || item.name}</span>
                    </div>
                  )}
                  
                  {/* Outlined Remove Button */}
                  <button 
                    onClick={(e) => handleRemove(e, item)}
                    className="absolute top-2 left-2 p-1.5 rounded-full bg-black/80 hover:bg-black text-zinc-400 hover:text-white transition opacity-0 group-hover/item:opacity-100 z-30 cursor-pointer border border-white/10 backdrop-blur-md"
                    title="Remove from My List"
                  >
                    <X className="w-3.5 h-3.5 stroke-[1.5]" />
                  </button>

                  {/* Rating Badge */}
                  {item.vote_average > 0 && (
                    <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-md px-2 py-0.5 rounded-md flex items-center gap-1 border border-white/10 z-20">
                      <Star className="w-2.5 h-2.5 text-zinc-400 stroke-[1.5]" />
                      <span className="text-[10px] font-mono text-zinc-300">{item.vote_average.toFixed(1)}</span>
                    </div>
                  )}

                  {/* Play Overlay */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/item:opacity-100 transition-opacity flex items-center justify-center z-20">
                    <div className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center shadow-lg transition">
                      <Play className="w-4 h-4 stroke-[2] text-black" />
                    </div>
                  </div>
                </div>

                {/* Title & Metadata */}
                <div className="space-y-0.5 px-0.5">
                  <h3 className="text-xs font-semibold text-zinc-200 line-clamp-1 group-hover/item:text-white transition">
                    {item.title || item.name}
                  </h3>
                  <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-mono">
                    <span>{releaseYear}</span>
                    <span>·</span>
                    <span className="uppercase">{itemType}</span>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      </div>

      {quickMedia && (
        <QuickViewModal
          media={quickMedia}
          type={quickMedia.media_type || 'movie'}
          isOpen={Boolean(quickMedia)}
          onClose={() => setQuickMedia(null)}
        />
      )}
    </section>
  );
}