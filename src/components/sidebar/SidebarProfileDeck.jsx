import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Dices, HelpCircle, User, LogOut, Bookmark, ChevronRight } from 'lucide-react';
import InstallPrompt from '../InstallPrompt';
import { useAuth } from '../../context/AuthContext';

export default function SidebarProfileDeck({ onOpenSurprise, onOpenShortcuts }) {
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
    <div className="pt-6 border-t border-white/[0.08] space-y-3">
      {/* Utility Buttons: Random Movie & Shortcuts */}
      <div className="flex items-center gap-2">
        <button
          onClick={onOpenSurprise}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-2xl bg-[#18181C] border border-white/[0.08] hover:border-white/30 text-xs font-mono text-zinc-300 hover:text-white transition cursor-pointer shadow-xs"
          title="Surprise Random Title"
        >
          <Dices className="w-3.5 h-3.5 stroke-[1.5]" />
          <span>Random</span>
        </button>

        <button
          onClick={onOpenShortcuts}
          className="p-2 rounded-2xl bg-[#18181C] border border-white/[0.08] hover:border-white/30 text-zinc-400 hover:text-white transition cursor-pointer shadow-xs"
          title="Keyboard Shortcuts (?)"
        >
          <HelpCircle className="w-4 h-4 stroke-[1.5]" />
        </button>

        <InstallPrompt />
      </div>

      {/* User Account / Profile */}
      <div className="relative" ref={profileRef}>
        {user ? (
          <div className="space-y-2">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="w-full flex items-center justify-between p-2 rounded-2xl bg-[#18181C] border border-white/[0.08] hover:border-white/30 transition cursor-pointer shadow-xs"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-xl bg-white text-black flex items-center justify-center font-mono text-xs font-bold shadow-xs">
                  {(user.email || username || 'U')[0].toUpperCase()}
                </div>
                <span className="text-xs font-semibold text-white truncate max-w-[120px]">
                  {user.email?.split('@')[0] || username}
                </span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-zinc-400 stroke-[1.5]" />
            </button>

            {profileOpen && (
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-[#18181C] border border-white/[0.12] rounded-2xl p-1.5 shadow-2xl space-y-1 animate-fade-in z-50">
                <Link
                  to="/watchlist"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-zinc-300 hover:text-white hover:bg-white/[0.08] transition"
                >
                  <Bookmark className="w-3.5 h-3.5 text-white" />
                  <span>My Watchlist</span>
                </Link>
                <button
                  onClick={() => {
                    signOut();
                    setProfileOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-zinc-400 hover:text-white hover:bg-white/[0.08] transition cursor-pointer text-left"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={openAuthModal}
            className="w-full py-2.5 px-4 rounded-2xl bg-white hover:bg-zinc-200 text-black text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 transition cursor-pointer shadow-sm"
          >
            <User className="w-3.5 h-3.5 stroke-[2]" />
            <span>Sign In</span>
          </button>
        )}
      </div>
    </div>
  );
}
