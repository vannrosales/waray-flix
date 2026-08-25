import React from 'react';
import { LogIn } from 'lucide-react';

/**
 * Bottom banner shown to unauthenticated guests encouraging them to sign in.
 */
export default function GuestNudgeBanner({
  visible = true,
  onSignIn,
}) {
  return (
    <div className={`absolute bottom-0 left-0 right-0 z-30 pointer-events-none transition-all duration-300 ${
      visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
    }`}>
      <div className="bg-gradient-to-t from-black/70 to-transparent px-4 py-3 flex items-center justify-between gap-3 pointer-events-auto">
        <p className="text-xs text-zinc-400">
          <span className="text-white font-semibold">Sign in</span> to save progress, sync your watchlist, and start Watch Parties
        </p>
        <button
          onClick={onSignIn}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white text-black text-xs font-semibold hover:bg-zinc-100 transition cursor-pointer flex-shrink-0 shadow-lg hover:scale-105"
        >
          <LogIn className="w-3 h-3 stroke-[2]" />
          Sign In
        </button>
      </div>
    </div>
  );
}

