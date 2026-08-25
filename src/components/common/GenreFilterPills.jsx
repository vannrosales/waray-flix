import React from 'react';

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
                ? 'bg-white text-black font-bold shadow-sm'
                : 'bg-white/[0.06] text-zinc-400 hover:text-white hover:bg-white/[0.12] border border-white/[0.08]'
            }`}
          >
            {g.name}
          </button>
        );
      })}
    </div>
  );
}
