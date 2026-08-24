import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchTrailersFeed } from '../services/tmdb';
import { Play, Bookmark, Star, ArrowRight, Volume2, VolumeX, ChevronUp, ChevronDown, Film } from 'lucide-react';
import { usePlaylist } from '../hooks/usePlaylist';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { useAuth } from '../context/AuthContext';

export default function TrailersPage() {
  useDocumentTitle('Trailer Reel — WarayFlix');
  const navigate = useNavigate();
  const { user } = useAuth();
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
      <div className="min-h-screen bg-black flex items-center justify-center text-zinc-400 font-mono text-xs">
        LOADING_TRAILER_THEATER...
      </div>
    );
  }

  if (trailers.length === 0) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-zinc-400 font-mono text-xs">
        NO TRAILERS AVAILABLE
      </div>
    );
  }

  const releaseYear = activeItem.release_date?.substring(0, 4) || activeItem.first_air_date?.substring(0, 4) || '2026';
  const itemType = activeItem.media_type || 'movie';

  return (
    <div className="fixed inset-0 bg-black text-white font-sans overflow-hidden select-none">
      
      {/* Background Fullscreen Video Player Embed (100% Video Clarity) */}
      <div className="absolute inset-0 w-full h-full overflow-hidden flex items-center justify-center pointer-events-none">
        <div className="absolute w-[300%] h-[300%] md:w-[155%] md:h-[155%]">
          <iframe
            key={activeItem.trailerKey}
            src={`https://www.youtube-nocookie.com/embed/${activeItem.trailerKey}?autoplay=1&mute=${isMuted ? 1 : 0}&controls=0&loop=1&playlist=${activeItem.trailerKey}&rel=0&iv_load_policy=3&disablekb=1&modestbranding=1`}
            title={activeItem.title || "Cinema Trailer"}
            className="w-full h-full object-cover border-0"
            allow="autoplay"
          />
        </div>
      </div>

      {/* Subtle Cinema Vignetting (Allows 100% Center Video View) */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/40 pointer-events-none" />
      <div className="absolute inset-y-0 left-0 w-full md:w-1/2 bg-gradient-to-r from-black/75 via-black/20 to-transparent pointer-events-none" />

      {/* Top Bar: Slide Index and Sound Toggle */}
      <div className="absolute top-20 sm:top-24 left-6 sm:left-12 right-6 sm:right-12 z-30 flex items-center justify-between pointer-events-auto">
        <div className="flex items-center gap-2 text-xs font-mono text-zinc-300 bg-black/70 px-3.5 py-1.5 rounded-full border border-white/15 backdrop-blur-xl shadow-lg">
          <Film className="w-3.5 h-3.5 stroke-[1.5] text-[#2563EB]" />
          <span className="font-semibold">TRAILER REEL</span>
          <span className="text-white font-bold ml-1">
            {String(currentIndex + 1).padStart(2, '0')} / {String(trailers.length).padStart(2, '0')}
          </span>
        </div>

        <button
          onClick={() => setIsMuted(!isMuted)}
          className="p-2.5 rounded-full bg-black/70 hover:bg-black text-white border border-white/15 backdrop-blur-xl transition cursor-pointer shadow-lg hover:scale-105"
          title={isMuted ? "Unmute Audio (M)" : "Mute Audio (M)"}
        >
          {isMuted ? <VolumeX className="w-4 h-4 stroke-[1.5]" /> : <Volume2 className="w-4 h-4 stroke-[1.5]" />}
        </button>
      </div>

      {/* Right Side Vertical Navigation Controls */}
      <div className="absolute right-6 sm:right-12 top-1/2 -translate-y-1/2 z-30 flex flex-col gap-3 pointer-events-auto">
        <button
          onClick={handlePrev}
          className="w-11 h-11 rounded-full bg-black/70 hover:bg-[#2563EB] text-white border border-white/15 backdrop-blur-xl flex items-center justify-center transition cursor-pointer shadow-xl hover:scale-110"
          title="Previous Trailer (Key: ↑ or K)"
          aria-label="Previous Trailer"
        >
          <ChevronUp className="w-5 h-5 stroke-[2]" />
        </button>

        <button
          onClick={handleNext}
          className="w-11 h-11 rounded-full bg-black/70 hover:bg-[#2563EB] text-white border border-white/15 backdrop-blur-xl flex items-center justify-center transition cursor-pointer shadow-xl hover:scale-110"
          title="Next Trailer (Key: ↓ or J)"
          aria-label="Next Trailer"
        >
          <ChevronDown className="w-5 h-5 stroke-[2]" />
        </button>
      </div>

      {/* Bottom Info Overlay */}
      <div className="absolute bottom-10 sm:bottom-14 left-6 sm:left-12 max-w-xl z-30 space-y-4 pointer-events-auto">
        <div className="space-y-2">
          <div className="flex items-center gap-3 text-xs font-mono text-zinc-300">
            <span className="px-2.5 py-0.5 rounded-full border border-white/20 bg-black/80 backdrop-blur-md text-white font-bold uppercase tracking-wider text-[10px] shadow-sm">
              {itemType}
            </span>
            <span className="text-white font-semibold">{releaseYear}</span>
            {activeItem.vote_average > 0 && (
              <>
                <span>·</span>
                <span className="flex items-center gap-1 text-white font-bold">
                  <Star className="w-3 h-3 text-[#2563EB] fill-[#2563EB] stroke-[1.5]" /> {activeItem.vote_average.toFixed(1)}
                </span>
              </>
            )}
          </div>

          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white font-['Outfit'] leading-tight drop-shadow-lg">
            {activeItem.title || activeItem.name}
          </h1>

          <p className="text-xs sm:text-sm text-zinc-200 line-clamp-3 font-normal leading-relaxed drop-shadow-md">
            {activeItem.overview || "Now previewing in the theater reel."}
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-3 pt-1">
          <button
            onClick={() => navigate(itemType === 'tv' ? `/watch/tv/${activeItem.id}/1/1` : `/watch/movie/${activeItem.id}`)}
            className="px-6 py-2.5 rounded-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold text-xs uppercase tracking-wider flex items-center gap-2 transition cursor-pointer shadow-xl hover:scale-105"
          >
            <Play className="w-3.5 h-3.5 stroke-[2] fill-white text-white" />
            <span>Watch Full Title</span>
          </button>

          <button
            onClick={() => toggle({ ...activeItem, media_type: itemType }, user?.id)}
            className={`px-4 py-2.5 rounded-full border text-xs font-medium uppercase tracking-wider flex items-center gap-2 transition cursor-pointer backdrop-blur-md shadow-lg ${
              isAdded 
                ? 'bg-[#2563EB] border-[#2563EB] text-white font-bold' 
                : 'bg-black/70 border-white/20 text-zinc-200 hover:text-white hover:border-white/40'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5 stroke-[1.5]" />
            <span>{isAdded ? 'In Watchlist' : 'Save'}</span>
          </button>

          <button
            onClick={() => navigate(`/details/${itemType}/${activeItem.id}`)}
            className="px-4 py-2.5 rounded-full border border-white/15 bg-black/60 hover:bg-black/90 text-xs font-mono text-zinc-200 hover:text-white flex items-center gap-1.5 transition cursor-pointer backdrop-blur-md"
          >
            <span>Details</span>
            <ArrowRight className="w-3.5 h-3.5 stroke-[1.5]" />
          </button>
        </div>
      </div>

    </div>
  );
}
