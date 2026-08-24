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
      <div className="w-full h-[70vh] bg-[#FAFAFA] shimmer-skeleton-light flex items-center justify-center text-[#52525B] font-mono text-xs">
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
    <div className="relative h-[72vh] sm:h-[80vh] w-full overflow-hidden flex items-end select-none bg-[#FAFAFA]">
      
      {/* Background Photography Backdrop */}
      {backdropUrl && (
        <img 
          src={backdropUrl} 
          alt="" 
          fetchPriority="high"
          decoding="async"
          className={`absolute inset-0 w-full h-full object-cover object-center transition-all duration-1000 ${
            showVideo && trailerKey ? 'opacity-0 scale-105' : 'opacity-40 scale-100'
          }`}
        />
      )}

      {/* Autoplaying Ambient Trailer */}
      {trailerKey && (
        <div className={`absolute inset-0 w-full h-full pointer-events-none overflow-hidden flex items-center justify-center transition-opacity duration-1000 ${
          showVideo ? 'opacity-70' : 'opacity-0'
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
      
      {/* Triad 4 Clean Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#FAFAFA] via-[#FAFAFA]/75 to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#FAFAFA]/95 via-[#FAFAFA]/70 to-transparent pointer-events-none" />

      {/* Outlined Sound Toggle Button */}
      {showVideo && trailerKey && (
        <div className="absolute bottom-16 right-6 md:right-12 z-30 animate-fade-in">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="w-9 h-9 rounded-full bg-white/80 hover:bg-white text-[#09090B] border border-black/10 backdrop-blur-md flex items-center justify-center transition cursor-pointer shadow-md"
            title={isMuted ? "Unmute Preview" : "Mute Preview"}
          >
            {isMuted ? <VolumeX className="w-4 h-4 stroke-[1.5]" /> : <Volume2 className="w-4 h-4 stroke-[1.5]" />}
          </button>
        </div>
      )}

      {/* Hero Content Section */}
      <div className="relative z-20 max-w-[1440px] w-full mx-auto px-6 md:px-12 pb-14 space-y-4">
        
        {/* Minimalist Metadata Line */}
        <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-[#52525B]">
          <span className="px-2.5 py-0.5 rounded-full border border-black/10 bg-white/70 backdrop-blur-md text-[#09090B] font-semibold text-[10px] tracking-wider uppercase">
            {itemType}
          </span>
          <span className="text-[#09090B] font-medium">{releaseYear}</span>
          <span>·</span>
          {activeContent.vote_average > 0 && (
            <>
              <span className="flex items-center gap-1 text-[#09090B]">
                <Star className="w-3 h-3 text-[#2563EB] fill-[#2563EB] stroke-[1.5]" />
                <span className="font-bold">{activeContent.vote_average.toFixed(1)}</span>
              </span>
              <span>·</span>
            </>
          )}
          <span className="text-[#52525B] text-[11px]">4K ULTRA HD</span>
        </div>

        {/* Clean Typography Title */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-[#09090B] font-['Outfit'] max-w-3xl leading-[1.05]">
          {activeContent.title || activeContent.name}
        </h1>

        {/* Overview Synopsis */}
        <p className="text-[#52525B] text-xs sm:text-sm line-clamp-2 max-w-2xl font-normal leading-relaxed">
          {activeContent.overview || "Stream this title now in high definition."}
        </p>

        {/* Action Button Deck & Slide Carousel Controls */}
        <div className="pt-2 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* Primary Watch Button (Cobalt Blue #2563EB) */}
            <button
              onClick={handlePlayNow}
              className="px-6 py-2.5 rounded-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold text-xs tracking-wider uppercase flex items-center gap-2 transition-all cursor-pointer shadow-md hover:shadow-lg"
            >
              <Play className="w-3.5 h-3.5 stroke-[2] fill-white text-white" />
              <span>Watch Now</span>
            </button>

            {/* Quick Preview Button */}
            <button
              onClick={() => setQuickViewOpen(true)}
              className="px-4 py-2.5 rounded-full bg-white/80 hover:bg-white text-[#09090B] font-medium text-xs tracking-wider uppercase border border-black/10 backdrop-blur-md flex items-center gap-2 transition cursor-pointer shadow-sm hover:shadow"
            >
              <Info className="w-3.5 h-3.5 stroke-[1.5] text-[#52525B]" />
              <span>Preview</span>
            </button>

            {/* Bookmark Toggle */}
            <button
              onClick={handleToggleBookmark}
              className={`p-2.5 rounded-full border transition cursor-pointer backdrop-blur-md shadow-sm ${
                isSaved 
                  ? 'bg-[#2563EB] border-[#2563EB] text-white' 
                  : 'bg-white/80 border-black/10 text-[#52525B] hover:text-[#09090B] hover:bg-white'
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
                className="w-7 h-7 rounded-full bg-white/80 hover:bg-white border border-black/10 text-[#52525B] hover:text-[#09090B] flex items-center justify-center transition cursor-pointer shadow-sm"
                aria-label="Previous slide"
              >
                <ChevronLeft className="w-3.5 h-3.5 stroke-[1.5]" />
              </button>
              
              <div className="flex items-center gap-1.5 px-1.5">
                {slides.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                      currentIndex === idx 
                        ? 'w-6 bg-[#2563EB]' 
                        : 'w-1.5 bg-black/20 hover:bg-black/40'
                    }`}
                  />
                ))}
              </div>

              <button 
                onClick={nextSlide} 
                className="w-7 h-7 rounded-full bg-white/80 hover:bg-white border border-black/10 text-[#52525B] hover:text-[#09090B] flex items-center justify-center transition cursor-pointer shadow-sm"
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