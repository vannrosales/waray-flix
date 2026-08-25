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
  PlaySquare, 
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
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-medium text-[#52525B] hover:text-[#09090B] hover:bg-black/[0.04] transition cursor-pointer text-left group"
            >
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4 stroke-[1.75] text-[#52525B] group-hover:text-[#2563EB] transition-colors" />
                <span>{link.name}</span>
              </div>
              {link.shortcut && (
                <span className="text-[10px] font-mono text-[#52525B] bg-black/[0.05] border border-black/[0.08] px-1.5 py-0.5 rounded">
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
                ? 'bg-[#2563EB] text-white font-semibold shadow-sm'
                : 'text-[#52525B] hover:text-[#09090B] hover:bg-black/[0.04]'
            }`}
          >
            <div className="flex items-center gap-3">
              <Icon className={`w-4 h-4 stroke-[1.75] ${isActive ? 'text-white' : 'text-[#52525B] group-hover:text-[#2563EB]'}`} />
              <span>{link.name}</span>
            </div>
            {link.badge && (
              <span className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded-full ${
                isActive ? 'bg-white/20 text-white' : 'bg-[#2563EB]/10 text-[#2563EB]'
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
      <header className="md:hidden fixed top-0 inset-x-0 h-16 bg-[#FAFAFA]/95 backdrop-blur-xl border-b border-black/[0.08] z-40 px-4 flex items-center justify-between select-none">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-[#09090B] text-white flex items-center justify-center shadow-sm">
            <Clapperboard className="w-3.5 h-3.5 stroke-[2]" />
          </div>
          <span className="text-sm font-bold tracking-widest text-[#09090B] font-['Outfit']">
            WARAY<span className="text-[#2563EB] ml-1">FLIX</span>
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setSearchOpen(true)}
            className="p-2 rounded-xl bg-black/[0.04] border border-black/[0.08] text-[#09090B]"
            title="Search"
          >
            <Search className="w-4 h-4 stroke-[1.5]" />
          </button>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-xl bg-black/[0.04] border border-black/[0.08] text-[#09090B]"
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
          className="md:hidden fixed inset-0 bg-black/40 backdrop-blur-xs z-40 animate-fade-in"
        />
      )}

      {/* ─── Desktop & Mobile Sliding Sidebar ─── */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#FAFAFA] border-r border-black/[0.08] flex flex-col justify-between p-4 transition-transform duration-300 select-none overflow-y-auto ${
          mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="space-y-6">
          {/* Brand Logo Header */}
          <div className="px-2 pt-2 flex items-center justify-between">
            <Link to="/" onClick={() => setMobileOpen(false)} className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-xl bg-[#09090B] text-white flex items-center justify-center shadow-sm group-hover:bg-[#2563EB] transition-colors">
                <Clapperboard className="w-4 h-4 stroke-[2]" />
              </div>
              <span className="text-base font-bold tracking-wider text-[#09090B] font-['Outfit']">
                WARAY<span className="text-[#2563EB] ml-1">FLIX</span>
              </span>
            </Link>
            <button onClick={() => setMobileOpen(false)} className="md:hidden p-1.5 text-zinc-400 hover:text-black">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Section 1: Primary Group in White Card Box */}
          <div className="bg-white border border-black/[0.08] rounded-3xl p-2 shadow-xs">
            {renderNavGroup(primaryLinks)}
          </div>

          {/* Section 2: Media Categories */}
          <div className="space-y-2 px-1">
            <span className="text-[10px] font-mono uppercase text-[#52525B] px-3 font-bold tracking-wider block">
              Media
            </span>
            {renderNavGroup(mediaLinks)}
          </div>

          {/* Section 3: More / Legal */}
          <div className="space-y-2 px-1">
            <span className="text-[10px] font-mono uppercase text-[#52525B] px-3 font-bold tracking-wider block">
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

