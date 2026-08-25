import React from 'react';

export default function StudioLogo({ name, studio, active = false }) {
  const targetName = name || studio || '';
  const normalized = targetName.toLowerCase().replace(/[^a-z0-9]/g, '');

  switch (normalized) {
    case 'netflix':
      return (
        <span className="font-black tracking-[0.2em] uppercase font-sans text-sm sm:text-base select-none leading-none text-[#E50914]">
          NETFLIX
        </span>
      );

    case 'disney':
      return (
        <span className="font-serif italic font-extrabold tracking-wider text-sm sm:text-base select-none leading-none text-[#0063E5]">
          Disney<span className="font-sans font-bold not-italic text-xs ml-0.5 text-[#0063E5]">+</span>
        </span>
      );

    case 'primevideo':
      return (
        <div className="flex flex-col items-center justify-center select-none leading-none text-[#00A8E1]">
          <div className="flex items-baseline gap-1">
            <span className="font-sans font-bold tracking-tight text-xs sm:text-sm text-[#00A8E1]">prime</span>
            <span className="font-sans font-light tracking-wide text-[10px] sm:text-xs text-[#00A8E1]">video</span>
          </div>
          <div className="w-8 sm:w-10 h-[2.5px] bg-[#00A8E1] rounded-full mt-0.5" />
        </div>
      );

    case 'appletv':
      return (
        <div className={`flex items-center gap-1 font-sans font-semibold tracking-tight text-xs sm:text-sm select-none leading-none ${
          active ? 'text-white' : 'text-[#09090B]'
        }`}>
          {/* Apple Icon */}
          <svg viewBox="0 0 170 170" fill="currentColor" className="w-3.5 h-3.5">
            <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-5.35.23-10.32-1.96-14.9-6.59-3.26-3.17-7.23-8.08-11.9-14.73-6.52-9.3-11.59-19.78-15.22-31.45-3.63-11.66-5.45-22.97-5.45-33.91 0-14.28 3.73-26.04 11.2-35.28 7.47-9.24 16.71-13.97 27.72-14.2 5.02 0 10.36 1.25 16.03 3.76 5.66 2.51 9.4 3.86 11.22 4.05 1.47-.2 5.34-1.57 11.62-4.11 6.28-2.54 11.83-3.71 16.65-3.53 12.39.67 22.38 5.16 29.98 13.48-10.89 6.58-16.22 15.63-15.99 27.13.23 9.07 3.65 16.71 10.27 22.92 6.62 6.21 14.56 9.77 23.82 10.68-2.22 6.54-4.88 13.11-7.98 19.71zM119.22 31.84c0-7.39 2.68-14.37 8.04-20.93 5.36-6.56 11.92-10.45 19.68-11.68.22 1.34.34 2.57.34 3.69 0 7.39-2.79 14.49-8.38 21.31-5.59 6.82-12.29 10.74-20.1 11.75-.11-1.34-.17-2.73-.17-4.14z"/>
          </svg>
          <span>tv+</span>
        </div>
      );

    case 'hbomax':
      return (
        <div className="flex items-center gap-1 font-sans select-none leading-none text-[#5822B4]">
          <span className="font-black text-sm sm:text-base tracking-wider text-[#5822B4]">HBO</span>
          <span className="font-extrabold text-xs sm:text-sm tracking-tight lowercase text-[#5822B4]">max</span>
        </div>
      );

    case 'hulu':
      return (
        <span className="font-sans font-black text-sm sm:text-base tracking-tighter lowercase select-none leading-none text-[#1CE783]">
          hulu
        </span>
      );

    case 'marvel':
      return (
        <div className="px-2.5 py-1 rounded-sm font-black tracking-[0.15em] uppercase text-xs sm:text-sm font-mono leading-none select-none bg-[#ED1D24] text-white shadow-sm">
          MARVEL
        </div>
      );

    case 'paramount':
      return (
        <span className="font-serif italic font-bold tracking-wide text-xs sm:text-sm select-none leading-none text-[#0064FF]">
          Paramount<span className="font-sans font-extrabold not-italic text-xs ml-0.5 text-[#0064FF]">+</span>
        </span>
      );

    case 'a24':
      return (
        <span className={`font-mono font-black text-sm sm:text-base tracking-[0.3em] uppercase select-none leading-none ${
          active ? 'text-white' : 'text-[#09090B]'
        }`}>
          A24
        </span>
      );

    case 'peacock':
      return (
        <div className="flex items-center gap-1.5 font-bold tracking-tight text-xs sm:text-sm font-sans uppercase select-none leading-none">
          <span className="w-2 h-2 rounded-full bg-[#00A3E0]" />
          <span className={active ? 'text-white' : 'text-[#09090B]'}>PEACOCK</span>
        </div>
      );

    case 'crunchyroll':
      return (
        <div className="flex items-center gap-1.5 font-bold tracking-tight text-xs sm:text-sm font-sans select-none leading-none text-[#F47521]">
          <span className="w-2.5 h-2.5 rounded-full border border-[#F47521] flex items-center justify-center">
            <span className="w-1 h-1 rounded-full bg-[#F47521]" />
          </span>
          <span className="uppercase tracking-wider">CRUNCHYROLL</span>
        </div>
      );

    case 'tubi':
      return (
        <span className="font-black text-xs sm:text-sm font-mono tracking-widest uppercase select-none leading-none text-[#FA3200]">
          TUBI
        </span>
      );

    default:
      return (
        <span className={`font-bold text-xs sm:text-sm tracking-wider uppercase font-['Outfit'] select-none leading-none ${
          active ? 'text-white' : 'text-[#09090B]'
        }`}>
          {name}
        </span>
      );
  }
}
