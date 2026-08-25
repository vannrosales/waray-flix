import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Clapperboard, 
  Search, 
  Menu, 
  X, 
  Home as HomeIcon, 
  Film, 
  Tv, 
  Sparkles, 
  Bookmark, 
  Flame, 
  ShieldCheck 
} from 'lucide-react';
import SearchModal from './SearchModal';
import SurpriseModal from './SurpriseModal';
import ShortcutsModal from './ShortcutsModal';
import AuthModal from './AuthModal';
import SidebarProfileDeck from './sidebar/SidebarProfileDeck';

export default function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [surpriseOpen, setSurpriseOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  
  const location = useLocation();

  // Global Keyboard Shortcuts (/, ?, D)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') return;
      if (e.key === '/') {
        e.preventDefault();
        setSearchOpen(true);
      } else if (e.key === '?') {
        e.preventDefault();
        setShortcutsOpen(prev => !prev);
      } else if (e.key.toLowerCase() === 'd') {
        e.preventDefault();
        setSurpriseOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const primaryLinks = [
    { name: 'Home', path: '/', icon: HomeIcon },
    { name: 'Search', action: () => setSearchOpen(true), icon: Search, shortcut: '/' },
    { name: 'Timeline', path: '/timeline', icon: Flame, badge: 'Doomsday' },
  ];

  const mediaLinks = [
    { name: 'Movies', path: '/movies', icon: Film },
    { name: 'TV Shows', path: '/tv', icon: Tv },
    { name: 'Anime', path: '/category/anime', icon: Sparkles },
    { name: 'Watchlist', path: '/watchlist', icon: Bookmark },
  ];

  const moreLinks = [
    { name: 'Legal / DMCA', path: '/legal', icon: ShieldCheck },
  ];

  const renderNavGroup = (links) => (
    <div className="space-y-1">
      {links.map((link) => {
        const Icon = link.icon;
        const isActive = link.path ? location.pathname === link.path : false;

        if (link.action) {
          return (
            <button
              key={link.name}
              onClick={() => {
                link.action();
                setMobileOpen(false);
              }}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-medium text-zinc-400 hover:text-white hover:bg-white/[0.06] transition cursor-pointer text-left group"
            >
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4 stroke-[1.75] text-zinc-400 group-hover:text-white transition-colors" />
                <span>{link.name}</span>
              </div>
              {link.shortcut && (
                <span className="text-[10px] font-mono text-zinc-400 bg-white/[0.06] border border-white/[0.08] px-1.5 py-0.5 rounded">
                  {link.shortcut}
                </span>
              )}
            </button>
          );
        }

        return (
          <Link
            key={link.name}
            to={link.path}
            onClick={() => setMobileOpen(false)}
            className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-medium transition group ${
              isActive
                ? 'bg-white text-black font-semibold shadow-sm'
                : 'text-zinc-400 hover:text-white hover:bg-white/[0.06]'
            }`}
          >
            <div className="flex items-center gap-3">
              <Icon className={`w-4 h-4 stroke-[1.75] ${isActive ? 'text-black' : 'text-zinc-400 group-hover:text-white'}`} />
              <span>{link.name}</span>
            </div>
            {link.badge && (
              <span className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded-full ${
                isActive ? 'bg-black/15 text-black' : 'bg-white/10 text-white border border-white/10'
              }`}>
                {link.badge}
              </span>
            )}
          </Link>
        );
      })}
    </div>
  );

  return (
    <>
      {/* ─── Mobile Top App Bar ─── */}
      <header className="md:hidden fixed top-0 inset-x-0 h-16 bg-[#0F0F12]/95 backdrop-blur-xl border-b border-white/[0.08] z-40 px-4 flex items-center justify-between select-none">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-white text-black flex items-center justify-center shadow-sm">
            <Clapperboard className="w-3.5 h-3.5 stroke-[2]" />
          </div>
          <span className="text-sm font-bold tracking-widest text-white font-['Outfit']">
            WARAY<span className="text-zinc-400 ml-1">FLIX</span>
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setSearchOpen(true)}
            className="p-2 rounded-xl bg-white/[0.06] border border-white/[0.08] text-white hover:bg-white/[0.12]"
            title="Search"
          >
            <Search className="w-4 h-4 stroke-[1.5]" />
          </button>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-xl bg-white/[0.06] border border-white/[0.08] text-white hover:bg-white/[0.12]"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-4 h-4 stroke-[1.5]" /> : <Menu className="w-4 h-4 stroke-[1.5]" />}
          </button>
        </div>
      </header>

      {/* ─── Mobile Drawer Overlay ─── */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="md:hidden fixed inset-0 bg-black/70 backdrop-blur-xs z-40 animate-fade-in"
        />
      )}

      {/* ─── Desktop & Mobile Sliding Sidebar ─── */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#0F0F12] border-r border-white/[0.08] flex flex-col justify-between p-4 transition-transform duration-300 select-none overflow-y-auto ${
          mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="space-y-6">
          {/* Brand Logo Header */}
          <div className="px-2 pt-2 flex items-center justify-between">
            <Link to="/" onClick={() => setMobileOpen(false)} className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-xl bg-white text-black flex items-center justify-center shadow-sm transition-transform group-hover:scale-105">
                <Clapperboard className="w-4 h-4 stroke-[2]" />
              </div>
              <span className="text-base font-bold tracking-wider text-white font-['Outfit']">
                WARAY<span className="text-zinc-400 ml-1">FLIX</span>
              </span>
            </Link>
            <button onClick={() => setMobileOpen(false)} className="md:hidden p-1.5 text-zinc-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Section 1: Primary Group in Dark Grey Card Box */}
          <div className="bg-[#18181C] border border-white/[0.08] rounded-3xl p-2 shadow-xs">
            {renderNavGroup(primaryLinks)}
          </div>

          {/* Section 2: Media Categories */}
          <div className="space-y-2 px-1">
            <span className="text-[10px] font-mono uppercase text-zinc-500 px-3 font-bold tracking-wider block">
              Media
            </span>
            {renderNavGroup(mediaLinks)}
          </div>

          {/* Section 3: More / Legal */}
          <div className="space-y-2 px-1">
            <span className="text-[10px] font-mono uppercase text-zinc-500 px-3 font-bold tracking-wider block">
              More
            </span>
            {renderNavGroup(moreLinks)}
          </div>
        </div>

        {/* Bottom Utility / User Deck */}
        <SidebarProfileDeck
          onOpenSurprise={() => setSurpriseOpen(true)}
          onOpenShortcuts={() => setShortcutsOpen(true)}
        />
      </aside>

      {/* Global Modals */}
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
      <SurpriseModal isOpen={surpriseOpen} onClose={() => setSurpriseOpen(false)} />
      <ShortcutsModal isOpen={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />
      <AuthModal />
    </>
  );
}
