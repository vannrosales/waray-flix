import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { searchMultiMedia, IMAGE_BASE_URL } from '../services/tmdb';
import { Search, Film, X, Star, Clapperboard, Menu } from 'lucide-react';

export default function Navbar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const searchRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.trim().length > 1) {
        try {
          const data = await searchMultiMedia(query);
          setResults(data.slice(0, 5));
        } catch (err) {
          console.error(err);
        }
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setIsSearchActive(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (item) => {
    const itemType = item.media_type || 'movie';
    navigate(`/details/${itemType}/${item.id}`);
    setIsSearchActive(false);
    setQuery('');
    setIsMobileMenuOpen(false);
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled 
        ? 'bg-[#0B0D10]/90 backdrop-blur-md border-b border-white/5 shadow-lg' 
        : 'bg-transparent border-b border-transparent'
    }`}>
      <div className="max-w-[1400px] mx-auto flex items-center justify-between py-4 px-6 md:px-16 w-full">
        
        {/* Left: Minimal Logo */}
        <Link to="/" className="flex items-center gap-2.5 group select-none">
          <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
            <Clapperboard className="w-3.5 h-3.5 text-zinc-300 group-hover:text-white transition-colors" />
          </div>
          <div className="flex items-center tracking-tighter">
            <span className="text-xs font-black tracking-widest text-white font-['Outfit']">
              WARAY
            </span>
            <span className="text-xs font-black tracking-widest text-zinc-400 font-['Outfit'] ml-0.5">
              FLIX
            </span>
          </div>
        </Link>

        {/* Center: Desktop Minimalist Text Links */}
        <div className="hidden md:flex items-center gap-8">
          <Link 
            to="/" 
            className={`text-xs font-medium transition ${location.pathname === '/' ? 'text-white font-bold' : 'text-zinc-400 hover:text-white'}`}
          >
            Home
          </Link>
          <Link 
            to="/movies" 
            className={`text-xs font-medium transition ${location.pathname === '/movies' ? 'text-white font-bold' : 'text-zinc-400 hover:text-white'}`}
          >
            Movies
          </Link>
          <Link 
            to="/tv" 
            className={`text-xs font-medium transition ${location.pathname === '/tv' ? 'text-white font-bold' : 'text-zinc-400 hover:text-white'}`}
          >
            Series
          </Link>
        </div>

        {/* Right: Clean Minimal Search & Mobile Toggle */}
        <div className="flex items-center gap-3">
          <div className="relative w-36 sm:w-60" ref={searchRef}>
            <div className="relative flex items-center">
              <Search className="absolute left-3 w-3 h-3 text-zinc-500" />
              <input 
                type="text" 
                placeholder="Search..." 
                value={query}
                onFocus={() => setIsSearchActive(true)}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setIsSearchActive(true);
                }}
                className="w-full bg-[#1D2128]/40 hover:bg-[#1D2128]/70 focus:bg-[#1D2128] text-white placeholder-zinc-500 text-xs border border-white/5 rounded-full pl-8 pr-8 py-1.5 focus:outline-none transition"
              />
              {query && (
                <button onClick={() => setQuery('')} className="absolute right-3 text-zinc-500 hover:text-white">
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Minimal Dropdown Results */}
            {isSearchActive && results.length > 0 && (
              <div className="absolute top-10 right-0 w-72 bg-[#1D2128] border border-white/10 rounded-2xl shadow-xl overflow-hidden z-50 divide-y divide-white/5">
                {results.map((item) => {
                  const itemType = item.media_type || 'movie';
                  const poster = item.poster_path ? `${IMAGE_BASE_URL}${item.poster_path}` : null;
                  return (
                    <div 
                      key={item.id}
                      onClick={() => handleSelect(item)}
                      className="flex items-center gap-2.5 p-2.5 hover:bg-white/5 cursor-pointer transition group"
                    >
                      <div className="w-7 h-10 rounded bg-[#0B0D10] overflow-hidden flex-shrink-0">
                        {poster ? <img src={poster} alt="" className="w-full h-full object-cover" /> : <Film className="w-3 h-3 m-auto text-zinc-600" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-medium text-zinc-200 line-clamp-1 group-hover:text-white">
                          {item.title || item.name}
                        </h4>
                        <div className="flex items-center gap-2 text-[10px] text-zinc-500">
                          <span className="uppercase">{itemType}</span>
                          {item.vote_average > 0 && (
                            <span className="flex items-center gap-0.5 text-amber-400">
                              <Star className="w-2.5 h-2.5 fill-current" /> {item.vote_average.toFixed(1)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Mobile Menu Hamburger Button */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg bg-white/5 text-zinc-300 hover:text-white border border-white/10"
          >
            {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>

      </div>

      {/* Mobile Dropdown Overlay Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-[#0B0D10]/95 backdrop-blur-xl border-b border-white/5 px-6 py-6 space-y-4 shadow-2xl">
          <Link 
            to="/" 
            onClick={() => setIsMobileMenuOpen(false)}
            className={`block text-sm font-medium transition ${location.pathname === '/' ? 'text-white font-bold' : 'text-zinc-400'}`}
          >
            Home
          </Link>
          <Link 
            to="/movies" 
            onClick={() => setIsMobileMenuOpen(false)}
            className={`block text-sm font-medium transition ${location.pathname === '/movies' ? 'text-white font-bold' : 'text-zinc-400'}`}
          >
            Movies
          </Link>
          <Link 
            to="/tv" 
            onClick={() => setIsMobileMenuOpen(false)}
            className={`block text-sm font-medium transition ${location.pathname === '/tv' ? 'text-white font-bold' : 'text-zinc-400'}`}
          >
            Series
          </Link>
        </div>
      )}
    </header>
  );
}