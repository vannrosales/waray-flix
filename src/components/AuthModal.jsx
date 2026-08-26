import React, { useState } from 'react';
import { X, Mail, Lock, User, ShieldCheck, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { botShield } from '../utils/botShield';

export default function AuthModal() {
  const { authModalOpen, closeAuthModal, signInWithEmail, signUpWithEmail, signInWithGoogle } = useAuth();
  
  const [mode, setMode] = useState('signin'); // 'signin' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [honeypot, setHoneypot] = useState(''); // Anti-bot honeypot field
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!authModalOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    // Trap automated bots that fill out invisible honeypot input
    if (botShield.isHoneypotTriggered(honeypot) || botShield.isBotDetected) {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        setErrorMsg('Submission rejected by security shield.');
      }, 1000);
      return;
    }

    setLoading(true);

    try {
      if (mode === 'signin') {
        const { error } = await signInWithEmail(email, password);
        if (error) {
          setErrorMsg(error.message || 'Failed to sign in. Please check credentials.');
        } else {
          closeAuthModal();
        }
      } else {
        const { error } = await signUpWithEmail(email, password, displayName);
        if (error) {
          setErrorMsg(error.message || 'Failed to create account.');
        } else {
          setSuccessMsg('Account created successfully! You are now logged in.');
          setTimeout(() => closeAuthModal(), 1000);
        }
      }
    } catch (err) {
      setErrorMsg(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setErrorMsg('');
    try {
      const { error } = await signInWithGoogle();
      if (error) setErrorMsg(error.message);
    } catch (err) {
      setErrorMsg(err.message || 'Google Sign-In failed.');
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in select-none"
      onClick={closeAuthModal}
    >
      <div 
        className="relative w-full max-w-sm bg-[#121212] border border-white/15 rounded-3xl p-6 sm:p-7 space-y-5 shadow-2xl animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-4 right-4 p-2 rounded-full bg-[#252525] hover:bg-[#333333] text-zinc-400 hover:text-white border border-white/10 transition cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-4 h-4 stroke-[2]" />
        </button>

        {/* Modal Header & Segmented Mode Switcher */}
        <div className="space-y-3 pt-1">
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#1A1A1E] border border-white/[0.08]">
            <button
              type="button"
              onClick={() => { setMode('signin'); setErrorMsg(''); }}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                mode === 'signin'
                  ? 'bg-white text-black shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setMode('signup'); setErrorMsg(''); }}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                mode === 'signup'
                  ? 'bg-white text-black shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Create Account
            </button>
          </div>

          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-xl font-bold text-white tracking-tight">
              {mode === 'signin' ? 'Welcome Back' : 'Join WarayFlix'}
            </h3>
            <p className="text-xs text-zinc-400 font-normal">
              {mode === 'signin' 
                ? 'Sync your watchlist and resume movies from any device.' 
                : 'Free account to sync bookmarks and join Watch Parties.'}
            </p>
          </div>
        </div>

        {/* 1-Click Google OAuth */}
        <button
          onClick={handleGoogleAuth}
          className="w-full py-2.5 px-4 rounded-xl bg-[#1A1A1E] hover:bg-[#252525] border border-white/15 hover:border-white/30 text-xs font-bold text-white flex items-center justify-center gap-2.5 transition cursor-pointer shadow-sm active:scale-95"
        >
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
          </svg>
          <span>Continue with Google</span>
        </button>

        {/* Divider */}
        <div className="flex items-center gap-2">
          <div className="flex-1 h-px bg-white/[0.08]" />
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">OR EMAIL</span>
          <div className="flex-1 h-px bg-white/[0.08]" />
        </div>

        {/* Email & Password Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Hidden Honeypot Input for Bot Detection */}
          <div className="opacity-0 absolute -left-[9999px] h-0 w-0 pointer-events-none overflow-hidden" aria-hidden="true">
            <label htmlFor="user_secondary_url">Leave empty</label>
            <input
              id="user_secondary_url"
              type="text"
              name="user_secondary_url"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
              tabIndex={-1}
              autoComplete="off"
            />
          </div>

          {mode === 'signup' && (
            <div className="space-y-1">
              <label className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider">Display Name</label>
              <div className="relative flex items-center">
                <User className="absolute left-3.5 w-4 h-4 text-zinc-500 stroke-[1.5]" />
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Cinema Enthusiast"
                  className="w-full bg-[#1A1A1E] border border-white/10 rounded-xl pl-10 pr-3 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white/50 focus:bg-[#222228] transition font-bold"
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider">Email Address</label>
            <div className="relative flex items-center">
              <Mail className="absolute left-3.5 w-4 h-4 text-zinc-500 stroke-[1.5]" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@domain.com"
                className="w-full bg-[#1A1A1E] border border-white/10 rounded-xl pl-10 pr-3 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white/50 focus:bg-[#222228] transition font-bold"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider">Password</label>
            <div className="relative flex items-center">
              <Lock className="absolute left-3.5 w-4 h-4 text-zinc-500 stroke-[1.5]" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-[#1A1A1E] border border-white/10 rounded-xl pl-10 pr-3 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white/50 focus:bg-[#222228] transition font-bold"
              />
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/30 text-red-300 text-xs font-semibold">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
              {successMsg}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-white hover:bg-zinc-200 disabled:opacity-50 text-black font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition cursor-pointer shadow-md active:scale-95"
          >
            {loading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <span>{mode === 'signin' ? 'Sign In' : 'Create Account'}</span>
                <ArrowRight className="w-3.5 h-3.5 stroke-[2]" />
              </>
            )}
          </button>
        </form>

        {/* Footer Guarantee */}
        <div className="pt-1 text-center">
          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
             100% Free · Cloud Sync · No Card Required
          </span>
        </div>
      </div>
    </div>
  );
}
