import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IMAGE_BASE_URL, fetchMediaVideos } from '../services/tmdb';
import { Play, Star, VolumeX, Volume2 } from 'lucide-react';

export default function Hero({ content }) {
  const navigate = useNavigate();
  const [trailerKey, setTrailerKey] = useState(null);
  const [isMuted, setIsMuted] = useState(true);
  const [showVideo, setShowVideo] = useState(false);

  const itemType = content?.media_type || (content?.first_air_date ? 'tv' : 'movie');

  useEffect(() => {
    let isMounted = true;
    async function loadTrailer() {
      if (!content?.id) return;
      try {
        const videos = await fetchMediaVideos(content.id, itemType);
        const trailer = videos.find(v => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser'));
        if (trailer && isMounted) {
          setTrailerKey(trailer.key);
          const timer = setTimeout(() => setShowVideo(true), 1500);
          return () => clearTimeout(timer);
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadTrailer();
    return () => {
      isMounted = false;
      setTrailerKey(null);
      setShowVideo(false);
    };
  }, [content, itemType]);

  if (!content) {
    return (
      <div className="w-full h-[65vh] bg-[#0B0D10] animate-pulse flex items-center justify-center text-zinc-700 font-mono text-xs">
        LOADING_HERO_NODE
      </div>
    );
  }

  const backdrop = content.backdrop_path ? `${IMAGE_BASE_URL}${content.backdrop_path}` : null;
  const releaseYear = content.release_date?.substring(0, 4) || content.first_air_date?.substring(0, 4) || '2026';

  return (
    <div className="relative h-[70vh] w-full overflow-hidden flex items-end">
      
      {/* Background Layer: Static Backdrop with Smooth Fade-Out */}
      {backdrop && (
        <img 
          src={backdrop} 
          alt="" 
          className={`absolute inset-0 w-full h-full object-cover object-center scale-105 transition-opacity duration-1000 ${
            showVideo && trailerKey ? 'opacity-0' : 'opacity-35'
          }`}
        />
      )}

      {/* Background Layer: Autoplaying YouTube Trailer Container with Fade-In */}
      {trailerKey && (
        <div className={`absolute inset-0 w-full h-full pointer-events-none overflow-hidden flex items-center justify-center transition-opacity duration-1000 ${
          showVideo ? 'opacity-70' : 'opacity-0'
        }`}>
          <div className="absolute w-[300%] h-[300%] md:w-[180%] md:h-[180%]">
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
      <div className="absolute inset-0 bg-gradient-to-t from-[#0B0D10] via-[#0B0D10]/40 to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#0B0D10]/90 via-transparent to-transparent opacity-80 pointer-events-none" />

      {/* Audio Mute/Unmute Toggle Button */}
      {showVideo && trailerKey && (
        <div className="absolute bottom-14 right-6 md:right-16 z-20 animate-fade-in">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="w-10 h-10 rounded-full bg-black/60 hover:bg-black/90 border border-white/10 flex items-center justify-center text-white backdrop-blur-md transition-all cursor-pointer"
            title={isMuted ? "Unmute Trailer" : "Mute Trailer"}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      )}

      {/* Hero Content Information */}
      <div className="relative z-10 max-w-[1400px] w-full mx-auto px-6 md:px-16 pb-14 space-y-4">
        
        {/* Subtle Metadata Monospace Line */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-400 font-mono tracking-wider">
          <span className="text-white font-medium">{releaseYear}</span>
          <span>·</span>
          <span className="uppercase">{itemType}</span>
          {content.vote_average > 0 && (
            <>
              <span>·</span>
              <span className="flex items-center gap-1 text-amber-400 font-bold">
                <Star className="w-3.5 h-3.5 fill-current" /> {content.vote_average.toFixed(1)}
              </span>
            </>
          )}
        </div>

        {/* Clean Typography Title */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-white font-['Outfit'] max-w-4xl leading-[1.05]">
          {content.title || content.name}
        </h1>

        {/* Overview Excerpt */}
        <p className="text-zinc-400 text-xs sm:text-sm line-clamp-2 max-w-2xl font-light leading-relaxed">
          {content.overview}
        </p>

        {/* Minimalist Action Trigger */}
        <div className="pt-2 flex items-center gap-4">
          <button
            onClick={() => navigate(`/details/${itemType}/${content.id}`)}
            className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full bg-white hover:bg-zinc-200 text-black font-bold text-xs tracking-wider uppercase transition-all duration-300 shadow-xl transform active:scale-95 cursor-pointer"
          >
            <Play className="w-3 h-3 fill-current" />
            <span>Explore Title</span>
          </button>
        </div>

      </div>
    </div>
  );
}