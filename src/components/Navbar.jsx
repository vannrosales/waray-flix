import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Clapperboard, Search, Menu, X, Compass, Film, Tv, Sparkles, Dices } from 'lucide-react';
import SearchModal from './SearchModal';
import SurpriseModal from './SurpriseModal';
import InstallPrompt from './InstallPrompt';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [surpriseOpen, setSurpriseOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Global hotkey: Cmd+K / Ctrl+K / '/'
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      } else if (e.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const navLinks = [
    { name: 'Discover', path: '/', icon: Compass },
    { name: 'Movies', path: '/movies', icon: Film },
    { name: 'Series', path: '/tv', icon: Tv },
    { name: 'Anime', path: '/category/anime', icon: Sparkles },
  ];

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled 
          ? 'py-3.5 bg-[#090A0F]/90 backdrop-blur-xl border-b border-white/[0.06]' 
          : 'py-5 bg-gradient-to-b from-[#090A0F]/90 via-[#090A0F]/40 to-transparent'
      }`}>
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 flex items-center justify-between">
          
          {/* Minimalist Monochrome Logo */}
          <Link to="/" className="flex items-center gap-3 group select-none">
            <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/10 flex items-center justify-center group-hover:border-white/25 transition-colors">
              <Clapperboard className="w-4 h-4 text-zinc-300 stroke-[1.5] group-hover:text-white transition-colors" />
            </div>
            <div className="flex items-center tracking-tight">
              <span className="text-sm font-bold tracking-widest text-white font-['Outfit']">
                WARAY
              </span>
              <span className="text-sm font-light tracking-widest text-zinc-400 font-['Outfit'] ml-1">
                FLIX
              </span>
            </div>
          </Link>

          {/* Desktop Minimalist Links */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-xs font-medium tracking-wide transition-colors relative py-1 ${
                    isActive 
                      ? 'text-white font-semibold' 
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <span>{link.name}</span>
                  {isActive && (
                    <span className="absolute -bottom-1 left-0 right-0 h-[1.5px] bg-white rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Island */}
          <div className="flex items-center gap-2.5">
            {/* Install PWA Prompt Button */}
            <InstallPrompt />

            {/* Surprise Me Roulette Button */}
            <button
              onClick={() => setSurpriseOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs text-zinc-300 hover:text-white transition cursor-pointer"
              title="Surprise Me / Cinema Roulette"
              aria-label="Surprise Me"
            >
              <Dices className="w-3.5 h-3.5 stroke-[1.5] text-zinc-400" />
              <span className="hidden lg:inline text-[11px] font-mono">Surprise</span>
            </button>

            {/* Outlined Minimalist Search Trigger */}
            <button
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs text-zinc-400 hover:text-white transition-all cursor-pointer group"
              aria-label="Open search"
            >
              <Search className="w-3.5 h-3.5 text-zinc-400 stroke-[1.5] group-hover:text-white transition-colors" />
              <span className="hidden sm:inline text-xs font-sans text-zinc-300">Search</span>
              <kbd className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/[0.08] text-[9px] font-mono text-zinc-400">
                ⌘K
              </kbd>
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-zinc-300 hover:text-white transition cursor-pointer"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-4 h-4 stroke-[1.5]" /> : <Menu className="w-4 h-4 stroke-[1.5]" />}
            </button>
          </div>

        </div>

        {/* Mobile Minimalist Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-[#090A0F]/98 backdrop-blur-2xl border-b border-white/[0.08] p-6 space-y-2 animate-fade-in shadow-2xl">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              const Icon = link.icon;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition ${
                    isActive 
                      ? 'bg-white/[0.08] text-white font-semibold border border-white/10' 
                      : 'text-zinc-400 hover:text-white hover:bg-white/[0.03]'
                  }`}
                >
                  <Icon className="w-4 h-4 stroke-[1.5]" />
                  <span>{link.name}</span>
                </Link>
              );
            })}

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setSurpriseOpen(true);
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-zinc-300 hover:text-white hover:bg-white/[0.04] transition"
            >
              <Dices className="w-4 h-4 stroke-[1.5]" />
              <span>Surprise Me (Mood Matcher)</span>
            </button>
          </div>
        )}
      </header>

      {/* Global Command Palette Search Modal */}
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* Surprise Me / Cinema Roulette Modal */}
      <SurpriseModal isOpen={surpriseOpen} onClose={() => setSurpriseOpen(false)} />
    </>
  );
}