import React from 'react';
import { Sparkles, CheckCheck, RotateCcw } from 'lucide-react';

export default function TimelineProgressShelf({
  watchedCount,
  totalCount,
  progressPercent,
  onMarkAll,
  onReset
}) {
  return (
    <div className="bg-[#18181C] border border-white/[0.08] rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
      {/* Left: Lore & Timeline Scope */}
      <div className="space-y-1 text-center md:text-left">
        <div className="flex items-center justify-center md:justify-start gap-2 text-xs text-white font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 stroke-[2] text-white" />
          <span>MARVEL CINEMATIC UNIVERSE CANON</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
          Road to Avengers: Doomsday Checklist
        </h2>
        <p className="text-xs text-zinc-400">
          15 Essential Titles • Phase 1 to Phase 6 Chronological Sequence
        </p>
      </div>

      {/* Progress Tracker Dial */}
      <div className="w-full md:w-80 space-y-2 border-t md:border-t-0 md:border-l border-white/[0.08] pt-4 md:pt-0 md:pl-6">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-white">
            Your Progress ({watchedCount}/{totalCount})
          </span>
          <span className="font-bold text-white">{progressPercent}% Ready</span>
        </div>
        <div className="w-full h-2.5 bg-zinc-900 rounded-full overflow-hidden border border-white/10 p-0.5">
          <div 
            className="h-full rounded-full bg-white transition-all duration-500 shadow-sm"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="flex items-center gap-3 pt-0.5 text-xs">
          <button
            onClick={() => onMarkAll(true)}
            className="text-[11px] text-zinc-400 hover:text-white flex items-center gap-1 transition cursor-pointer hover:underline"
          >
            <CheckCheck className="w-3 h-3 stroke-[2] text-white" />
            <span>Mark all</span>
          </button>
          <span className="text-zinc-600">·</span>
          <button
            onClick={() => onMarkAll(false)}
            className="text-[11px] text-zinc-400 hover:text-white flex items-center gap-1 transition cursor-pointer hover:underline"
          >
            <RotateCcw className="w-3 h-3 stroke-[2]" />
            <span>Reset</span>
          </button>
        </div>
      </div>
    </div>
  );
}
