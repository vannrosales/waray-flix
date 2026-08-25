import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Layers, Play } from 'lucide-react';
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
    <div className="border-t border-black/[0.08] pt-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#2563EB] stroke-[1.5]" />
          <h3 className="text-lg font-bold text-[#09090B] font-['Outfit']">Episodes</h3>
        </div>

        {/* Season Select */}
        <div className="relative">
          <select
            value={selectedSeason}
            onChange={(e) => onSelectSeason(Number(e.target.value))}
            className="appearance-none bg-white hover:bg-zinc-50 border border-black/10 text-[#09090B] text-xs font-mono py-2 pl-3.5 pr-8 rounded-full focus:outline-none focus:border-[#2563EB] transition cursor-pointer shadow-sm"
          >
            {media.seasons.map((season) => (
              <option key={season.id} value={season.season_number} className="bg-white text-[#09090B]">
                {season.name} {season.episode_count ? `(${season.episode_count} Ep)` : ''}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Episodes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {seasonData?.episodes && seasonData.episodes.length > 0 ? (
          seasonData.episodes.map((ep) => {
            const epStill = getImageUrl(ep.still_path, 'backdropSmall') || backdrop;
            return (
              <div 
                key={ep.id}
                onClick={() => navigate(`/watch/tv/${media.id}/${selectedSeason}/${ep.episode_number}`)}
                className="group flex gap-3 p-3 rounded-2xl bg-white hover:bg-zinc-50 border border-black/[0.06] hover:border-[#2563EB]/40 cursor-pointer transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <div className="w-28 sm:w-36 aspect-video rounded-xl bg-zinc-100 overflow-hidden flex-shrink-0 relative border border-black/10">
                  {epStill ? (
                    <img src={epStill} alt="" className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-400 text-[9px] font-mono">NO IMAGE</div>
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                    <Play className="w-5 h-5 text-white stroke-[2] fill-white" />
                  </div>
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-mono text-[#52525B]">
                    <span className="font-bold text-[#2563EB]">EP {ep.episode_number}</span>
                    {ep.runtime && <span>{ep.runtime}m</span>}
                  </div>
                  <h4 className="text-xs font-semibold text-[#09090B] group-hover:text-[#2563EB] truncate">
                    {ep.name}
                  </h4>
                  <p className="text-[11px] text-[#52525B] line-clamp-1 font-normal">
                    {ep.overview || "Stream this episode now."}
                  </p>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-2 text-xs text-[#52525B] font-mono py-8 text-center">
            Loading season episodes...
          </div>
        )}
      </div>
    </div>
  );
}

