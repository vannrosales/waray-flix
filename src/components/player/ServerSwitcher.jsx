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
  pillDark = 'flex items-center gap-1.5 rounded-full backdrop-blur-xl border border-white/10 shadow-md transition cursor-pointer text-xs bg-[#121212]/90 hover:bg-[#252525] text-zinc-300 hover:text-white',
}) {
  return (
    <div className="relative" ref={menuRef}>
      {/* Mobile: compact dropdown toggle */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className={`${pillDark} p-2 sm:px-2.5 sm:py-1.5 md:hidden shrink-0 font-bold`}
        aria-label="Switch server"
        title="Change Streaming Server"
      >
        <Server className="w-3.5 h-3.5 stroke-[2] text-zinc-400" />
        <ChevronDown className={`w-3 h-3 stroke-[2] transition-transform ${mobileMenuOpen ? 'rotate-180' : ''}`} />
      </button>

      {mobileMenuOpen && (
        <div className="md:hidden absolute right-0 top-full mt-2 w-44 bg-[#121212] border border-white/15 rounded-2xl shadow-2xl backdrop-blur-2xl z-50 overflow-hidden animate-fade-in">
          <div className="px-3.5 py-2 border-b border-white/[0.08] text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
            Select Server
          </div>
          <div className="p-1 space-y-0.5">
            {players.map((player) => {
              const isSelected = player.id === selectedPlayerId;
              return (
                <button
                  key={player.id}
                  onClick={() => {
                    onSelectPlayer(player.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                    isSelected ? 'bg-white text-black shadow-sm' : 'text-zinc-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <span>{player.name}</span>
                  {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-black flex-shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Desktop: inline pill switcher */}
      <div className="hidden md:flex items-center bg-[#121212]/90 p-1 rounded-full border border-white/10 backdrop-blur-xl shadow-md shrink-0">
        {players.map((player) => {
          const isSelected = player.id === selectedPlayerId;
          return (
            <button
              key={player.id}
              onClick={() => onSelectPlayer(player.id)}
              className={`px-3 py-1 rounded-full text-xs font-bold transition cursor-pointer ${
                isSelected ? 'bg-white text-black shadow-sm' : 'text-zinc-400 hover:text-white hover:bg-white/5'
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
