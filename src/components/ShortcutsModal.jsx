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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in select-none"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-lg bg-[#18181C] border border-white/[0.12] rounded-3xl overflow-hidden shadow-2xl animate-slide-up p-6 space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Outlined Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-zinc-400 hover:text-white border border-white/10 transition cursor-pointer"
          aria-label="Close"
        >
          <X className="w-4 h-4 stroke-[1.5]" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2.5 pb-3 border-b border-white/[0.08]">
          <div className="w-8 h-8 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center">
            <Keyboard className="w-4 h-4 text-white stroke-[2]" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white font-['Outfit']">
              Keyboard Shortcuts
            </h3>
            <p className="text-[11px] text-zinc-400 font-mono">
              Speed up your navigation across WarayFlix
            </p>
          </div>
        </div>

        {/* Shortcuts List by Group */}
        <div className="space-y-4">
          {SHORTCUT_GROUPS.map((group) => (
            <div key={group.title} className="space-y-2">
              <h4 className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest font-semibold">
                {group.title}
              </h4>
              
              <div className="grid grid-cols-1 gap-1.5">
                {group.shortcuts.map((sc) => (
                  <div 
                    key={sc.key}
                    className="flex items-center justify-between p-2.5 rounded-2xl bg-[#141416] border border-white/[0.06] text-xs font-sans shadow-sm"
                  >
                    <span className="text-zinc-200 font-medium">{sc.label}</span>
                    <kbd className="px-2 py-0.5 rounded-md bg-[#18181C] border border-white/15 text-[10px] font-mono text-white font-bold shadow-sm">
                      {sc.key}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
