import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Clapperboard, Search, Menu, X, Compass, Film, Tv, Sparkles, Dices, PlaySquare, User, LogOut, Bookmark, ChevronDown, Flame, ShieldCheck } from 'lucide-react';
import SearchModal from './SearchModal';
import SurpriseModal from './SurpriseModal';
import InstallPrompt from './InstallPrompt';
import ShortcutsModal from './ShortcutsModal';
import AuthModal from './AuthModal';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [surpriseOpen, setSurpriseOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  
  const { user, username, openAuthModal, signOut } = useAuth();
  const location = useLocation();
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Global hotkeys: Cmd+K / Ctrl+K, '/', '?' (Shift+/), 'D'
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') return;

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      } else if (e.key === '/') {
        e.preventDefault();
        setSearchOpen(true);
      } else if (e.key === '?') {
        e.preventDefault();
        setShortcutsOpen((prev) => !prev);
      } else if (e.key.toLowerCase() === 'd') {
        e.preventDefault();
        setSurpriseOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const navLinks = [
    { name: 'Discover', path: '/', icon: Compass },
    { name: 'Movies', path: '/movies', icon: Film },
    { name: 'Series', path: '/tv', icon: Tv },
    { name: 'Timeline', path: '/timeline', icon: Flame, badge: 'Doomsday' },
    { name: 'Watchlist', path: '/watchlist', icon: Bookmark },
    { name: 'Anime', path: '/category/anime', icon: Sparkles },
  ];

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled 
          ? 'py-3.5 bg-[#FAFAFA]/90 backdrop-blur-xl border-b border-black/[0.08] shadow-sm' 
          : 'py-5 bg-gradient-to-b from-[#FAFAFA]/95 via-[#FAFAFA]/80 to-transparent'
      }`}>
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 flex items-center justify-between">
          
          {/* Triad 4 Logo */}
          <Link to="/" className="flex items-center gap-3 group select-none">
            <div className="w-8 h-8 rounded-lg bg-[#09090B] text-white flex items-center justify-center shadow-sm group-hover:bg-[#2563EB] transition-colors">
              <Clapperboard className="w-4 h-4 stroke-[2]" />
            </div>
            <div className="flex items-center tracking-tight">
              <span className="text-sm font-bold tracking-widest text-[#09090B]">
                WARAY
              </span>
              <span className="text-sm font-bold tracking-widest text-[#2563EB] ml-1">
                FLIX
              </span>
            </div>
          </Link>

          {/* Desktop Minimalist Links */}
          <nav className="hidden md:flex items-center gap-7">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-xs font-medium tracking-wide transition-colors relative py-1 ${
                    isActive 
                      ? 'text-[#09090B] font-bold' 
                      : 'text-[#52525B] hover:text-[#09090B]'
                  }`}
                >
                  <span>{link.name}</span>
                  {isActive && (
                    <span className="absolute -bottom-1 left-0 right-0 h-[2px] bg-[#2563EB] rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Island */}
          <div className="flex items-center gap-2">
            {/* Install PWA Prompt Button */}
            <InstallPrompt />

            {/* Surprise Me Roulette Button */}
            <button
              onClick={() => setSurpriseOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/[0.04] hover:bg-black/[0.08] border border-black/[0.08] text-xs text-[#09090B] transition cursor-pointer"
              title="Surprise Me / Cinema Roulette (Key: D)"
              aria-label="Surprise Me"
            >
              <Dices className="w-3.5 h-3.5 stroke-[1.5] text-[#52525B]" />
              <span className="hidden lg:inline text-[11px] font-mono">Surprise</span>
            </button>

            {/* Keyboard Shortcuts Button */}
            <button
              onClick={() => setShortcutsOpen(true)}
              className="hidden sm:flex items-center justify-center w-8 h-8 rounded-full bg-black/[0.04] hover:bg-black/[0.08] border border-black/[0.08] text-xs text-[#52525B] hover:text-[#09090B] font-mono transition cursor-pointer"
              title="Keyboard Shortcuts (Key: ?)"
              aria-label="Keyboard Shortcuts"
            >
              ?
            </button>

            {/* Outlined Minimalist Search Trigger */}
            <button
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-black/[0.04] hover:bg-black/[0.08] border border-black/[0.08] text-xs text-[#52525B] hover:text-[#09090B] transition-all cursor-pointer group"
              aria-label="Open search"
            >
              <Search className="w-3.5 h-3.5 text-[#52525B] stroke-[1.5] group-hover:text-[#09090B] transition-colors" />
              <span className="hidden sm:inline text-xs font-sans text-[#09090B]">Search</span>
              <kbd className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-black/[0.06] border border-black/[0.08] text-[9px] font-mono text-[#52525B]">
                ⌘K
              </kbd>
            </button>

            {/* Auth Profile Menu / Sign In Button */}
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-full bg-black/[0.04] hover:bg-black/[0.08] border border-black/[0.08] text-xs text-[#09090B] transition cursor-pointer"
                >
                  <div className="w-6 h-6 rounded-full bg-[#09090B] text-white font-semibold text-[10px] flex items-center justify-center font-mono">
                    {username.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden sm:inline font-mono text-[11px] truncate max-w-[80px]">
                    {username}
                  </span>
                  <ChevronDown className="w-3 h-3 text-[#52525B] stroke-[1.5]" />
                </button>

                {/* Profile Dropdown Menu */}
                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-black/10 rounded-2xl shadow-2xl p-1.5 z-50 animate-slide-up space-y-1">
                    <div className="px-3 py-2 border-b border-black/[0.06]">
                      <span className="text-[10px] font-mono text-[#52525B] uppercase block">Signed in as</span>
                      <p className="text-xs font-medium text-[#09090B] truncate">{user.email || username}</p>
                    </div>

                    <Link
                      to="/watchlist"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-[#09090B] hover:bg-black/[0.04] transition"
                    >
                      <Bookmark className="w-3.5 h-3.5 stroke-[1.5] text-[#2563EB]" />
                      <span>My Watchlist</span>
                    </Link>

                    <button
                      onClick={() => {
                        signOut();
                        setProfileDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-red-600 hover:bg-red-50 transition cursor-pointer text-left"
                    >
                      <LogOut className="w-3.5 h-3.5 stroke-[1.5]" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={openAuthModal}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#09090B] text-white hover:bg-black font-semibold text-xs transition cursor-pointer shadow-sm hover:shadow"
              >
                <User className="w-3.5 h-3.5 stroke-[2]" />
                <span>Sign In</span>
              </button>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg bg-black/[0.04] border border-black/[0.08] text-[#09090B] hover:bg-black/[0.08] transition cursor-pointer"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-4 h-4 stroke-[1.5]" /> : <Menu className="w-4 h-4 stroke-[1.5]" />}
            </button>
          </div>

        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#FAFAFA]/98 border-b border-black/[0.08] px-6 py-5 mt-2 space-y-4 animate-fade-in backdrop-blur-2xl shadow-xl">
            <div className="flex flex-col space-y-2">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition ${
                      isActive 
                        ? 'bg-[#2563EB] text-white font-semibold shadow-sm' 
                        : 'text-[#52525B] hover:text-[#09090B] hover:bg-black/[0.04]'
                    }`}
                  >
                    <Icon className="w-4 h-4 stroke-[1.5]" />
                    <span>{link.name}</span>
                  </Link>
                );
              })}
              <div className="pt-2 border-t border-black/[0.06]">
                <Link
                  to="/legal"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-[#52525B] hover:text-[#09090B] hover:bg-black/[0.04] transition"
                >
                  <ShieldCheck className="w-4 h-4 stroke-[1.5] text-[#2563EB]" />
                  <span>Legal / DMCA Policy</span>
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Global Modals */}
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
      <SurpriseModal isOpen={surpriseOpen} onClose={() => setSurpriseOpen(false)} />
      <ShortcutsModal isOpen={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />
      <AuthModal />
    </>
  );
}
