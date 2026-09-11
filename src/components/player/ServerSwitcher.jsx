import React, { useState } from 'react';
import { Server, ChevronDown, Check } from 'lucide-react';

/**
 * Server switcher component for video player HUD.
 * Renders quick-switch pills on desktop + a full multi-server dropdown for all servers.
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
  const [desktopMenuOpen, setDesktopMenuOpen] = useState(false);

  const visiblePills = players.slice(0, 3);
  const overflowPlayers = players.slice(3);
  const activePlayer = players.find(p => p.id === selectedPlayerId) || players[0];
  const isOverflowActive = overflowPlayers.some(p => p.id === selectedPlayerId);

  return (
    <div className="relative" ref={menuRef}>
      {/* Mobile: compact dropdown toggle */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className={`${pillDark} p-2 sm:px-2.5 sm:py-1.5 md:hidden shrink-0 font-bold`}
        aria-label="Switch server"
        title={`Current Server: ${activePlayer?.name}`}
      >
        <Server className="w-3.5 h-3.5 stroke-[2] text-zinc-400" />
        <span className="text-[11px] max-w-[70px] truncate hidden xs:inline">{activePlayer?.name}</span>
        <ChevronDown className={`w-3 h-3 stroke-[2] transition-transform ${mobileMenuOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute right-0 top-full mt-2 w-52 max-h-80 overflow-y-auto bg-[#121212]/95 border border-white/15 rounded-2xl shadow-2xl backdrop-blur-2xl z-50 p-1.5 animate-fade-in scrollbar-thin scrollbar-thumb-white/10">
          <div className="px-3 py-1.5 border-b border-white/[0.08] text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center justify-between">
            <span>Select Server</span>
            <span className="text-[9px] text-cyan-400 font-normal">{players.length} Available</span>
          </div>
          <div className="pt-1 space-y-0.5">
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
                  <span className="truncate">{player.name}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 stroke-[2.5] text-black flex-shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Desktop: quick pills + "More" dropdown */}
      <div className="hidden md:flex items-center bg-[#121212]/90 p-1 rounded-full border border-white/10 backdrop-blur-xl shadow-md shrink-0 gap-0.5">
        {visiblePills.map((player) => {
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

        {/* More Servers Dropdown Button */}
        {overflowPlayers.length > 0 && (
          <div className="relative">
            <button
              onClick={() => setDesktopMenuOpen(!desktopMenuOpen)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition cursor-pointer ${
                isOverflowActive
                  ? 'bg-white text-black shadow-sm'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
              title="More Streaming Servers"
            >
              <span>{isOverflowActive ? activePlayer?.name : `+${overflowPlayers.length} More`}</span>
              <ChevronDown className={`w-3 h-3 stroke-[2] transition-transform ${desktopMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {desktopMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 max-h-80 overflow-y-auto bg-[#121212]/95 border border-white/15 rounded-2xl shadow-2xl backdrop-blur-2xl z-50 p-1.5 animate-fade-in scrollbar-thin scrollbar-thumb-white/10">
                <div className="px-3 py-1.5 border-b border-white/[0.08] text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                  All Servers ({players.length})
                </div>
                <div className="pt-1 space-y-0.5">
                  {players.map((player) => {
                    const isSelected = player.id === selectedPlayerId;
                    return (
                      <button
                        key={player.id}
                        onClick={() => {
                          onSelectPlayer(player.id);
                          setDesktopMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                          isSelected ? 'bg-white text-black shadow-sm' : 'text-zinc-300 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        <span className="truncate">{player.name}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[2.5] text-black flex-shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
