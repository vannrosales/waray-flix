import React from 'react';
import { useNavigate } from 'react-router-dom';
import { STUDIOS_LIST } from '../constants/studios';

export default function NetworkSelector() {
  const navigate = useNavigate();

  return (
    <section className="space-y-3 px-6 md:px-12 my-10 max-w-[1440px] mx-auto content-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white font-['Outfit']">
          Channels & Studios
        </h2>
      </div>

      {/* Minimalist Grid of Studio Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {STUDIOS_LIST.map((studio) => {
          const networkSlug = studio.name.toLowerCase().replace(/[^a-z0-9]/g, '');

          return (
            <button
              key={studio.id}
              onClick={() => navigate(`/network/${networkSlug}/${studio.code}`)}
              className="h-20 sm:h-22 rounded-xl border border-white/[0.06] hover:border-white/20 bg-[#11131A] hover:bg-[#161922] p-3.5 flex flex-col justify-between items-start transition-all duration-200 group cursor-pointer"
            >
              {/* Studio Typography Logo */}
              <span className={`text-sm sm:text-base font-bold text-zinc-100 group-hover:text-white transition-colors drop-shadow-sm ${studio.fontStyle}`}>
                {studio.name}
              </span>

              {/* Minimal Category Tag */}
              <span className="text-[10px] text-zinc-500 font-mono tracking-tight group-hover:text-zinc-400 transition-colors">
                {studio.category}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}