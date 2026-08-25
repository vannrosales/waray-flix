import React from 'react';
import { Search } from 'lucide-react';

export default function WatchlistFilterBar({
  activeTab,
  onTabChange,
  totalCount,
  movieCount,
  tvCount,
  searchQuery,
  onSearchChange
}) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
        <button
          onClick={() => onTabChange('all')}
          className={`px-4 py-2 rounded-full text-xs font-mono transition cursor-pointer ${
            activeTab === 'all'
              ? 'bg-white text-black font-semibold shadow-sm'
              : 'bg-white/[0.06] hover:bg-white/[0.12] text-zinc-400 hover:text-white border border-white/[0.08]'
          }`}
        >
          All ({totalCount})
        </button>

        <button
          onClick={() => onTabChange('movie')}
          className={`px-4 py-2 rounded-full text-xs font-mono transition cursor-pointer ${
            activeTab === 'movie'
              ? 'bg-white text-black font-semibold shadow-sm'
              : 'bg-white/[0.06] hover:bg-white/[0.12] text-zinc-400 hover:text-white border border-white/[0.08]'
          }`}
        >
          Movies ({movieCount})
        </button>

        <button
          onClick={() => onTabChange('tv')}
          className={`px-4 py-2 rounded-full text-xs font-mono transition cursor-pointer ${
            activeTab === 'tv'
              ? 'bg-white text-black font-semibold shadow-sm'
              : 'bg-white/[0.06] hover:bg-white/[0.12] text-zinc-400 hover:text-white border border-white/[0.08]'
          }`}
        >
          Series ({tvCount})
        </button>
      </div>

      {/* Library Search */}
      {totalCount > 0 && (
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400 stroke-[1.5]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Filter saved titles..."
            className="w-full bg-[#18181C] border border-white/[0.08] rounded-full pl-9 pr-4 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white/40 font-sans shadow-sm"
          />
        </div>
      )}
    </div>
  );
}
