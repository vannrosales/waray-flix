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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-md animate-fade-in select-none"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-lg bg-white border border-black/10 rounded-3xl overflow-hidden shadow-2xl animate-slide-up p-6 space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Outlined Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-black/[0.04] hover:bg-black/[0.08] text-[#52525B] hover:text-[#09090B] border border-black/10 transition cursor-pointer"
          aria-label="Close"
        >
          <X className="w-4 h-4 stroke-[1.5]" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2.5 pb-3 border-b border-black/[0.08]">
          <div className="w-8 h-8 rounded-xl bg-black/[0.04] border border-black/10 flex items-center justify-center">
            <Keyboard className="w-4 h-4 text-[#2563EB] stroke-[2]" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#09090B] font-['Outfit']">
              Keyboard Shortcuts
            </h3>
            <p className="text-[11px] text-[#52525B] font-mono">
              Speed up your navigation across WarayFlix
            </p>
          </div>
        </div>

        {/* Shortcuts List by Group */}
        <div className="space-y-4">
          {SHORTCUT_GROUPS.map((group) => (
            <div key={group.title} className="space-y-2">
              <h4 className="text-[10px] font-mono text-[#52525B] uppercase tracking-widest font-semibold">
                {group.title}
              </h4>
              
              <div className="grid grid-cols-1 gap-1.5">
                {group.shortcuts.map((sc) => (
                  <div 
                    key={sc.key}
                    className="flex items-center justify-between p-2.5 rounded-2xl bg-zinc-50 border border-black/[0.06] text-xs font-sans shadow-sm"
                  >
                    <span className="text-[#09090B] font-medium">{sc.label}</span>
                    <kbd className="px-2 py-0.5 rounded-md bg-white border border-black/10 text-[10px] font-mono text-[#2563EB] font-bold shadow-sm">
                      {sc.key}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer Hint */}
        <div className="pt-2 border-t border-black/[0.08] text-center text-[10px] font-mono text-[#52525B]">
          Press <kbd className="px-1.5 py-0.5 rounded bg-black/[0.06] text-[#09090B] font-bold">?</kbd> anytime to open this cheatsheet.
        </div>

      </div>
    </div>
  );
}
