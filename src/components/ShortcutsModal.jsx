import React, { useEffect } from 'react';
import { X, Keyboard } from 'lucide-react';

const SHORTCUT_GROUPS = [
  {
    title: 'Global Navigation',
    shortcuts: [
      { key: '⌘K / /', label: 'Open Command Search' },
      { key: 'D', label: 'Open Surprise Me Cinema Roulette' },
      { key: '?', label: 'Toggle Keyboard Shortcuts' },
      { key: 'Esc', label: 'Close Any Modal / Drawer' },
    ]
  },
  {
    title: 'Watch Player Controls',
    shortcuts: [
      { key: 'N', label: 'Play Next Episode (TV Series)' },
      { key: 'S', label: 'Cycle to Next Streaming Server' },
      { key: 'F', label: 'Toggle Fullscreen Mode' },
    ]
  },
  {
    title: 'Trailer Reel Controls',
    shortcuts: [
      { key: '↓ / J', label: 'Next Trailer in Reel' },
      { key: '↑ / K', label: 'Previous Trailer in Reel' },
      { key: 'M', label: 'Toggle Audio Mute / Unmute' },
    ]
  }
];

export default function ShortcutsModal({ isOpen, onClose }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-lg bg-[#0E1017] border border-white/[0.08] rounded-2xl overflow-hidden shadow-2xl animate-slide-up p-6 space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Outlined Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-black/60 hover:bg-black text-zinc-400 hover:text-white border border-white/10 transition cursor-pointer"
          aria-label="Close"
        >
          <X className="w-4 h-4 stroke-[1.5]" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2.5 pb-2 border-b border-white/[0.06]">
          <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/10 flex items-center justify-center">
            <Keyboard className="w-4 h-4 text-zinc-300 stroke-[1.5]" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white font-['Outfit']">
              Keyboard Shortcuts
            </h3>
            <p className="text-[11px] text-zinc-500 font-mono">
              Speed up your navigation across WarayFlix
            </p>
          </div>
        </div>

        {/* Shortcuts List by Group */}
        <div className="space-y-4">
          {SHORTCUT_GROUPS.map((group) => (
            <div key={group.title} className="space-y-2">
              <h4 className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
                {group.title}
              </h4>
              
              <div className="grid grid-cols-1 gap-1.5">
                {group.shortcuts.map((sc) => (
                  <div 
                    key={sc.key}
                    className="flex items-center justify-between p-2 rounded-xl bg-white/[0.02] border border-white/[0.04] text-xs font-sans"
                  >
                    <span className="text-zinc-300 font-light">{sc.label}</span>
                    <kbd className="px-2 py-0.5 rounded-md bg-white/[0.06] border border-white/10 text-[10px] font-mono text-white font-semibold shadow-sm">
                      {sc.key}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer Hint */}
        <div className="pt-2 border-t border-white/[0.06] text-center text-[10px] font-mono text-zinc-500">
          Press <kbd className="px-1.5 py-0.5 rounded bg-white/[0.06] text-zinc-400">?</kbd> anytime to open this cheatsheet.
        </div>

      </div>
    </div>
  );
}
