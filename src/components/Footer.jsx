import React from 'react';
import { Link } from 'react-router-dom';
import { Clapperboard } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full bg-[#0B0D10] border-t border-white/5 py-12 px-6 md:px-16 text-zinc-500 text-xs">
      <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Left: Logo, Copyright & TMDB Attribution */}
        <div className="flex flex-col items-center md:items-start gap-2">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded bg-white/5 border border-white/10 flex items-center justify-center">
              <Clapperboard className="w-3 h-3 text-zinc-400" />
            </div>
            <p>© {new Date().getFullYear()} WarayFlix. All rights reserved.</p>
          </div>
          <p className="text-[10px] text-zinc-600 text-center md:text-left max-w-md font-mono">
            This product uses the TMDb API and is not endorsed or certified by TMDb. Video streams are hosted by third-party providers.
          </p>
        </div>

        {/* Center: Minimal Navigation Links */}
        <div className="flex items-center gap-6 font-mono text-[11px]">
          <Link to="/" className="hover:text-white transition">Home</Link>
          <Link to="/movies" className="hover:text-white transition">Movies</Link>
          <Link to="/tv" className="hover:text-white transition">Series</Link>
          <Link to="/anime" className="hover:text-white transition">Anime</Link>
        </div>

      </div>
    </footer>
  );
}