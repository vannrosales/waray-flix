import { createClient } from '@supabase/supabase-js';

const rawUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Clean and normalize base URL (strip any trailing /rest/v1 or slashes)
const supabaseUrl = rawUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

function getSupabaseClient() {
  if (!isSupabaseConfigured) return null;
  
  // Singleton pattern to prevent duplicate GoTrueClient instances on HMR / Fast Refresh
  if (!globalThis.__warayflix_supabase) {
    globalThis.__warayflix_supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      }
    });
  }
  return globalThis.__warayflix_supabase;
}

export const supabase = getSupabaseClient();
