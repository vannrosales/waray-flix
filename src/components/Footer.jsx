import React from 'react';
import { Link } from 'react-router-dom';
import { Clapperboard } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full bg-[#FAFAFA] border-t border-black/[0.08] py-12 px-6 md:px-12 text-[#52525B] text-xs select-none">
      <div className="max-w-[1440px] mx-auto space-y-8">
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-black/[0.08]">
          {/* Logo & Node */}
          <div className="space-y-1.5">
            <Link to="/" className="flex items-center gap-2.5 group select-none">
              <div className="w-7 h-7 rounded-lg bg-[#09090B] text-white flex items-center justify-center shadow-sm">
                <Clapperboard className="w-3.5 h-3.5 stroke-[2]" />
              </div>
              <span className="text-sm font-bold tracking-widest text-[#09090B] font-['Outfit']">
                WARAY<span className="text-[#2563EB] font-bold ml-1">FLIX</span>
              </span>
            </Link>
            <p className="text-[10px] text-[#52525B] font-mono">
              High-Precision Cinema Index
            </p>
          </div>

          {/* Quick Links */}
          <div className="flex flex-wrap items-center gap-6 font-mono text-[11px] text-[#52525B]">
            <Link to="/" className="hover:text-[#2563EB] transition">Discover</Link>
            <Link to="/movies" className="hover:text-[#2563EB] transition">Movies</Link>
            <Link to="/tv" className="hover:text-[#2563EB] transition">Series</Link>
            <Link to="/watchlist" className="hover:text-[#2563EB] transition">Watchlist</Link>
            <Link to="/trailers" className="hover:text-[#2563EB] transition">Trailers</Link>
            <Link to="/category/anime" className="hover:text-[#2563EB] transition">Anime</Link>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-[10px] text-[#52525B] font-mono leading-relaxed">
          <p className="max-w-3xl">
            WarayFlix does not store or host video media on its servers. All metadata is indexed via public APIs.
          </p>
          <div className="text-[#52525B]">
            © {new Date().getFullYear()} WarayFlix.
          </div>
        </div>

      </div>
    </footer>
  );
}