import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Film, Star, Play, Info, Bookmark } from 'lucide-react';
import { getImageUrl } from '../services/tmdb';
import { fetchPersonalizedRecommendations } from '../services/recommendationEngine';
import { storageService } from '../services/storageService';
import QuickViewModal from './QuickViewModal';
import { useAuth } from '../context/AuthContext';

export default function RecommendedRow() {
  const rowRef = useRef(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState([]);
  const [reason, setReason] = useState('Curated for your library & streaming taste');
  const [loading, setLoading] = useState(true);
  const [quickMedia, setQuickMedia] = useState(null);

  const loadRecommendations = async () => {
    try {
      setLoading(true);
      const data = await fetchPersonalizedRecommendations();
      setRecommendations(data?.items || []);
      if (data?.reason) setReason(data.reason);
    } catch (err) {
      console.warn('Failed to load recommendations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecommendations();

    window.addEventListener('playlistUpdated', loadRecommendations);
    window.addEventListener('historyUpdated', loadRecommendations);

    return () => {
      window.removeEventListener('playlistUpdated', loadRecommendations);
      window.removeEventListener('historyUpdated', loadRecommendations);
    };
  }, []);

  const handleScroll = (direction) => {
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      const amount = direction === 'left' ? scrollLeft - clientWidth * 0.75 : scrollLeft + clientWidth * 0.75;
      rowRef.current.scrollTo({ left: amount, behavior: 'smooth' });
    }
  };

  if (loading && recommendations.length === 0) return null;
  if (!loading && recommendations.length === 0) return null;

  return (
    <section className="space-y-3 px-6 md:px-12 my-10 max-w-[1440px] mx-auto content-auto select-none">
      
      {/* Row Header */}
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white">
            Recommended For You
          </h2>
          <p className="text-[11px] text-zinc-400 tracking-wide mt-0.5">
            {reason}
          </p>
        </div>

        {/* Navigation Controls */}
        <div className="flex items-center gap-1.5">
          <button 
            onClick={() => handleScroll('left')} 
            className="w-7 h-7 rounded-none bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.08] text-zinc-400 hover:text-white flex items-center justify-center transition cursor-pointer"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-3.5 h-3.5 stroke-[1.5]" />
          </button>
          <button 
            onClick={() => handleScroll('right')} 
            className="w-7 h-7 rounded-none bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.08] text-zinc-400 hover:text-white flex items-center justify-center transition cursor-pointer"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-3.5 h-3.5 stroke-[1.5]" />
          </button>
        </div>
      </div>

      {/* Media Track */}
      <div className="relative group">
        <div 
          ref={rowRef} 
          className="flex gap-3.5 sm:gap-4 overflow-x-auto scrollbar-none scroll-smooth pb-3 pt-1"
        >
          {recommendations.map((item) => {
            const itemType = item.media_type || (item.title ? 'movie' : 'tv');
            const posterImg = getImageUrl(item.poster_path, 'posterSmall') || getImageUrl(item.backdrop_path, 'backdropSmall');
            const releaseYear = (item.release_date || item.first_air_date || '').substring(0, 4);

            return (
              <div 
                key={item.id}
                onClick={() => navigate(`/details/${itemType}/${item.id}`)}
                className="w-[145px] sm:w-[175px] md:w-[195px] cursor-pointer group/item flex flex-col gap-2 flex-shrink-0 transition-all duration-200"
              >
                {/* Poster Card Container - Sharp Geometric Zero Border Radius */}
                <div className="relative aspect-[2/3] w-full rounded-none overflow-hidden bg-[#121212] border border-white/[0.08] group-hover/item:border-white/40 transition-all duration-200 group-hover/item:scale-[1.02] shadow-sm hover:shadow-md">
                  {posterImg ? (
                    <img 
                      src={posterImg} 
                      alt={item.title || item.name} 
                      loading="lazy"
                      className="absolute inset-0 w-full h-full object-cover transition duration-300 group-hover/item:brightness-105"
                    />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-3 text-center text-zinc-500 bg-[#121212]">
                      <Film className="w-6 h-6 mb-1 opacity-30 stroke-[1.5]" />
                      <span className="text-[9px] text-zinc-500">{item.title || item.name}</span>
                    </div>
                  )}

                  {/* Rating Badge */}
                  {item.vote_average > 0 && (
                    <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-md px-2 py-0.5 rounded-none flex items-center gap-1 border border-white/15 z-20 shadow-sm text-white pointer-events-none">
                      <Star className="w-2.5 h-2.5 text-white fill-white stroke-[1.5]" />
                      <span className="text-[10px] font-bold text-white">{item.vote_average.toFixed(1)}</span>
                    </div>
                  )}

                  {/* Media Type Chip */}
                  <div className="absolute top-2 left-2 z-20 pointer-events-none">
                    <span className="px-2 py-0.5 rounded-none bg-black/90 text-white text-[9px] uppercase font-bold shadow-sm border border-white/10">
                      {itemType === 'tv' ? 'SERIES' : 'MOVIE'}
                    </span>
                  </div>

                  {/* Hover Action Overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/item:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2 z-30 p-2 pointer-events-none">
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
                      className="pointer-events-auto w-9 h-9 rounded-none bg-white text-black flex items-center justify-center transition hover:bg-zinc-200 cursor-pointer shadow-md hover:scale-105"
                      title="Watch Now"
                    >
                      <Play className="w-3.5 h-3.5 stroke-[2] fill-black text-black" />
                    </button>

                    {/* Quick View Info */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setQuickMedia(item);
                      }}
                      className="pointer-events-auto w-8 h-8 rounded-none bg-white/15 hover:bg-white/25 text-white backdrop-blur-md flex items-center justify-center border border-white/20 transition cursor-pointer shadow-sm hover:scale-105"
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
                      className="pointer-events-auto w-8 h-8 rounded-none bg-white/15 hover:bg-white/25 text-white backdrop-blur-md flex items-center justify-center border border-white/20 transition cursor-pointer shadow-sm hover:scale-105"
                      title="Save to Watchlist"
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
                  <div className="flex items-center gap-2 text-[10px] text-zinc-400">
                    <span>{releaseYear || '—'}</span>
                    <span>·</span>
                    <span className="uppercase font-medium">{itemType === 'tv' ? 'Series' : 'Movie'}</span>
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
          type={quickMedia.media_type || (quickMedia.first_air_date ? 'tv' : 'movie')}
          isOpen={Boolean(quickMedia)}
          onClose={() => setQuickMedia(null)}
        />
      )}

    </section>
  );
}
