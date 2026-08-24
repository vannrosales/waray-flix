import React from 'react';
import { Link } from 'react-router-dom';
import { Clapperboard } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full bg-[#07080C] border-t border-white/[0.05] py-12 px-6 md:px-12 text-zinc-500 text-xs">
      <div className="max-w-[1440px] mx-auto space-y-8">
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-white/[0.05]">
          {/* Logo & Node */}
          <div className="space-y-1.5">
            <Link to="/" className="flex items-center gap-2.5 group select-none">
              <div className="w-7 h-7 rounded-lg bg-white/[0.04] border border-white/10 flex items-center justify-center">
                <Clapperboard className="w-3.5 h-3.5 text-zinc-300 stroke-[1.5]" />
              </div>
              <span className="text-sm font-bold tracking-widest text-white font-['Outfit']">
                WARAY<span className="text-zinc-400 font-light ml-1">FLIX</span>
              </span>
            </Link>
            <p className="text-[10px] text-zinc-500 font-mono">
              Minimalist Stream Index
            </p>
          </div>

          {/* Quick Links */}
          <div className="flex flex-wrap items-center gap-6 font-mono text-[11px] text-zinc-400">
            <Link to="/" className="hover:text-white transition">Discover</Link>
            <Link to="/movies" className="hover:text-white transition">Movies</Link>
            <Link to="/tv" className="hover:text-white transition">Series</Link>
            <Link to="/category/anime" className="hover:text-white transition">Anime</Link>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-[10px] text-zinc-500 font-mono leading-relaxed">
          <p className="max-w-3xl">
            WarayFlix does not store or host video media on its servers. All metadata is indexed via public APIs.
          </p>
          <div className="text-zinc-600">
            © {new Date().getFullYear()} WarayFlix.
          </div>
        </div>

      </div>
    </footer>
  );
}