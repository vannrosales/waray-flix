import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IMAGE_BASE_URL } from '../services/tmdb';
import { storageService } from '../services/storageService';
import { ChevronLeft, ChevronRight, Film, Star, BookmarkCheck } from 'lucide-react';

export default function MyListRow() {
  const rowRef = useRef(null);
  const navigate = useNavigate();
  const [myList, setMyList] = useState([]);

  useEffect(() => {
    setMyList(storageService.getPlaylist());
  }, []);

  const handleScroll = (direction) => {
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      const amount = direction === 'left' ? scrollLeft - clientWidth / 1.5 : scrollLeft + clientWidth / 1.5;
      rowRef.current.scrollTo({ left: amount, behavior: 'smooth' });
    }
  };

  if (!myList || myList.length === 0) return null;

  return (
    <div className="space-y-3 px-6 md:px-16 my-10 max-w-[1400px] mx-auto">
      {/* Clean Minimalist Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
          <BookmarkCheck className="w-4 h-4 text-zinc-400" />
          <span>My List</span>
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
          {myList.map((item) => {
            const itemType = item.media_type || 'movie';
            const backdropImg = item.backdrop_path ? `${IMAGE_BASE_URL}${item.backdrop_path}` : null;

            return (
              <div 
                key={item.id}
                onClick={() => navigate(`/details/${itemType}/${item.id}`)}
                className="min-w-[280px] sm:min-w-[320px] md:min-w-[360px] h-[200px] cursor-pointer group/item relative rounded-2xl overflow-hidden bg-[#1D2128]/40 flex-shrink-0 transition-all duration-300 hover:scale-[1.02]"
              >
                {backdropImg ? (
                  <img 
                    src={backdropImg} 
                    alt={item.title || item.name} 
                    className="absolute inset-0 w-full h-full object-cover transition duration-500 group-hover/item:brightness-[0.6]"
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center text-zinc-600">
                    <Film className="w-8 h-8 mb-1 opacity-40" />
                    <span className="text-xs">{item.title || item.name}</span>
                  </div>
                )}
                
                {/* Clean Bottom Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B0D10]/90 via-transparent to-transparent opacity-80" />

                {/* Details Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-4 z-10 flex items-end justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2 text-[10px] text-zinc-400 font-mono">
                      <span>{item.release_date?.substring(0, 4) || item.first_air_date?.substring(0, 4) || '2026'}</span>
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