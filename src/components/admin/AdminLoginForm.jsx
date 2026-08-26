import React from 'react';
import { Lock, User, ArrowRight } from 'lucide-react';

export default function AdminLoginForm({
  username,
  setUsername,
  password,
  setPassword,
  loginError,
  onLogin,
}) {
  return (
    <div className="max-w-md mx-auto py-8">
      <div className="bg-[#121212] border border-white/[0.12] rounded-3xl p-7 sm:p-8 space-y-6 shadow-2xl">
        <div className="space-y-1 text-center">
          <div className="w-12 h-12 rounded-2xl bg-[#252525] border border-white/10 mx-auto flex items-center justify-center text-white mb-3 shadow-sm">
            <Lock className="w-6 h-6 stroke-[1.75]" />
          </div>
          <h2 className="text-xl font-bold text-white">Administrator Sign In</h2>
          <p className="text-xs text-zinc-400">Enter master credentials to broadcast maintenance notices.</p>
        </div>

        <form onSubmit={onLogin} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider">Admin Username</label>
            <div className="relative flex items-center">
              <User className="absolute left-3.5 w-4 h-4 text-zinc-400 stroke-[1.5]" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                className="w-full bg-[#18181C] border border-white/10 rounded-xl pl-10 pr-3 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white/40 font-bold"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider">Admin Password</label>
            <div className="relative flex items-center">
              <Lock className="absolute left-3.5 w-4 h-4 text-zinc-400 stroke-[1.5]" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-[#18181C] border border-white/10 rounded-xl pl-10 pr-3 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white/40 font-bold"
              />
            </div>
          </div>

          {loginError && (
            <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/30 text-red-300 text-xs font-semibold">
              {loginError}
            </div>
          )}

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-black font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition cursor-pointer shadow-md active:scale-95"
          >
            <span>Authenticate</span>
            <ArrowRight className="w-3.5 h-3.5 stroke-[2]" />
          </button>
        </form>
      </div>
    </div>
  );
}

