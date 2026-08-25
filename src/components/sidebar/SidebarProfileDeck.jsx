import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Shuffle, User, LogOut, Bookmark, ChevronRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function SidebarProfileDeck({ onOpenSurprise }) {
  const { user, username, openAuthModal, signOut } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="pt-4 border-t border-white/[0.08] space-y-2">
      {/* ─── RANDOM MOVIE BUTTON ─── */}
      <button
        onClick={onOpenSurprise}
        className="w-full py-2.5 px-3.5 rounded-none bg-[#252525] hover:bg-[#333333] border border-white/[0.08] text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition cursor-pointer shadow-sm active:scale-95 select-none"
        title="Surprise Random Movie or Series"
      >
        <Shuffle className="w-3.5 h-3.5 stroke-[2] shrink-0" />
        <span className="leading-none">Random</span>
      </button>

      {/* ─── USER ACCOUNT / SIGN IN BUTTON ─── */}
      <div className="relative" ref={profileRef}>
        {user ? (
          <div>
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="w-full flex items-center justify-between p-2 rounded-none bg-[#252525] hover:bg-[#333333] border border-white/[0.08] transition cursor-pointer shadow-sm select-none"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-none bg-white text-black flex items-center justify-center text-xs font-bold shadow-xs shrink-0">
                  {(user.email || username || 'U')[0].toUpperCase()}
                </div>
                <span className="text-xs font-semibold text-white truncate max-w-[120px]">
                  {user.email?.split('@')[0] || username}
                </span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-zinc-400 stroke-[1.5] shrink-0" />
            </button>

            {profileOpen && (
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-[#252525] border border-white/[0.12] rounded-none p-1.5 shadow-2xl space-y-1 animate-fade-in z-50">
                <Link
                  to="/watchlist"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-none text-xs text-zinc-300 hover:text-white hover:bg-white/[0.08] transition"
                >
                  <Bookmark className="w-3.5 h-3.5 text-white shrink-0" />
                  <span>My Watchlist</span>
                </Link>
                <button
                  onClick={() => {
                    signOut();
                    setProfileOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-none text-xs text-zinc-400 hover:text-white hover:bg-white/[0.08] transition cursor-pointer text-left"
                >
                  <LogOut className="w-3.5 h-3.5 shrink-0" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={openAuthModal}
            className="w-full py-2.5 px-3.5 rounded-none bg-white hover:bg-zinc-200 text-black text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition cursor-pointer shadow-sm active:scale-95 select-none"
          >
            <User className="w-3.5 h-3.5 stroke-[2.5] shrink-0" />
            <span className="leading-none">Sign In</span>
          </button>
        )}
      </div>
    </div>
  );
}
