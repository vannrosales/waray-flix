import React from 'react';

/**
 * Reusable horizontal genre / category filter pills component.
 * 
 * Props:
 * - genres: Array<{ id: string | number, name: string }>
 * - activeGenre: string | number
 * - onSelect: (id: string | number) => void
 */
export default function GenreFilterPills({
  genres = [],
  activeGenre = 'all',
  onSelect,
  className = '',
}) {
  if (!genres || genres.length === 0) return null;

  return (
    <div className={`flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1 ${className}`}>
      {genres.map((g) => {
        const isSelected = activeGenre === g.id;
        return (
          <button
            key={g.id}
            onClick={() => onSelect(g.id)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all flex-shrink-0 cursor-pointer ${
              isSelected
                ? 'bg-[#09090B] text-white font-bold shadow-sm'
                : 'bg-black/[0.04] text-[#52525B] hover:text-[#09090B] hover:bg-black/[0.08]'
            }`}
          >
            {g.name}
          </button>
        );
      })}
    </div>
  );
}

