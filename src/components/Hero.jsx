import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getImageUrl, fetchMediaVideos } from '../services/tmdb';
import { storageService } from '../services/storageService';
import { Play, Info, Star, VolumeX, Volume2, Bookmark, ChevronRight, ChevronLeft } from 'lucide-react';
import QuickViewModal from './QuickViewModal';

export default function Hero({ content, items = [] }) {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [trailerKey, setTrailerKey] = useState(null);
  const [isMuted, setIsMuted] = useState(true);
  const [showVideo, setShowVideo] = useState(false);
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const slides = items && items.length > 0 ? items.slice(0, 5) : (content ? [content] : []);
  const activeContent = slides[currentIndex] || content;
  const itemType = activeContent?.media_type || (activeContent?.first_air_date ? 'tv' : 'movie');

  useEffect(() => {
    let isMounted = true;
    setShowVideo(false);
    setTrailerKey(null);

    if (activeContent?.id) {
      setIsSaved(storageService.isInPlaylist(activeContent.id));
    }

    async function loadTrailer() {
      if (!activeContent?.id) return;
      try {
        const videos = await fetchMediaVideos(activeContent.id, itemType);
        const trailer = (videos || []).find(v => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser'));
        if (trailer && isMounted) {
          setTrailerKey(trailer.key);
          const timer = setTimeout(() => {
            if (isMounted) setShowVideo(true);
          }, 1800);
          return () => clearTimeout(timer);
        }
      } catch (err) {
        console.error("Hero trailer load error:", err);
      }
    }

    loadTrailer();
    return () => {
      isMounted = false;
    };
  }, [activeContent, itemType]);

  const nextSlide = useCallback(() => {
    if (slides.length > 1) {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    if (slides.length > 1) {
      setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
    }
  }, [slides.length]);

  useEffect(() => {
    if (slides.length <= 1 || showVideo) return;
    const interval = setInterval(nextSlide, 8000);
    return () => clearInterval(interval);
  }, [slides.length, showVideo, nextSlide]);

  if (!activeContent) {
    return (
      <div className="w-full h-[70vh] bg-[#090A0F] shimmer-skeleton flex items-center justify-center text-zinc-600 font-mono text-xs">
        LOADING_SELECTION...
      </div>
    );
  }

  const backdropUrl = getImageUrl(activeContent.backdrop_path, 'backdrop') || getImageUrl(activeContent.poster_path, 'original');
  const releaseYear = activeContent.release_date?.substring(0, 4) || activeContent.first_air_date?.substring(0, 4) || '2026';

  const handleToggleBookmark = () => {
    storageService.togglePlaylistItem({ ...activeContent, media_type: itemType });
    setIsSaved(!isSaved);
  };

  const handlePlayNow = () => {
    if (itemType === 'tv') {
      navigate(`/watch/tv/${activeContent.id}/1/1`);
    } else {
      navigate(`/watch/movie/${activeContent.id}`);
    }
  };

  return (
    <div className="relative h-[72vh] sm:h-[80vh] w-full overflow-hidden flex items-end select-none">
      
      {/* Background Photography Backdrop */}
      {backdropUrl && (
        <img 
          src={backdropUrl} 
          alt="" 
          fetchPriority="high"
          decoding="async"
          className={`absolute inset-0 w-full h-full object-cover object-center transition-all duration-1000 ${
            showVideo && trailerKey ? 'opacity-0 scale-105' : 'opacity-35 scale-100'
          }`}
        />
      )}

      {/* Autoplaying Ambient Trailer */}
      {trailerKey && (
        <div className={`absolute inset-0 w-full h-full pointer-events-none overflow-hidden flex items-center justify-center transition-opacity duration-1000 ${
          showVideo ? 'opacity-60' : 'opacity-0'
        }`}>
          <div className="absolute w-[320%] h-[320%] md:w-[170%] md:h-[170%]">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${trailerKey}?autoplay=1&mute=${isMuted ? 1 : 0}&controls=0&loop=1&playlist=${trailerKey}&rel=0&iv_load_policy=3&disablekb=1&modestbranding=1`}
              title="Hero Trailer"
              className="w-full h-full object-cover border-0"
              allow="autoplay"
            />
          </div>
        </div>
      )}
      
      {/* Clean Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#090A0F] via-[#090A0F]/50 to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#090A0F]/95 via-[#090A0F]/40 to-transparent pointer-events-none" />

      {/* Outlined Sound Toggle Button */}
      {showVideo && trailerKey && (
        <div className="absolute bottom-16 right-6 md:right-12 z-30 animate-fade-in">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="w-9 h-9 rounded-full bg-black/60 hover:bg-black/90 text-zinc-300 hover:text-white border border-white/10 backdrop-blur-md flex items-center justify-center transition cursor-pointer"
            title={isMuted ? "Unmute Preview" : "Mute Preview"}
          >
            {isMuted ? <VolumeX className="w-4 h-4 stroke-[1.5]" /> : <Volume2 className="w-4 h-4 stroke-[1.5]" />}
          </button>
        </div>
      )}

      {/* Hero Content Section */}
      <div className="relative z-20 max-w-[1440px] w-full mx-auto px-6 md:px-12 pb-14 space-y-4">
        
        {/* Minimalist Metadata Line */}
        <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-zinc-400">
          <span className="px-2 py-0.5 rounded border border-white/10 text-white font-medium text-[10px] tracking-wider uppercase">
            {itemType}
          </span>
          <span className="text-zinc-300">{releaseYear}</span>
          <span>·</span>
          {activeContent.vote_average > 0 && (
            <>
              <span className="flex items-center gap-1 text-zinc-200">
                <Star className="w-3 h-3 text-zinc-400 stroke-[1.5]" />
                <span className="font-semibold">{activeContent.vote_average.toFixed(1)}</span>
              </span>
              <span>·</span>
            </>
          )}
          <span className="text-zinc-400 text-[11px]">4K ULTRA HD</span>
        </div>

        {/* Clean Typography Title */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white font-['Outfit'] max-w-3xl leading-[1.05]">
          {activeContent.title || activeContent.name}
        </h1>

        {/* Overview Synopsis */}
        <p className="text-zinc-400 text-xs sm:text-sm line-clamp-2 max-w-2xl font-light leading-relaxed">
          {activeContent.overview || "Stream this title now in high definition."}
        </p>

        {/* Action Button Deck & Slide Carousel Controls */}
        <div className="pt-2 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* Primary Watch Button */}
            <button
              onClick={handlePlayNow}
              className="px-6 py-2.5 rounded-full bg-white hover:bg-zinc-200 text-black font-semibold text-xs tracking-wider uppercase flex items-center gap-2 transition-all cursor-pointer shadow-lg"
            >
              <Play className="w-3.5 h-3.5 stroke-[2] text-black" />
              <span>Watch Now</span>
            </button>

            {/* Quick Preview Button */}
            <button
              onClick={() => setQuickViewOpen(true)}
              className="px-4 py-2.5 rounded-full bg-white/[0.05] hover:bg-white/[0.1] text-zinc-200 hover:text-white font-medium text-xs tracking-wider uppercase border border-white/10 backdrop-blur-md flex items-center gap-2 transition cursor-pointer"
            >
              <Info className="w-3.5 h-3.5 stroke-[1.5] text-zinc-400" />
              <span>Preview</span>
            </button>

            {/* Bookmark Toggle */}
            <button
              onClick={handleToggleBookmark}
              className={`p-2.5 rounded-full border transition cursor-pointer backdrop-blur-md ${
                isSaved 
                  ? 'bg-white/15 border-white/30 text-white' 
                  : 'bg-white/[0.04] border-white/10 text-zinc-400 hover:text-white hover:bg-white/[0.08]'
              }`}
              title={isSaved ? "Saved in My List" : "Save to My List"}
            >
              <Bookmark className="w-4 h-4 stroke-[1.5]" />
            </button>
          </div>

          {/* Minimalist Carousel Slide Indicators */}
          {slides.length > 1 && (
            <div className="hidden sm:flex items-center gap-2">
              <button 
                onClick={prevSlide} 
                className="w-7 h-7 rounded-full bg-white/[0.04] hover:bg-white/[0.1] border border-white/10 text-zinc-400 hover:text-white flex items-center justify-center transition cursor-pointer"
                aria-label="Previous slide"
              >
                <ChevronLeft className="w-3.5 h-3.5 stroke-[1.5]" />
              </button>
              
              <div className="flex items-center gap-1.5 px-1.5">
                {slides.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-1 rounded-full transition-all duration-300 cursor-pointer ${
                      currentIndex === idx 
                        ? 'w-5 bg-white' 
                        : 'w-1 bg-white/20 hover:bg-white/40'
                    }`}
                  />
                ))}
              </div>

              <button 
                onClick={nextSlide} 
                className="w-7 h-7 rounded-full bg-white/[0.04] hover:bg-white/[0.1] border border-white/10 text-zinc-400 hover:text-white flex items-center justify-center transition cursor-pointer"
                aria-label="Next slide"
              >
                <ChevronRight className="w-3.5 h-3.5 stroke-[1.5]" />
              </button>
            </div>
          )}
        </div>

      </div>

      {/* Quick View Modal */}
      <QuickViewModal 
        media={activeContent} 
        type={itemType} 
        isOpen={quickViewOpen} 
        onClose={() => setQuickViewOpen(false)} 
      />

    </div>
  );
}