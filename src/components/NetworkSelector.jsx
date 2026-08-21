import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Layers } from 'lucide-react';
import { STUDIOS_LIST } from '../constants/studios';

export default function NetworkSelector() {
  const navigate = useNavigate();

  return (
    <div className="space-y-4 px-6 md:px-16 my-10 max-w-[1400px] mx-auto">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
          <Layers className="w-4 h-4 text-zinc-400" />
          <span>TV Networks & Studios</span>
        </h2>
      </div>

      {/* Responsive Grid Layout */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {STUDIOS_LIST.map((studio) => {
          // Create a clean URL-safe network name slug (e.g., "Disney+" -> "disney")
          const networkSlug = studio.name.toLowerCase().replace(/[^a-z0-9]/g, '');

          return (
            <button
              key={studio.id}
              onClick={() => navigate(`/network/${networkSlug}/${studio.code}`)}
              className="h-[96px] rounded-2xl border transition-all duration-300 flex items-center justify-center p-4 cursor-pointer group relative overflow-hidden bg-[#14171F] hover:bg-[#1D2128] border-white/5 hover:border-white/15"
            >
              {/* Network Brand Typography/Logo */}
              <span className={`text-base sm:text-lg tracking-wider font-bold transition-transform duration-300 group-hover:scale-105 ${studio.fontClass || 'text-white'}`}>
                {studio.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}