import React from 'react';
import { useNavigate } from 'react-router-dom';
import { getImageUrl } from '../../services/tmdb';
import { getMediaTitle, getReleaseYear, formatRating } from '../../utils/formatters';
import { Star, Film, Eye } from 'lucide-react';

export default function MediaCard({
  media,
  mediaType = 'movie',
  onQuickView = null,
  showRating = true,
  showType = true,
  customBadge = null,
  aspect = 'aspect-[2/3]',
  className = '',
}) {
  const navigate = useNavigate();
  if (!media) return null;

  const resolvedType = media.media_type || (media.first_air_date ? 'tv' : mediaType);
  const title = getMediaTitle(media);
  const year = getReleaseYear(media);
  const rating = formatRating(media.vote_average);
  const poster = getImageUrl(media.poster_path, 'posterSmall') || getImageUrl(media.backdrop_path, 'backdropSmall');

  const handleClick = () => {
    navigate(`/details/${resolvedType}/${media.id}`);
  };

  return (
    <div
      onClick={handleClick}
      className={`cursor-pointer group/item flex flex-col gap-2 flex-shrink-0 transition-all duration-200 ${className}`}
    >
      {/* Poster Card Canvas */}
      <div className={`relative ${aspect} w-full rounded-2xl overflow-hidden bg-[#18181C] border border-white/[0.08] group-hover/item:border-white/40 transition-all duration-200 group-hover/item:scale-[1.02] shadow-sm hover:shadow-md`}>
        {poster ? (
          <img
            src={poster}
            alt={title}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover transition duration-300 group-hover/item:brightness-105"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-3 text-center text-zinc-500 bg-[#18181C]">
            <Film className="w-6 h-6 mb-1 opacity-30 stroke-[1.5]" />
            <span className="text-[9px] font-mono text-zinc-500 line-clamp-2">{title}</span>
          </div>
        )}

        {/* Top Badges */}
        <div className="absolute top-2 inset-x-2 flex items-center justify-between pointer-events-none z-20">
          {customBadge && (
            <span className="bg-black/90 text-white text-[9px] font-mono font-bold px-2 py-0.5 rounded-md shadow-sm border border-white/10">
              {customBadge}
            </span>
          )}

          {showRating && rating && (
            <div className="ml-auto bg-black/80 backdrop-blur-md px-2 py-0.5 rounded-md flex items-center gap-1 border border-white/15 shadow-sm text-white">
              <Star className="w-2.5 h-2.5 text-white fill-white stroke-[1.5]" />
              <span className="text-[10px] font-mono font-bold text-white">{rating}</span>
            </div>
          )}
        </div>

        {/* Quick View Hover Button */}
        {onQuickView && (
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/item:opacity-100 transition-opacity duration-200 flex items-center justify-center pointer-events-none">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onQuickView(media);
              }}
              className="pointer-events-auto flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white text-black text-[11px] font-semibold shadow-lg hover:scale-105 transition"
            >
              <Eye className="w-3.5 h-3.5 stroke-[2]" />
              <span>Preview</span>
            </button>
          </div>
        )}
      </div>

      {/* Title & Metadata */}
      <div className="space-y-0.5 px-0.5">
        <h3 className="text-xs font-semibold text-white line-clamp-1 group-hover/item:text-zinc-300 transition">
          {title}
        </h3>
        <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 font-mono">
          <span>{year}</span>
          {showType && (
            <>
              <span>·</span>
              <span className="uppercase font-medium">{resolvedType === 'tv' ? 'Series' : 'Movie'}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
