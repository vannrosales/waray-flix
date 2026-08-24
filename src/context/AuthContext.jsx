import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../services/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      // Check local guest profile if Supabase is not connected yet
      const savedUser = localStorage.getItem('warayflix_local_user');
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch {
          // ignore
        }
      }
      setLoading(false);
      return;
    }

    // Get current active session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes (sign in, sign out, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const openAuthModal = useCallback(() => setAuthModalOpen(true), []);
  const closeAuthModal = useCallback(() => setAuthModalOpen(false), []);

  const signInWithEmail = useCallback(async (email, password) => {
    if (!isSupabaseConfigured || !supabase) {
      // Offline fallback login simulation
      const fallbackUser = {
        id: `user_${Date.now()}`,
        email,
        user_metadata: { name: email.split('@')[0] }
      };
      localStorage.setItem('warayflix_local_user', JSON.stringify(fallbackUser));
      setUser(fallbackUser);
      return { data: { user: fallbackUser }, error: null };
    }

    return await supabase.auth.signInWithPassword({ email, password });
  }, []);

  const signUpWithEmail = useCallback(async (email, password, displayName) => {
    if (!isSupabaseConfigured || !supabase) {
      const fallbackUser = {
        id: `user_${Date.now()}`,
        email,
        user_metadata: { name: displayName || email.split('@')[0] }
      };
      localStorage.setItem('warayflix_local_user', JSON.stringify(fallbackUser));
      setUser(fallbackUser);
      return { data: { user: fallbackUser }, error: null };
    }

    return await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: displayName || email.split('@')[0]
        }
      }
    });
  }, []);

  const signInWithGoogle = useCallback(async () => {
    if (!isSupabaseConfigured || !supabase) {
      const fallbackUser = {
        id: `user_${Date.now()}`,
        email: 'user@gmail.com',
        user_metadata: { name: 'Google User' }
      };
      localStorage.setItem('warayflix_local_user', JSON.stringify(fallbackUser));
      setUser(fallbackUser);
      return { error: null };
    }

    return await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    });
  }, []);

  const signOut = useCallback(async () => {
    if (!isSupabaseConfigured || !supabase) {
      localStorage.removeItem('warayflix_local_user');
      setUser(null);
      return { error: null };
    }

    const res = await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    return res;
  }, []);

  const username = user?.user_metadata?.name || user?.email?.split('@')[0] || 'User';

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        username,
        loading,
        authModalOpen,
        openAuthModal,
        closeAuthModal,
        signInWithEmail,
        signUpWithEmail,
        signInWithGoogle,
        signOut,
        isConfigured: isSupabaseConfigured
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

