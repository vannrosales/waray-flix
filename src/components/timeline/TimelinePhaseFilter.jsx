import React from 'react';

export default function TimelinePhaseFilter({ phases, activePhase, onSelectPhase }) {
  if (!phases || phases.length === 0) return null;

  return (
    <div className="flex items-center gap-2 border-b border-black/[0.08] pb-4 overflow-x-auto scrollbar-none">
      {phases.map(phase => (
        <button
          key={phase.id}
          onClick={() => onSelectPhase(phase.id)}
          className={`px-4 py-1.5 rounded-full text-xs font-medium transition cursor-pointer flex-shrink-0 ${
            activePhase === phase.id
              ? 'bg-[#09090B] text-white font-bold shadow-xs'
              : 'bg-black/[0.04] text-[#52525B] hover:text-[#09090B] hover:bg-black/[0.08]'
          }`}
        >
          {phase.label}
        </button>
      ))}
    </div>
  );
}

