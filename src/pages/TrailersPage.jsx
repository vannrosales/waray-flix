import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchTrailersFeed } from '../services/tmdb';
import { Play, Bookmark, Star, ArrowRight, Volume2, VolumeX, ChevronUp, ChevronDown, Film } from 'lucide-react';
import { usePlaylist } from '../hooks/usePlaylist';
import useDocumentTitle from '../hooks/useDocumentTitle';

export default function TrailersPage() {
  useDocumentTitle('Trailer Reel — WarayFlix');
  const navigate = useNavigate();
  const [trailers, setTrailers] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTrailers() {
      try {
        setLoading(true);
        const data = await fetchTrailersFeed();
        setTrailers(data || []);
      } catch (err) {
        console.error("Failed to load trailers feed:", err);
      } finally {
        setLoading(false);
      }
    }
    loadTrailers();
  }, []);

  const activeItem = trailers[currentIndex];
  const { isAdded, toggle } = usePlaylist(activeItem?.id);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % trailers.length);
  }, [trailers.length]);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + trailers.length) % trailers.length);
  }, [trailers.length]);

  // Keyboard navigation: Arrow Up / Down or J / K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') return;

      if (e.key === 'ArrowDown' || e.key.toLowerCase() === 'j') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowUp' || e.key.toLowerCase() === 'k') {
        e.preventDefault();
        handlePrev();
      } else if (e.key.toLowerCase() === 'm') {
        e.preventDefault();
        setIsMuted((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#090A0F] flex items-center justify-center text-zinc-600 font-mono text-xs">
        LOADING_TRAILER_THEATER...
      </div>
    );
  }

  if (trailers.length === 0) {
    return (
      <div className="min-h-screen bg-[#090A0F] flex items-center justify-center text-zinc-500 font-mono text-xs">
        NO TRAILERS AVAILABLE
      </div>
    );
  }

  const releaseYear = activeItem.release_date?.substring(0, 4) || activeItem.first_air_date?.substring(0, 4) || '2026';
  const itemType = activeItem.media_type || 'movie';

  return (
    <div className="fixed inset-0 bg-[#090A0F] text-[#EDEDED] font-sans overflow-hidden select-none">
      
      {/* Background Fullscreen Video Player Embed */}
      <div className="absolute inset-0 w-full h-full overflow-hidden flex items-center justify-center pointer-events-none">
        <div className="absolute w-[300%] h-[300%] md:w-[150%] md:h-[150%]">
          <iframe
            key={activeItem.trailerKey}
            src={`https://www.youtube-nocookie.com/embed/${activeItem.trailerKey}?autoplay=1&mute=${isMuted ? 1 : 0}&controls=0&loop=1&playlist=${activeItem.trailerKey}&rel=0&iv_load_policy=3&disablekb=1&modestbranding=1`}
            title={activeItem.title || "Cinema Trailer"}
            className="w-full h-full object-cover border-0"
            allow="autoplay"
          />
        </div>
      </div>

      {/* Gradients */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#090A0F] via-[#090A0F]/40 to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#090A0F]/90 via-[#090A0F]/20 to-transparent pointer-events-none" />

      {/* Top Bar: Slide Index and Sound Toggle */}
      <div className="absolute top-20 sm:top-24 left-6 sm:left-12 right-6 sm:right-12 z-30 flex items-center justify-between pointer-events-auto">
        <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 bg-black/60 px-3 py-1 rounded-full border border-white/10 backdrop-blur-xl">
          <Film className="w-3.5 h-3.5 stroke-[1.5]" />
          <span>TRAILER REEL</span>
          <span className="text-white font-semibold ml-1">
            {String(currentIndex + 1).padStart(2, '0')} / {String(trailers.length).padStart(2, '0')}
          </span>
        </div>

        <button
          onClick={() => setIsMuted(!isMuted)}
          className="p-2.5 rounded-full bg-black/60 hover:bg-black text-zinc-300 hover:text-white border border-white/10 backdrop-blur-xl transition cursor-pointer"
          title={isMuted ? "Unmute Audio (M)" : "Mute Audio (M)"}
        >
          {isMuted ? <VolumeX className="w-4 h-4 stroke-[1.5]" /> : <Volume2 className="w-4 h-4 stroke-[1.5]" />}
        </button>
      </div>

      {/* Right Side Vertical Navigation Controls */}
      <div className="absolute right-6 sm:right-12 top-1/2 -translate-y-1/2 z-30 flex flex-col gap-3 pointer-events-auto">
        <button
          onClick={handlePrev}
          className="w-10 h-10 rounded-full bg-black/60 hover:bg-black text-zinc-300 hover:text-white border border-white/10 backdrop-blur-xl flex items-center justify-center transition cursor-pointer shadow-xl hover:scale-105"
          title="Previous Trailer (Key: ↑ or K)"
          aria-label="Previous Trailer"
        >
          <ChevronUp className="w-5 h-5 stroke-[1.5]" />
        </button>

        <button
          onClick={handleNext}
          className="w-10 h-10 rounded-full bg-black/60 hover:bg-black text-zinc-300 hover:text-white border border-white/10 backdrop-blur-xl flex items-center justify-center transition cursor-pointer shadow-xl hover:scale-105"
          title="Next Trailer (Key: ↓ or J)"
          aria-label="Next Trailer"
        >
          <ChevronDown className="w-5 h-5 stroke-[1.5]" />
        </button>
      </div>

      {/* Bottom Info Overlay */}
      <div className="absolute bottom-10 sm:bottom-14 left-6 sm:left-12 max-w-xl z-30 space-y-4 pointer-events-auto">
        <div className="space-y-2">
          <div className="flex items-center gap-3 text-xs font-mono text-zinc-400">
            <span className="px-2 py-0.5 rounded border border-white/15 bg-black/70 backdrop-blur-md text-white font-medium uppercase tracking-wider text-[10px]">
              {itemType}
            </span>
            <span className="text-zinc-200">{releaseYear}</span>
            {activeItem.vote_average > 0 && (
              <>
                <span>·</span>
                <span className="flex items-center gap-1 text-zinc-200">
                  <Star className="w-3 h-3 text-zinc-400 stroke-[1.5]" /> {activeItem.vote_average.toFixed(1)}
                </span>
              </>
            )}
          </div>

          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white font-['Outfit'] leading-tight drop-shadow-md">
            {activeItem.title || activeItem.name}
          </h1>

          <p className="text-xs sm:text-sm text-zinc-300 line-clamp-3 font-light leading-relaxed drop-shadow">
            {activeItem.overview || "Now previewing in the theater reel."}
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-3 pt-1">
          <button
            onClick={() => navigate(itemType === 'tv' ? `/watch/tv/${activeItem.id}/1/1` : `/watch/movie/${activeItem.id}`)}
            className="px-6 py-2.5 rounded-full bg-white hover:bg-zinc-200 text-black font-semibold text-xs uppercase tracking-wider flex items-center gap-2 transition cursor-pointer shadow-xl"
          >
            <Play className="w-3.5 h-3.5 stroke-[2] text-black" />
            <span>Watch Full Title</span>
          </button>

          <button
            onClick={() => toggle({ ...activeItem, media_type: itemType })}
            className={`px-4 py-2.5 rounded-full border text-xs font-medium uppercase tracking-wider flex items-center gap-2 transition cursor-pointer backdrop-blur-md ${
              isAdded 
                ? 'bg-white/10 border-white/30 text-white' 
                : 'bg-black/60 border-white/15 text-zinc-300 hover:text-white hover:border-white/30'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5 stroke-[1.5]" />
            <span>{isAdded ? 'In Watchlist' : 'Save'}</span>
          </button>

          <button
            onClick={() => navigate(`/details/${itemType}/${activeItem.id}`)}
            className="px-4 py-2.5 rounded-full border border-transparent hover:border-white/10 text-xs font-mono text-zinc-400 hover:text-white flex items-center gap-1.5 transition cursor-pointer"
          >
            <span>Details</span>
            <ArrowRight className="w-3.5 h-3.5 stroke-[1.5]" />
          </button>
        </div>
      </div>

    </div>
  );
}

