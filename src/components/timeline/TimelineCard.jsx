import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Check, Eye, Film } from 'lucide-react';
import { getImageUrl } from '../../services/tmdb';

export default function TimelineCard({
  item,
  liveData,
  isChecked,
  onToggleCheck,
  onQuickView
}) {
  const navigate = useNavigate();
  if (!item) return null;

  const rawPoster = liveData?.poster_path || item.posterPath;
  const rawBackdrop = liveData?.backdrop_path || item.backdropPath;
  const posterUrl = getImageUrl(rawPoster, 'posterSmall') || getImageUrl(rawBackdrop, 'backdropSmall');

  return (
    <div
      onClick={() => navigate(`/details/${item.mediaType}/${item.id}`)}
      className="cursor-pointer group/item flex flex-col gap-2 flex-shrink-0 transition-all duration-200"
    >
      {/* Poster Canvas */}
      <div className={`relative aspect-[2/3] w-full rounded-2xl overflow-hidden bg-white border border-black/[0.06] group-hover/item:border-[#2563EB]/40 transition-all duration-200 group-hover/item:scale-[1.02] shadow-sm hover:shadow-md ${
        isChecked ? 'ring-2 ring-[#2563EB]/30' : ''
      }`}>
        {posterUrl ? (
          <img 
            src={posterUrl} 
            alt={item.title} 
            loading="lazy"
            decoding="async"
            className={`absolute inset-0 w-full h-full object-cover transition duration-300 group-hover/item:brightness-105 ${
              isChecked ? 'brightness-95' : ''
            }`}
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-3 text-center text-zinc-400 bg-zinc-100">
            <Film className="w-6 h-6 mb-1 opacity-30 stroke-[1.5]" />
            <span className="text-[9px] font-mono text-[#52525B] line-clamp-2">{item.title}</span>
          </div>
        )}

        {/* Top Left: Chronological Number Badge */}
        <div className="absolute top-2 left-2 z-20 pointer-events-none">
          <span className="bg-[#09090B]/90 text-white text-[9px] font-mono font-bold px-2 py-0.5 rounded-md shadow-xs">
            #{item.order}
          </span>
        </div>

        {/* Top Right: Watched Checkbox Pill */}
        <div className="absolute top-2 right-2 z-20">
          <button
            onClick={(e) => onToggleCheck(item.id, e)}
            className={`px-2 py-0.5 rounded-md text-[9px] font-mono font-bold flex items-center gap-1 transition cursor-pointer shadow-xs ${
              isChecked
                ? 'bg-[#2563EB] text-white'
                : 'bg-white/90 backdrop-blur-md text-[#09090B] border border-black/10 hover:bg-white'
            }`}
            title={isChecked ? 'Mark as unwatched' : 'Mark as watched'}
          >
            {isChecked ? (
              <>
                <Check className="w-2.5 h-2.5 stroke-[3]" />
                <span>Watched</span>
              </>
            ) : (
              <span>+ Watch</span>
            )}
          </button>
        </div>

        {/* Hover Quick Action Deck */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/item:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2 z-30 p-2 pointer-events-none">
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (item.mediaType === 'tv') {
                navigate(`/watch/tv/${item.id}/1/1`);
              } else {
                navigate(`/watch/movie/${item.id}`);
              }
            }}
            className="pointer-events-auto w-9 h-9 rounded-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white flex items-center justify-center transition cursor-pointer shadow-md hover:scale-105"
            title="Watch Now"
          >
            <Play className="w-3.5 h-3.5 stroke-[2] fill-white text-white" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onQuickView({ ...item, media_type: item.mediaType });
            }}
            className="pointer-events-auto w-8 h-8 rounded-full bg-white/90 hover:bg-white text-[#09090B] backdrop-blur-md flex items-center justify-center border border-black/10 transition cursor-pointer shadow-xs hover:scale-105"
            title="Quick Preview"
          >
            <Eye className="w-3.5 h-3.5 stroke-[1.5]" />
          </button>
        </div>
      </div>

      {/* Title & Metadata */}
      <div className="space-y-0.5 px-0.5">
        <h3 className={`text-xs font-semibold line-clamp-1 transition group-hover/item:text-[#2563EB] ${
          isChecked ? 'text-zinc-500 line-through' : 'text-[#09090B]'
        }`}>
          {item.title}
        </h3>
        <div className="flex items-center gap-1.5 text-[10px] text-[#52525B] font-mono">
          <span>{item.year}</span>
          <span>·</span>
          <span className="uppercase font-medium">{item.mediaType}</span>
          {item.importanceLabel && (
            <>
              <span>·</span>
              <span className="text-[#2563EB] font-bold">{item.importanceLabel}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

