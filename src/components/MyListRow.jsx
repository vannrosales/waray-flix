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
    <div className="space-y-4 px-6 md:px-16 my-12 max-w-[1400px] mx-auto font-sans">
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
        <div ref={rowRef} className="flex gap-4 overflow-x-auto scrollbar-none scroll-smooth pb-4 pt-2">
          {myList.map((item) => {
            const itemType = item.media_type || 'movie';
            const posterImg = item.poster_path ? `${IMAGE_BASE_URL}${item.poster_path}` : (item.backdrop_path ? `${IMAGE_BASE_URL}${item.backdrop_path}` : null);
            const releaseYear = item.release_date?.substring(0, 4) || item.first_air_date?.substring(0, 4) || '2026';

            return (
              <div 
                key={item.id}
                onClick={() => navigate(`/details/${itemType}/${item.id}`)}
                className="min-w-[170px] sm:min-w-[200px] md:min-w-[220px] cursor-pointer group/item flex flex-col gap-2 flex-shrink-0 transition-all duration-300"
              >
                {/* Poster Card Container */}
                <div className="relative aspect-[2/3] w-full rounded-2xl overflow-hidden bg-[#1D2128]/40 border border-white/5 group-hover/item:border-white/20 transition-all duration-300 group-hover/item:scale-[1.03] shadow-xl">
                  {posterImg ? (
                    <img 
                      src={posterImg} 
                      alt={item.title || item.name} 
                      loading="lazy"
                      className="absolute inset-0 w-full h-full object-cover transition duration-500 group-hover/item:brightness-105"
                    />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center text-zinc-600 bg-[#14171F]">
                      <Film className="w-8 h-8 mb-1 opacity-40" />
                      <span className="text-[10px]">{item.title || item.name}</span>
                    </div>
                  )}
                  
                  {/* Rating Badge Overlay */}
                  {item.vote_average > 0 && (
                    <div className="absolute top-2.5 right-2.5 bg-black/75 backdrop-blur-md px-2.5 py-1 rounded-full flex items-center gap-1 border border-white/10 z-20 shadow-md">
                      <Star className="w-3 h-3 text-amber-400 fill-current" />
                      <span className="text-[11px] font-bold text-white font-mono">{item.vote_average.toFixed(1)}</span>
                    </div>
                  )}
                </div>

                {/* Title & Metadata Below Card */}
                <div className="space-y-0.5 px-1">
                  <h3 className="text-xs font-bold text-zinc-200 line-clamp-1 group-hover/item:text-white transition">
                    {item.title || item.name}
                  </h3>
                  <div className="flex items-center gap-2 text-[10px] text-zinc-400 font-mono">
                    <span>{releaseYear}</span>
                    <span>•</span>
                    <span className="uppercase">{itemType}</span>
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