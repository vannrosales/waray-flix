import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Sparkles, Star, Film, Play, Eye } from 'lucide-react';
import { getImageUrl } from '../services/tmdb';
import { fetchPersonalizedRecommendations } from '../services/recommendationEngine';
import QuickViewModal from './QuickViewModal';

export default function RecommendedRow() {
  const rowRef = useRef(null);
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState([]);
  const [reason, setReason] = useState('Curated for your taste');
  const [loading, setLoading] = useState(true);
  const [quickMedia, setQuickMedia] = useState(null);

  const loadRecommendations = async () => {
    try {
      setLoading(true);
      const data = await fetchPersonalizedRecommendations();
      setRecommendations(data.items || []);
      if (data.reason) setReason(data.reason);
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
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-zinc-400 stroke-[1.5]" />
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white font-['Outfit']">
              Recommended For You
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-white/[0.06] border border-white/10 text-[9px] font-mono text-zinc-300 uppercase tracking-wider hidden sm:inline-block">
              AI Taste Match
            </span>
          </div>
          <p className="text-[11px] font-mono text-zinc-500">
            {reason}
          </p>
        </div>

        {/* Scroll Controls */}
        <div className="flex items-center gap-1.5">
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

      {/* Media Track */}
      <div className="relative group">
        <div 
          ref={rowRef} 
          className="flex gap-3.5 sm:gap-4 overflow-x-auto scrollbar-none scroll-smooth pb-3 pt-1"
        >
          {recommendations.map((item) => {
            const itemType = item.media_type || (item.title ? 'movie' : 'tv');
            const posterImg = getImageUrl(item.poster_path, 'posterSmall');
            const releaseYear = (item.release_date || item.first_air_date || '').substring(0, 4);

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

                  {/* Rating Badge */}
                  {item.vote_average > 0 && (
                    <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-md px-2 py-0.5 rounded-md flex items-center gap-1 border border-white/10 z-20">
                      <Star className="w-2.5 h-2.5 text-zinc-400 stroke-[1.5]" />
                      <span className="text-[10px] font-mono text-zinc-300">{item.vote_average.toFixed(1)}</span>
                    </div>
                  )}

                  {/* Media Type Chip */}
                  <div className="absolute top-2 left-2 z-20">
                    <span className="px-1.5 py-0.5 rounded bg-black/80 backdrop-blur-md border border-white/10 text-[9px] font-mono uppercase text-zinc-300">
                      {itemType}
                    </span>
                  </div>

                  {/* Play & Quick View Overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/item:opacity-100 transition-opacity flex items-center justify-center gap-2 z-20 p-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setQuickMedia(item);
                      }}
                      className="p-2 rounded-full bg-white/[0.1] hover:bg-white/[0.2] text-white border border-white/20 transition cursor-pointer backdrop-blur-md"
                      title="Quick Preview"
                    >
                      <Eye className="w-4 h-4 stroke-[1.5]" />
                    </button>

                    <div className="w-9 h-9 rounded-full bg-white text-black flex items-center justify-center shadow-lg transition">
                      <Play className="w-4 h-4 stroke-[2] fill-black text-black" />
                    </div>
                  </div>

                  {/* Match Reason Banner on Hover */}
                  {item.matchReason && (
                    <div className="absolute bottom-0 inset-x-0 bg-black/90 backdrop-blur-md p-1.5 text-center border-t border-white/10 opacity-0 group-hover/item:opacity-100 transition-opacity z-20">
                      <span className="text-[9px] font-mono text-zinc-300 block truncate">
                        {item.matchReason}
                      </span>
                    </div>
                  )}
                </div>

                {/* Title & Metadata */}
                <div className="space-y-0.5 px-0.5">
                  <h3 className="text-xs font-semibold text-zinc-200 line-clamp-1 group-hover/item:text-white transition">
                    {item.title || item.name}
                  </h3>
                  <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-mono">
                    {releaseYear && <span>{releaseYear}</span>}
                    {releaseYear && <span>·</span>}
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

