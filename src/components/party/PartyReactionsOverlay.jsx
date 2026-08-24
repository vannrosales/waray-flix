import React from 'react';

export default function PartyReactionsOverlay({ reactions }) {
  if (!reactions || reactions.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-40 overflow-hidden">
      {reactions.map((r) => (
        <div
          key={r.id}
          style={{ left: `${r.left}%` }}
          className="absolute bottom-12 text-3xl sm:text-4xl animate-slide-up transition-all duration-1000 opacity-90"
        >
          {r.emoji}
        </div>
      ))}
    </div>
  );
}

