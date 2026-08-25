import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Play, X, Film } from 'lucide-react';
import { getImageUrl } from '../../services/tmdb';

export default function WatchlistHistorySection({ history, onClearHistory, onRemoveHistoryItem }) {
  const navigate = useNavigate();
  if (!history || history.length === 0) return null;

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-white stroke-[2]" />
          <h2 className="text-base sm:text-lg font-bold text-white font-['Outfit']">
            Continue Watching ({history.length})
          </h2>
        </div>
        <button
          onClick={onClearHistory}
          className="text-[11px] font-mono text-zinc-400 hover:text-white transition cursor-pointer"
        >
          Clear History
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {history.map((item) => {
          const poster = getImageUrl(item.poster_path || item.backdrop_path, 'posterSmall');
          const itemType = item.type || (item.season ? 'tv' : 'movie');
          const progressPercent = item.totalSeconds > 0 
            ? Math.min(100, Math.round((item.lastWatchedSeconds / item.totalSeconds) * 100))
            : 0;

          const watchUrl = item.type === 'tv'
            ? `/watch/tv/${item.id}/${item.season || 1}/${item.episode || 1}?startAt=${item.lastWatchedSeconds || 0}`
            : `/watch/movie/${item.id}?startAt=${item.lastWatchedSeconds || 0}`;

          return (
            <div 
              key={item.id}
              onClick={() => navigate(`/details/${itemType}/${item.id}`)}
              className="group relative rounded-2xl bg-[#18181C] border border-white/[0.08] hover:border-white/40 p-3.5 space-y-3 transition duration-200 shadow-sm hover:shadow-md cursor-pointer"
            >
              <div className="flex gap-3.5">
                {/* Thumbnail */}
                <div className="relative w-18 sm:w-20 aspect-[2/3] rounded-xl overflow-hidden bg-zinc-900 flex-shrink-0 border border-white/10">
                  {poster ? (
                    <img src={poster} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-500">
                      <Film className="w-5 h-5 stroke-[1.5]" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block font-semibold">
                      {item.type === 'tv' ? `S${item.season || 1} E${item.episode || 1}` : 'MOVIE'}
                    </span>
                    <h3 className="text-sm font-semibold text-white truncate font-['Outfit'] leading-tight group-hover:text-zinc-300 transition">
                      {item.title || item.name || 'Untitled Stream'}
                    </h3>
                  </div>

                  {/* Progress Bar & Actions */}
                  <div className="space-y-2">
                    {progressPercent > 0 && (
                      <div className="space-y-1">
                        <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-white transition-all duration-300"
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>
                        <span className="text-[9px] font-mono text-zinc-400 block font-medium">
                          {progressPercent}% completed
                        </span>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(watchUrl);
                        }}
                        className="flex-1 py-1.5 px-3 rounded-xl bg-white text-black text-[11px] font-semibold font-mono uppercase tracking-wider flex items-center justify-center gap-1.5 transition hover:bg-zinc-200 shadow-sm"
                      >
                        <Play className="w-3 h-3 stroke-[2] fill-black" />
                        <span>Resume</span>
                      </button>

                      <button
                        onClick={(e) => onRemoveHistoryItem(e, item.id)}
                        className="p-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.15] text-zinc-400 hover:text-white border border-white/[0.08] transition cursor-pointer"
                        title="Remove from history"
                      >
                        <X className="w-3.5 h-3.5 stroke-[1.5]" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
