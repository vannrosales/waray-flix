import React from 'react';
import { useNavigate } from 'react-router-dom';
import { STUDIOS_LIST } from '../constants/studios';

export default function NetworkSelector() {
  const navigate = useNavigate();

  return (
    <section className="space-y-3 px-6 md:px-12 my-10 max-w-[1440px] mx-auto content-auto select-none">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg sm:text-xl font-bold tracking-tight text-[#09090B] font-['Outfit']">
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
              className="h-20 sm:h-22 rounded-2xl border border-black/[0.06] hover:border-[#2563EB]/40 bg-white hover:bg-white p-3.5 flex flex-col justify-between items-start transition-all duration-200 group cursor-pointer shadow-sm hover:shadow-md"
            >
              {/* Studio Typography Logo */}
              <span className={`text-sm sm:text-base font-bold text-[#09090B] group-hover:text-[#2563EB] transition-colors drop-shadow-sm ${studio.fontStyle}`}>
                {studio.name}
              </span>

              {/* Minimal Category Tag */}
              <span className="text-[10px] text-[#52525B] font-mono tracking-tight group-hover:text-[#09090B] transition-colors">
                {studio.category}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}