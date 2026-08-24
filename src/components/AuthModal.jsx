import React, { useState } from 'react';
import { X, Mail, Lock, User, ShieldCheck, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AuthModal() {
  const { authModalOpen, closeAuthModal, signInWithEmail, signUpWithEmail, signInWithGoogle, isConfigured } = useAuth();
  
  const [mode, setMode] = useState('signin'); // 'signin' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!authModalOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in select-none"
      onClick={closeAuthModal}
    >
      <div 
        className="relative w-full max-w-sm bg-[#0E1017] border border-white/[0.08] rounded-2xl p-6 space-y-5 shadow-2xl animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Outlined Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-zinc-400 hover:text-white border border-white/10 transition cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-4 h-4 stroke-[1.5]" />
        </button>

        {/* Modal Header */}
        <div className="space-y-1">
          <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block">
            ACCOUNT ACCESS
          </span>
          <h3 className="text-xl font-bold text-white font-['Outfit']">
            {mode === 'signin' ? 'Welcome Back' : 'Create Free Account'}
          </h3>
          <p className="text-xs text-zinc-400 font-light">
            {mode === 'signin' 
              ? 'Sign in to access your cloud watchlist and sync progress.' 
              : 'Create an account to save movies and join watch party rooms.'}
          </p>
        </div>

        {/* 1-Click Google OAuth */}
        <button
          onClick={handleGoogleAuth}
          className="w-full py-2.5 px-4 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-white/20 text-xs font-mono text-white flex items-center justify-center gap-2.5 transition cursor-pointer"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#ffffff" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#ffffff" opacity="0.8" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#ffffff" opacity="0.6" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
            <path fill="#ffffff" opacity="0.9" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
          </svg>
          <span>Continue with Google</span>
        </button>

        {/* Divider */}
        <div className="flex items-center gap-2">
          <div className="flex-1 h-px bg-white/[0.06]" />
          <span className="text-[10px] font-mono text-zinc-500 uppercase">OR EMAIL</span>
          <div className="flex-1 h-px bg-white/[0.06]" />
        </div>

        {/* Email & Password Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === 'signup' && (
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-zinc-400 block uppercase">Display Name</label>
              <div className="relative flex items-center">
                <User className="absolute left-3 w-3.5 h-3.5 text-zinc-500 stroke-[1.5]" />
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. CinemaLover"
                  className="w-full bg-[#090A0F] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-white/30"
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[10px] font-mono text-zinc-400 block uppercase">Email Address</label>
            <div className="relative flex items-center">
              <Mail className="absolute left-3 w-3.5 h-3.5 text-zinc-500 stroke-[1.5]" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-[#090A0F] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-white/30"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-mono text-zinc-400 block uppercase">Password</label>
            <div className="relative flex items-center">
              <Lock className="absolute left-3 w-3.5 h-3.5 text-zinc-500 stroke-[1.5]" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#090A0F] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-white/30"
              />
            </div>
          </div>

          {/* Feedback messages */}
          {errorMsg && (
            <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-[11px] font-mono leading-tight">
              {errorMsg}
            </div>
          )}
          {successMsg && (
            <div className="p-2.5 rounded-xl bg-white/10 border border-white/20 text-white text-[11px] font-mono leading-tight">
              {successMsg}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-white text-black font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition cursor-pointer hover:bg-zinc-200 disabled:opacity-50 mt-2"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin stroke-[2]" />
            ) : (
              <>
                <span>{mode === 'signin' ? 'Sign In' : 'Create Account'}</span>
                <ArrowRight className="w-3.5 h-3.5 stroke-[2]" />
              </>
            )}
          </button>
        </form>

        {/* Toggle Mode */}
        <div className="pt-2 border-t border-white/[0.06] text-center text-xs font-mono text-zinc-400">
          {mode === 'signin' ? (
            <span>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setErrorMsg('');
                }}
                className="text-white hover:underline cursor-pointer font-medium"
              >
                Sign Up
              </button>
            </span>
          ) : (
            <span>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('signin');
                  setErrorMsg('');
                }}
                className="text-white hover:underline cursor-pointer font-medium"
              >
                Sign In
              </button>
            </span>
          )}
        </div>

        {/* Setup notice if keys not configured yet */}
        {!isConfigured && (
          <div className="flex items-center gap-2 p-2 rounded-xl bg-white/[0.02] border border-white/[0.04] text-[10px] font-mono text-zinc-500">
            <ShieldCheck className="w-3.5 h-3.5 stroke-[1.5] text-zinc-400 flex-shrink-0" />
            <span>Supabase Cloud Mode active with instant local login fallback.</span>
          </div>
        )}

      </div>
    </div>
  );
}

