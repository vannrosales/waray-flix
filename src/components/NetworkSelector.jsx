import React from 'react';
import { useNavigate } from 'react-router-dom';
import { STUDIOS_LIST } from '../constants/studios';
import StudioLogo from './StudioLogo';

export default function NetworkSelector() {
  const navigate = useNavigate();

  return (
    <section className="space-y-3.5 px-6 md:px-12 my-8 max-w-[1440px] mx-auto content-auto select-none">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white">
          Channels & Studios
        </h2>
      </div>

      {/* Grid of Studio Logo Brand Tiles matching Image 1 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
        {STUDIOS_LIST.map((studio) => {
          const networkSlug = studio.name.toLowerCase().replace(/[^a-z0-9]/g, '');

          return (
            <button
              key={studio.id}
              onClick={() => navigate(`/network/${networkSlug}/${studio.code}`)}
              className="h-20 sm:h-24 rounded-none border border-white/[0.08] hover:border-white/25 bg-[#121212] hover:bg-[#18181C] p-4 flex flex-col items-center justify-center transition-all duration-200 group cursor-pointer shadow-sm hover:shadow-md hover:scale-[1.02] text-white"
              title={`Explore ${studio.name} Library`}
            >
              {/* Studio Look-Alike Brand Logo */}
              <div className="flex items-center justify-center text-white group-hover:scale-105 transition-transform duration-200 w-full h-full">
                <StudioLogo name={studio.name} active={false} />
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
