import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getImageUrl, fetchMediaVideos } from '../services/tmdb';
import { storageService } from '../services/storageService';
import { Play, Info, Star, VolumeX, Volume2, Bookmark, ChevronRight, ChevronLeft } from 'lucide-react';
import QuickViewModal from './QuickViewModal';
import { useAuth } from '../context/AuthContext';

export default function Hero({ content, items = [] }) {
  const navigate = useNavigate();
  const { user } = useAuth();
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
      if (typeof window !== 'undefined' && window.innerWidth < 768) return;

      try {
        const videos = await fetchMediaVideos(activeContent.id, itemType);
        const trailer = (videos || []).find(v => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser'));
        if (trailer && isMounted) {
          setTrailerKey(trailer.key);
          const timer = setTimeout(() => {
            if (isMounted) setShowVideo(true);
          }, 1500);
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
      <div className="w-full h-[72vh] sm:h-[82vh] bg-[#000000] shimmer-skeleton flex items-center justify-center text-zinc-400 text-xs">
        LOADING_SELECTION...
      </div>
    );
  }

  const backdropUrl = getImageUrl(activeContent.backdrop_path, 'backdrop') || getImageUrl(activeContent.poster_path, 'original');
  const releaseYear = activeContent.release_date?.substring(0, 4) || activeContent.first_air_date?.substring(0, 4) || '2026';

  const handleToggleBookmark = () => {
    storageService.togglePlaylistItem({ ...activeContent, media_type: itemType }, user?.id);
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
    <div className="relative h-[72vh] sm:h-[82vh] w-full overflow-hidden flex items-end select-none bg-black">
      {/* High-Resolution Backdrop */}
      {backdropUrl && (
        <img 
          src={backdropUrl} 
          alt="" 
          fetchPriority="high"
          decoding="async"
          className={`absolute inset-0 w-full h-full object-cover object-center transition-all duration-1000 ${
            showVideo && trailerKey ? 'opacity-0 scale-105' : 'opacity-90 scale-100'
          }`}
        />
      )}

      {/* Autoplaying Ambient Trailer */}
      {trailerKey && (
        <div className={`absolute inset-0 w-full h-full pointer-events-none overflow-hidden flex items-center justify-center transition-opacity duration-1000 ${
          showVideo ? 'opacity-100' : 'opacity-0'
        }`}>
          <div className="absolute w-[320%] h-[320%] md:w-[150%] md:h-[150%]">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${trailerKey}?autoplay=1&mute=${isMuted ? 1 : 0}&controls=0&loop=1&playlist=${trailerKey}&rel=0&iv_load_policy=3&disablekb=1&modestbranding=1`}
              title="Hero Trailer"
              className="w-full h-full object-cover border-0"
              allow="autoplay"
            />
          </div>
        </div>
      )}
      
      {/* Cinema Vignette fading into #000000 */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#000000] via-black/40 to-black/30 pointer-events-none" />
      <div className="absolute inset-y-0 left-0 w-full md:w-3/5 bg-gradient-to-r from-[#000000]/95 via-black/60 to-transparent pointer-events-none" />
      <div className="absolute bottom-0 inset-x-0 h-14 bg-gradient-to-t from-[#000000] to-transparent pointer-events-none" />

      {/* Sound Toggle Button */}
      {showVideo && trailerKey && (
        <div className="absolute bottom-16 right-6 md:right-12 z-30 animate-fade-in">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="w-10 h-10 rounded-full bg-black/70 hover:bg-black text-white border border-white/20 backdrop-blur-md flex items-center justify-center transition cursor-pointer shadow-xl hover:scale-105"
            title={isMuted ? "Unmute Preview" : "Mute Preview"}
          >
            {isMuted ? <VolumeX className="w-4 h-4 stroke-[1.5]" /> : <Volume2 className="w-4 h-4 stroke-[1.5]" />}
          </button>
        </div>
      )}

      {/* Hero Content Section */}
      <div className="relative z-20 max-w-[1440px] w-full mx-auto px-6 md:px-12 pb-14 space-y-4">
        {/* Minimalist Metadata Line matching Image 1 */}
        <div className="flex flex-wrap items-center gap-2.5 text-xs">
          <span className="px-2.5 py-0.5 rounded bg-[#252525] border border-white/10 text-white font-bold text-[10px] tracking-wider uppercase shadow-xs">
            {itemType === 'tv' ? 'TV SERIES' : 'MOVIE'}
          </span>
          <span className="text-zinc-300 font-semibold px-1">{releaseYear}</span>
          {activeContent.vote_average > 0 && (
            <span className="flex items-center gap-1 text-white font-bold px-1">
              <Star className="w-3 h-3 text-white fill-white stroke-[1.5]" />
              <span>{activeContent.vote_average.toFixed(1)}</span>
            </span>
          )}
          <span className="px-2.5 py-0.5 rounded bg-[#252525] border border-white/10 text-white font-bold text-[10px] tracking-wider uppercase shadow-xs">
            4K ULTRA HD
          </span>
        </div>

        {/* Clean Headline Title */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-white max-w-3xl leading-none drop-shadow-md">
          {activeContent.title || activeContent.name}
        </h1>

        {/* Overview Synopsis */}
        <p className="text-zinc-300 text-xs sm:text-sm line-clamp-3 max-w-2xl font-normal leading-relaxed drop-shadow-md">
          {activeContent.overview || "Stream this title now in high definition."}
        </p>

        {/* Action Button Deck & Slide Carousel Controls */}
        <div className="pt-2 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* Primary Watch Button (Solid Crisp White) */}
            <button
              onClick={handlePlayNow}
              className="px-6 py-3 rounded-xl bg-white hover:bg-zinc-200 text-black font-bold text-xs tracking-wider uppercase flex items-center gap-2 transition cursor-pointer shadow-lg hover:scale-105"
            >
              <Play className="w-3.5 h-3.5 stroke-[2] fill-black text-black" />
              <span>Watch Now</span>
            </button>

            {/* Quick Preview Button (Dark Tertiary #252525) */}
            <button
              onClick={() => setQuickViewOpen(true)}
              className="px-5 py-3 rounded-xl bg-[#252525] hover:bg-[#333333] text-white font-bold text-xs tracking-wider uppercase border border-white/10 flex items-center gap-2 transition cursor-pointer shadow-md hover:scale-105"
            >
              <Info className="w-3.5 h-3.5 stroke-[1.5]" />
              <span>Preview</span>
            </button>

            {/* Bookmark Toggle (Dark Tertiary #252525) */}
            <button
              onClick={handleToggleBookmark}
              className={`p-3 rounded-xl border transition cursor-pointer shadow-md hover:scale-105 ${
                isSaved 
                  ? 'bg-white border-white text-black' 
                  : 'bg-[#252525] border-white/10 text-white hover:bg-[#333333]'
              }`}
              title={isSaved ? "Saved in My List" : "Save to My List"}
            >
              <Bookmark className="w-4 h-4 stroke-[1.5]" />
            </button>
          </div>

          {/* Carousel Slide Indicators (< - • • • >) matching Image 1 */}
          {slides.length > 1 && (
            <div className="hidden sm:flex items-center gap-2">
              <button 
                onClick={prevSlide} 
                className="w-8 h-8 rounded-lg bg-[#252525] hover:bg-[#333333] border border-white/10 text-white flex items-center justify-center transition cursor-pointer shadow-sm hover:scale-105"
                aria-label="Previous slide"
              >
                <ChevronLeft className="w-3.5 h-3.5 stroke-[1.5]" />
              </button>
              
              <div className="flex items-center gap-1.5 px-2">
                {slides.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={`rounded-full transition-all duration-300 cursor-pointer ${
                      currentIndex === idx 
                        ? 'w-6 h-1.5 bg-white' 
                        : 'w-1.5 h-1.5 bg-white/30 hover:bg-white/60'
                    }`}
                  />
                ))}
              </div>

              <button 
                onClick={nextSlide} 
                className="w-8 h-8 rounded-lg bg-[#252525] hover:bg-[#333333] border border-white/10 text-white flex items-center justify-center transition cursor-pointer shadow-sm hover:scale-105"
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
