import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getImageUrl } from '../services/tmdb';
import { storageService } from '../services/storageService';
import { ChevronLeft, ChevronRight, Film, Star, X, Play } from 'lucide-react';
import QuickViewModal from './QuickViewModal';
import { useAuth } from '../context/AuthContext';

export default function MyListRow() {
  const rowRef = useRef(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  const [myList, setMyList] = useState(() => storageService.getPlaylist());
  const [quickMedia, setQuickMedia] = useState(null);

  useEffect(() => {
    const updateList = () => {
      setMyList(storageService.getPlaylist());
    };

    updateList();
    storageService.fetchCloudPlaylist(user?.id);

    window.addEventListener('playlistUpdated', updateList);
    return () => window.removeEventListener('playlistUpdated', updateList);
  }, [user?.id]);

  const handleScroll = (direction) => {
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      const amount = direction === 'left' ? scrollLeft - clientWidth * 0.75 : scrollLeft + clientWidth * 0.75;
      rowRef.current.scrollTo({ left: amount, behavior: 'smooth' });
    }
  };

  const handleRemove = (e, item) => {
    e.stopPropagation();
    storageService.togglePlaylistItem(item, user?.id);
  };

  const listItems = Array.isArray(myList) ? myList : [];
  if (listItems.length === 0) return null;

  return (
    <section className="space-y-3 px-6 md:px-12 my-10 max-w-[1440px] mx-auto content-auto select-none">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg sm:text-xl font-bold tracking-tight text-[#09090B] font-['Outfit'] flex items-center gap-2">
          <span>My Watchlist</span>
          <span className="text-xs font-mono text-[#52525B] font-normal">({listItems.length})</span>
        </h2>
        
        <div className="flex items-center gap-1.5">
          <button 
            onClick={() => handleScroll('left')} 
            className="w-7 h-7 rounded-full bg-black/[0.04] hover:bg-black/[0.08] border border-black/[0.08] text-[#52525B] hover:text-[#09090B] flex items-center justify-center transition cursor-pointer"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-3.5 h-3.5 stroke-[1.5]" />
          </button>
          <button 
            onClick={() => handleScroll('right')} 
            className="w-7 h-7 rounded-full bg-black/[0.04] hover:bg-black/[0.08] border border-black/[0.08] text-[#52525B] hover:text-[#09090B] flex items-center justify-center transition cursor-pointer"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-3.5 h-3.5 stroke-[1.5]" />
          </button>
        </div>
      </div>
      
      {/* Track */}
      <div className="relative group">
        <div ref={rowRef} className="flex gap-3.5 sm:gap-4 overflow-x-auto scrollbar-none scroll-smooth pb-3 pt-1">
          {listItems.map((item) => {
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
                <div className="relative aspect-[2/3] w-full rounded-2xl overflow-hidden bg-white border border-black/[0.06] group-hover/item:border-[#2563EB]/40 transition-all duration-200 group-hover/item:scale-[1.02] shadow-sm hover:shadow-md">
                  {posterImg ? (
                    <img 
                      src={posterImg} 
                      alt={item.title || item.name} 
                      loading="lazy"
                      className="absolute inset-0 w-full h-full object-cover transition duration-300 group-hover/item:brightness-105"
                    />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-3 text-center text-zinc-400 bg-zinc-100">
                      <Film className="w-6 h-6 mb-1 opacity-30 stroke-[1.5]" />
                      <span className="text-[9px] font-mono text-[#52525B]">{item.title || item.name}</span>
                    </div>
                  )}
                  
                  {/* Remove Button */}
                  <button 
                    onClick={(e) => handleRemove(e, item)}
                    className="absolute top-2 left-2 p-1.5 rounded-full bg-black/80 hover:bg-black text-white transition opacity-0 group-hover/item:opacity-100 z-30 cursor-pointer backdrop-blur-md shadow-sm"
                    title="Remove from My List"
                  >
                    <X className="w-3.5 h-3.5 stroke-[1.5]" />
                  </button>

                  {/* Rating Badge */}
                  {item.vote_average > 0 && (
                    <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-md px-2 py-0.5 rounded-md flex items-center gap-1 border border-black/10 z-20 shadow-sm">
                      <Star className="w-2.5 h-2.5 text-[#2563EB] fill-[#2563EB] stroke-[1.5]" />
                      <span className="text-[10px] font-mono font-bold text-[#09090B]">{item.vote_average.toFixed(1)}</span>
                    </div>
                  )}

                  {/* Play Overlay */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/item:opacity-100 transition-opacity flex items-center justify-center z-20">
                    <div className="w-10 h-10 rounded-full bg-[#2563EB] text-white flex items-center justify-center shadow-lg transition">
                      <Play className="w-4 h-4 stroke-[2] fill-white text-white" />
                    </div>
                  </div>
                </div>

                {/* Title & Metadata */}
                <div className="space-y-0.5 px-0.5">
                  <h3 className="text-xs font-semibold text-[#09090B] line-clamp-1 group-hover/item:text-[#2563EB] transition">
                    {item.title || item.name}
                  </h3>
                  <div className="flex items-center gap-2 text-[10px] text-[#52525B] font-mono">
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