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
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-black/[0.08] pb-4">
      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
        <button
          onClick={() => onTabChange('all')}
          className={`px-4 py-2 rounded-full text-xs font-mono transition cursor-pointer ${
            activeTab === 'all'
              ? 'bg-[#09090B] text-white font-semibold shadow-sm'
              : 'bg-black/[0.04] hover:bg-black/[0.08] text-[#52525B] hover:text-[#09090B] border border-black/[0.08]'
          }`}
        >
          All ({totalCount})
        </button>

        <button
          onClick={() => onTabChange('movie')}
          className={`px-4 py-2 rounded-full text-xs font-mono transition cursor-pointer ${
            activeTab === 'movie'
              ? 'bg-[#09090B] text-white font-semibold shadow-sm'
              : 'bg-black/[0.04] hover:bg-black/[0.08] text-[#52525B] hover:text-[#09090B] border border-black/[0.08]'
          }`}
        >
          Movies ({movieCount})
        </button>

        <button
          onClick={() => onTabChange('tv')}
          className={`px-4 py-2 rounded-full text-xs font-mono transition cursor-pointer ${
            activeTab === 'tv'
              ? 'bg-[#09090B] text-white font-semibold shadow-sm'
              : 'bg-black/[0.04] hover:bg-black/[0.08] text-[#52525B] hover:text-[#09090B] border border-black/[0.08]'
          }`}
        >
          Series ({tvCount})
        </button>
      </div>

      {/* Library Search */}
      {totalCount > 0 && (
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#52525B] stroke-[1.5]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Filter saved titles..."
            className="w-full bg-white border border-black/[0.08] rounded-full pl-9 pr-4 py-1.5 text-xs text-[#09090B] placeholder-[#52525B] focus:outline-none focus:border-[#2563EB] font-sans shadow-sm"
          />
        </div>
      )}
    </div>
  );
}

