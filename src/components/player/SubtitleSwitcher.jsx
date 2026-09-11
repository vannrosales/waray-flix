import React, { useState, useRef, useEffect } from 'react';
import { Subtitles, Check, Globe } from 'lucide-react';
import { SUBTITLE_LANGUAGES, subtitleService } from '../../services/subtitleService';

/**
 * SubtitleSwitcher component
 * Displays active subtitle status badge and allows selecting preferred subtitle tracks
 * which persist across all movies, TV shows, and watch parties.
 */
export default function SubtitleSwitcher({
  subtitleLang = 'en',
  onSelectSubtitle,
  pillDark,
  align = 'right'
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  const activeLang = subtitleService.getLanguageInfo(subtitleLang);
  const isEnabled = subtitleLang && subtitleLang !== 'off';

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [open]);

  const handleSelect = (code) => {
    subtitleService.setPreferredLanguage(code);
    if (onSelectSubtitle) {
      onSelectSubtitle(code);
    }
    setOpen(false);
  };

  return (
    <div className="relative shrink-0" ref={containerRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setOpen(!open)}
        className={`${
          isEnabled
            ? 'flex items-center justify-center gap-1 rounded-full backdrop-blur-xl shadow-md transition cursor-pointer text-xs p-2 sm:px-3 sm:py-1.5 bg-[#121212]/90 hover:bg-[#252525] text-cyan-300 border border-cyan-500/30'
            : (pillDark || 'flex items-center justify-center gap-1 rounded-full backdrop-blur-xl border border-white/10 shadow-md transition cursor-pointer text-xs p-2 sm:px-3 sm:py-1.5 bg-[#121212]/90 hover:bg-[#252525] text-zinc-400')
        } font-bold shrink-0`}
        title={`Subtitles: ${isEnabled ? activeLang.label : 'Off'}`}
        aria-label="Subtitles and Captions"
      >
        <Subtitles className={`w-3.5 h-3.5 stroke-[2] ${isEnabled ? 'text-cyan-400' : 'text-zinc-400'}`} />
        <span className="text-[11px] uppercase tracking-wider font-extrabold hidden sm:inline">
          {isEnabled ? `CC: ${activeLang.code.toUpperCase()}` : 'CC: OFF'}
        </span>
      </button>

      {/* Dropdown Menu */}
      {open && (
        <div
          className={`absolute top-full mt-2 ${
            align === 'right' ? 'right-0' : 'left-0'
          } w-60 max-h-80 overflow-y-auto bg-[#0d0f17]/95 border border-white/15 rounded-2xl p-2 shadow-2xl backdrop-blur-2xl z-50 animate-fade-in scrollbar-thin scrollbar-thumb-white/10`}
        >
          {/* Header */}
          <div className="px-3 py-2 border-b border-white/10 mb-1 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-white">
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              <span>Subtitles & Captions</span>
            </div>
            {isEnabled && (
              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30">
                Auto-Synced
              </span>
            )}
          </div>

          {/* Language Options */}
          <div className="space-y-0.5">
            {SUBTITLE_LANGUAGES.map((lang) => {
              const selected = subtitleLang === lang.code;
              const isOff = lang.code === 'off';

              return (
                <button
                  key={lang.code}
                  onClick={() => handleSelect(lang.code)}
                  className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs text-left transition cursor-pointer ${
                    selected
                      ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30'
                      : isOff
                      ? 'text-zinc-400 hover:text-red-300 hover:bg-red-500/10'
                      : 'text-zinc-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{lang.label}</span>
                    {!isOff && (
                      <span className="text-[10px] text-zinc-400 opacity-70">
                        ({lang.native})
                      </span>
                    )}
                  </div>
                  {selected && (
                    <Check className="w-3.5 h-3.5 stroke-[2.5] text-cyan-400 flex-shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
