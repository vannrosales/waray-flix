import React from 'react';
import { useNavigate } from 'react-router-dom';
import { getImageUrl } from '../../services/tmdb';
import { getMediaTitle, getReleaseYear, formatRating } from '../../utils/formatters';
import { Star, Film, Eye } from 'lucide-react';

/**
 * Reusable MediaCard component for movie, series, and anime grids.
 * 
 * Props:
 * - media: object containing TMDB media data
 * - mediaType: 'movie' | 'tv' | 'anime' (optional fallback if media.media_type is unset)
 * - onQuickView: optional callback (media) => void to open preview modal
 * - showRating: boolean (default: true)
 * - showType: boolean (default: true)
 * - customBadge: string (optional e.g. "S2 E4")
 * - aspect: string (default: "aspect-[2/3]")
 */
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
      <div className={`relative ${aspect} w-full rounded-2xl overflow-hidden bg-white border border-black/[0.06] group-hover/item:border-[#2563EB]/40 transition-all duration-200 group-hover/item:scale-[1.02] shadow-sm hover:shadow-md`}>
        {poster ? (
          <img
            src={poster}
            alt={title}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover transition duration-300 group-hover/item:brightness-105"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-3 text-center text-zinc-400 bg-zinc-100">
            <Film className="w-6 h-6 mb-1 opacity-30 stroke-[1.5]" />
            <span className="text-[9px] font-mono text-[#52525B] line-clamp-2">{title}</span>
          </div>
        )}

        {/* Top Badges */}
        <div className="absolute top-2 inset-x-2 flex items-center justify-between pointer-events-none z-20">
          {customBadge && (
            <span className="bg-[#09090B]/90 text-white text-[9px] font-mono font-bold px-2 py-0.5 rounded-md shadow-sm">
              {customBadge}
            </span>
          )}

          {showRating && rating && (
            <div className="ml-auto bg-white/90 backdrop-blur-md px-2 py-0.5 rounded-md flex items-center gap-1 border border-black/10 shadow-sm">
              <Star className="w-2.5 h-2.5 text-[#2563EB] fill-[#2563EB] stroke-[1.5]" />
              <span className="text-[10px] font-mono font-bold text-[#09090B]">{rating}</span>
            </div>
          )}
        </div>

        {/* Quick View Hover Button */}
        {onQuickView && (
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/item:opacity-100 transition-opacity duration-200 flex items-center justify-center pointer-events-none">
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
        <h3 className="text-xs font-semibold text-[#09090B] line-clamp-1 group-hover/item:text-[#2563EB] transition">
          {title}
        </h3>
        <div className="flex items-center gap-1.5 text-[10px] text-[#52525B] font-mono">
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

