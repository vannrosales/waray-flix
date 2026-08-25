import { supabase, isSupabaseConfigured } from '../supabase';

export async function resolveUserId(userId = null) {
  if (userId) return userId;
  if (isSupabaseConfigured && supabase) {
    try {
      const { data } = await supabase.auth.getSession();
      if (data?.session?.user?.id) return data.session.user.id;
    } catch {
      // ignore
    }
  }
  return null;
}

