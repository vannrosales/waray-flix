import React from 'react';
import { X, Play } from 'lucide-react';

/**
 * TV Episode drawer for fast episode switching and binge navigation.
 */
export default function EpisodeDrawer({
  isOpen,
  onClose,
  mediaTitle,
  tvShowDetails,
  selectedSeason,
  onSelectSeason,
  episodes = [],
  currentSeason,
  currentEpisode,
  onSelectEpisode,
}) {
  if (!isOpen) return null;

  return (
    <div className="absolute inset-y-0 right-0 w-full max-w-[min(420px,100vw)] bg-[#0E1017]/95 border-l border-white/10 backdrop-blur-2xl z-40 flex flex-col shadow-2xl">
      {/* Drawer Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 flex-shrink-0">
        <div>
          <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Binge Drawer</span>
          <h2 className="text-base font-bold text-white truncate max-w-[220px]">{mediaTitle || 'Episodes'}</h2>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer flex-shrink-0"
          aria-label="Close episode drawer"
        >
          <X className="w-4 h-4 stroke-[1.5]" />
        </button>
      </div>

      {/* Season Select */}
      {tvShowDetails?.seasons && (
        <div className="px-5 pt-4 pb-2 flex-shrink-0">
          <label className="text-[10px] font-mono text-zinc-500 uppercase block mb-1.5">Season</label>
          <select
            value={selectedSeason}
            onChange={(e) => onSelectSeason(Number(e.target.value))}
            className="w-full bg-[#161922] border border-white/10 text-white text-xs font-mono rounded-xl p-2.5 focus:outline-none focus:border-white/30 cursor-pointer"
          >
            {tvShowDetails.seasons.filter(s => s.season_number > 0).map(s => (
              <option key={s.id} value={s.season_number}>
                Season {s.season_number} ({s.episode_count} eps)
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Episodes List */}
      <div className="flex-1 overflow-y-auto px-5 pb-6 pt-2 space-y-1.5">
        {episodes.map((ep) => {
          const isPlaying = currentSeason === ep.season_number && currentEpisode === ep.episode_number;
          return (
            <button
              key={ep.id}
              onClick={() => onSelectEpisode(ep.season_number, ep.episode_number)}
              className={`w-full text-left px-3 py-3 rounded-xl border transition cursor-pointer flex items-center justify-between gap-3 ${
                isPlaying
                  ? 'bg-white text-black border-transparent shadow-md'
                  : 'bg-white/[0.03] hover:bg-white/[0.08] text-zinc-300 hover:text-white border-white/[0.06]'
              }`}
            >
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-mono opacity-50 block">EP {ep.episode_number}</span>
                <h4 className="text-xs font-semibold truncate leading-snug">{ep.name || `Episode ${ep.episode_number}`}</h4>
              </div>
              <div className="flex-shrink-0">
                {isPlaying ? (
                  <span className="px-2 py-0.5 rounded bg-black text-white text-[9px] font-mono font-bold uppercase">
                    Playing
                  </span>
                ) : (
                  <Play className="w-3.5 h-3.5 opacity-50 stroke-[1.5]" />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

