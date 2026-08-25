import React from 'react';
import { Server, ChevronDown } from 'lucide-react';

/**
 * Server switcher component for video player HUD.
 * Renders a compact dropdown on mobile and inline pills on desktop.
 */
export default function ServerSwitcher({
  players = [],
  selectedPlayerId,
  onSelectPlayer,
  mobileMenuOpen,
  setMobileMenuOpen,
  menuRef,
  pillDark = 'flex items-center gap-1.5 rounded-full backdrop-blur-xl border border-white/10 shadow-lg transition cursor-pointer text-xs font-mono bg-[#0E1017]/90 hover:bg-[#161922] text-zinc-300 hover:text-white',
}) {
  return (
    <div className="relative" ref={menuRef}>
      {/* Mobile: compact dropdown toggle */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className={`${pillDark} px-2.5 py-1.5 md:hidden`}
        aria-label="Switch server"
      >
        <Server className="w-3.5 h-3.5 stroke-[1.5] text-zinc-400" />
        <ChevronDown className={`w-3 h-3 stroke-[1.5] transition-transform ${mobileMenuOpen ? 'rotate-180' : ''}`} />
      </button>

      {mobileMenuOpen && (
        <div className="md:hidden absolute right-0 top-full mt-2 w-40 bg-[#0E1017] border border-white/10 rounded-2xl shadow-2xl backdrop-blur-2xl z-50 overflow-hidden">
          {players.map((player) => {
            const isSelected = player.id === selectedPlayerId;
            return (
              <button
                key={player.id}
                onClick={() => {
                  onSelectPlayer(player.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-3 text-xs font-mono transition cursor-pointer ${
                  isSelected ? 'bg-white text-black font-semibold' : 'text-zinc-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <span>{player.name}</span>
                {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-black flex-shrink-0" />}
              </button>
            );
          })}
        </div>
      )}

      {/* Desktop: inline pill switcher */}
      <div className="hidden md:flex items-center bg-[#0E1017]/90 p-1 rounded-full border border-white/10 backdrop-blur-xl shadow-lg">
        {players.map((player) => {
          const isSelected = player.id === selectedPlayerId;
          return (
            <button
              key={player.id}
              onClick={() => onSelectPlayer(player.id)}
              className={`px-3 py-1 rounded-full text-xs font-mono transition cursor-pointer ${
                isSelected ? 'bg-white text-black font-semibold shadow-sm' : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {player.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}

