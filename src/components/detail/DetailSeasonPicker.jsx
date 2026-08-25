import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Layers, Play, ChevronDown } from 'lucide-react';
import { getImageUrl } from '../../services/tmdb';

export default function DetailSeasonPicker({
  media,
  selectedSeason,
  onSelectSeason,
  seasonData,
  backdrop
}) {
  const navigate = useNavigate();
  if (!media?.seasons || media.seasons.length === 0) return null;

  return (
    <div className="border-t border-white/[0.08] pt-8 space-y-6 select-none">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#252525] border border-white/10 flex items-center justify-center text-white">
            <Layers className="w-4 h-4 stroke-[1.5]" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white">Episodes</h3>
            <p className="text-[11px] text-zinc-400">Select season & episode to stream</p>
          </div>
        </div>

        {/* Season Selector - Styled matching image reference */}
        <div className="relative">
          <select
            value={selectedSeason}
            onChange={(e) => onSelectSeason(Number(e.target.value))}
            className="appearance-none bg-[#252525] hover:bg-[#333333] border border-white/10 hover:border-white/30 text-white text-xs font-bold py-2.5 pl-4 pr-10 rounded-xl focus:outline-none focus:border-white/50 transition cursor-pointer shadow-sm active:scale-95"
          >
            {media.seasons.map((season) => (
              <option key={season.id} value={season.season_number} className="bg-[#121212] text-white py-1">
                {season.name} {season.episode_count ? `(${season.episode_count} Ep)` : ''}
              </option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-zinc-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none stroke-[2]" />
        </div>
      </div>

      {/* Episodes Grid with Elevated Hover */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {seasonData?.episodes && seasonData.episodes.length > 0 ? (
          seasonData.episodes.map((ep) => {
            const epStill = getImageUrl(ep.still_path, 'backdropSmall') || backdrop;
            return (
              <div 
                key={ep.id}
                onClick={() => navigate(`/watch/tv/${media.id}/${selectedSeason}/${ep.episode_number}`)}
                className="group flex gap-3.5 p-3.5 rounded-xl bg-[#121212] hover:bg-[#252525] border border-white/[0.08] hover:border-white/30 cursor-pointer transition-all duration-200 shadow-sm hover:shadow-md hover:scale-[1.01]"
              >
                {/* Episode Thumbnail */}
                <div className="w-28 sm:w-36 aspect-video rounded-lg bg-zinc-900 overflow-hidden flex-shrink-0 relative border border-white/10">
                  {epStill ? (
                    <img 
                      src={epStill} 
                      alt={ep.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-500 text-[9px]">NO IMAGE</div>
                  )}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center shadow-lg transition-transform group-hover:scale-110">
                      <Play className="w-3.5 h-3.5 stroke-[2] fill-black text-black ml-0.5" />
                    </div>
                  </div>
                </div>

                {/* Episode Info */}
                <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-bold text-white bg-white/10 px-2 py-0.5 rounded-md border border-white/10 group-hover:bg-white group-hover:text-black transition-colors">
                        EP {ep.episode_number}
                      </span>
                      {ep.runtime && <span className="text-zinc-400">{ep.runtime}m</span>}
                    </div>
                    <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-white truncate transition-colors">
                      {ep.name}
                    </h4>
                  </div>
                  <p className="text-[11px] text-zinc-400 line-clamp-2 font-normal leading-relaxed">
                    {ep.overview || "Stream this episode now in high definition."}
                  </p>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-2 text-xs text-zinc-400 py-12 text-center bg-[#121212] rounded-xl border border-white/[0.08]">
            Loading season episodes...
          </div>
        )}
      </div>
    </div>
  );
}
