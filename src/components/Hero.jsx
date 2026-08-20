import React from 'react';
import { useNavigate } from 'react-router-dom';
import { IMAGE_BASE_URL } from '../services/tmdb';
import { Play, Star, Clock } from 'lucide-react';

export default function Hero({ content }) {
  const navigate = useNavigate();

  if (!content) {
    return (
      <div className="w-full h-[65vh] bg-[#0B0D10] animate-pulse flex items-center justify-center text-zinc-700 font-mono text-xs">
        LOADING_HERO_NODE
      </div>
    );
  }

  const backdrop = content.backdrop_path ? `${IMAGE_BASE_URL}${content.backdrop_path}` : null;
  const itemType = content.media_type || (content.first_air_date ? 'tv' : 'movie');
  const releaseYear = content.release_date?.substring(0, 4) || content.first_air_date?.substring(0, 4) || '2026';

  return (
    <div className="relative h-[70vh] w-full overflow-hidden flex items-end">
      {/* Immersive Background Canvas */}
      {backdrop && (
        <img 
          src={backdrop} 
          alt="" 
          className="absolute inset-0 w-full h-full object-cover object-center brightness-[0.35] scale-105"
        />
      )}
      
      {/* Clean Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0B0D10] via-[#0B0D10]/40 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#0B0D10]/80 via-transparent to-transparent opacity-60" />

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
        <div className="pt-2">
          <button
            onClick={() => navigate(`/details/${itemType}/${content.id}`)}
            className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full bg-white hover:bg-zinc-200 text-black font-bold text-xs tracking-wider uppercase transition-all duration-300 shadow-xl"
          >
            <Play className="w-3 h-3 fill-current" />
            <span>Explore Title</span>
          </button>
        </div>

      </div>
    </div>
  );
}