import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const STUDIOS_LIST = [
  { id: 8, name: 'Netflix', code: 8, fontClass: 'tracking-widest' },
  { id: 4201, name: 'MARVEL', code: 4201, fontClass: 'tracking-tight font-black' },
  { id: 2, name: 'PIXAR', code: 2, fontClass: 'tracking-widest font-serif' },
  { id: 174, name: 'WARNER BROS.', code: 174, fontClass: 'tracking-normal font-sans' },
  { id: 337, name: 'Disney+', code: 337, fontClass: 'font-serif italic' },
  { id: 4, name: 'PARAMOUNT', code: 4, fontClass: 'tracking-wider font-serif italic' },
  { id: 3, name: 'DC COMICS', code: 2, fontClass: 'tracking-wide font-mono' },
  { id: 1, name: 'LUCASFILM', code: 1, fontClass: 'tracking-widest font-mono' },
  { id: 416, name: 'A 2 4', code: 416, fontClass: 'tracking-[0.2em] font-mono' },
  { id: 10342, name: 'STUDIO GHIBLI', code: 10342, fontClass: 'tracking-wider font-sans' },
  { id: 3182, name: 'BLUMHOUSE', code: 3182, fontClass: 'tracking-widest font-mono' },
  { id: 33, name: 'UNIVERSAL', code: 33, fontClass: 'tracking-[0.15em] font-serif text-xs' },
];

export default function NetworkSelector() {
  const rowRef = useRef(null);
  const navigate = useNavigate();

  const handleScroll = (direction) => {
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      const amount = direction === 'left' ? scrollLeft - clientWidth / 1.5 : scrollLeft + clientWidth / 1.5;
      rowRef.current.scrollTo({ left: amount, behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-3 px-6 md:px-16 my-10 max-w-[1400px] mx-auto">
      {/* Clean Header with Subtle Scroll Buttons */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold tracking-tight text-white">Studios & Networks</h2>
        <div className="flex items-center gap-1">
          <button 
            onClick={() => handleScroll('left')} 
            className="w-7 h-7 rounded-full bg-[#1D2128]/50 hover:bg-[#1D2128] text-zinc-400 hover:text-white flex items-center justify-center transition"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button 
            onClick={() => handleScroll('right')} 
            className="w-7 h-7 rounded-full bg-[#1D2128]/50 hover:bg-[#1D2128] text-zinc-400 hover:text-white flex items-center justify-center transition"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Horizontal Minimalist Track */}
      <div className="relative">
        <div 
          ref={rowRef} 
          className="flex gap-4 overflow-x-auto scrollbar-none scroll-smooth pb-2 pt-1"
        >
          {STUDIOS_LIST.map((studio) => (
            <div
              key={studio.id}
              onClick={() => navigate(`/network/${studio.name.toLowerCase().replace(/[^a-z0-9]/g, '')}/${studio.code}`)}
              className="group cursor-pointer min-w-[160px] md:min-w-[180px] h-20 rounded-2xl bg-[#1D2128]/30 hover:bg-[#1D2128]/70 border border-white/5 hover:border-white/10 transition-all duration-300 flex items-center justify-center p-4 flex-shrink-0"
            >
              <span className={`text-xs text-zinc-400 group-hover:text-white transition-colors text-center ${studio.fontClass}`}>
                {studio.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}