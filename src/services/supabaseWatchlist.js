import { supabase, isSupabaseConfigured } from './supabase';

const WATCHLIST_STORAGE_KEY = 'warayflix_playlist';
const HISTORY_STORAGE_KEY = 'warayflix_watch_history';

export const watchlistService = {
  // Get all saved watchlist items (Hybrid Cloud + Local)
  async getWatchlist(userId = null) {
    if (isSupabaseConfigured && supabase && userId) {
      try {
        const { data, error } = await supabase
          .from('user_watchlist')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (!error && data) {
          // Sync local storage as cache
          localStorage.setItem(WATCHLIST_STORAGE_KEY, JSON.stringify(data));
          return data;
        }
      } catch {
        // Fallback to local
      }
    }

    try {
      return JSON.parse(localStorage.getItem(WATCHLIST_STORAGE_KEY) || '[]');
    } catch {
      return [];
    }
  },

  // Add item to watchlist
  async addToWatchlist(userId, media) {
    if (!media || !media.id) return [];

    const localList = JSON.parse(localStorage.getItem(WATCHLIST_STORAGE_KEY) || '[]');
    const normalizedItem = {
      id: media.id,
      media_id: media.id,
      media_type: media.media_type || (media.first_air_date ? 'tv' : 'movie'),
      title: media.title || media.name,
      poster_path: media.poster_path,
      backdrop_path: media.backdrop_path,
      vote_average: media.vote_average || 0,
      release_date: media.release_date || media.first_air_date,
      overview: media.overview,
      created_at: new Date().toISOString()
    };

    if (!localList.some(item => item.id === media.id)) {
      localList.unshift(normalizedItem);
      localStorage.setItem(WATCHLIST_STORAGE_KEY, JSON.stringify(localList));
    }

    if (isSupabaseConfigured && supabase && userId) {
      try {
        await supabase
          .from('user_watchlist')
          .upsert({
            user_id: userId,
            media_id: media.id,
            media_type: normalizedItem.media_type,
            title: normalizedItem.title,
            poster_path: normalizedItem.poster_path,
            backdrop_path: normalizedItem.backdrop_path,
            vote_average: normalizedItem.vote_average,
            release_date: normalizedItem.release_date,
            overview: normalizedItem.overview
          }, { onConflict: 'user_id,media_id' });
      } catch {
        // ignore cloud error
      }
    }

    window.dispatchEvent(new Event('playlistUpdated'));
    return localList;
  },

  // Remove item from watchlist
  async removeFromWatchlist(userId, mediaId) {
    const localList = JSON.parse(localStorage.getItem(WATCHLIST_STORAGE_KEY) || '[]');
    const filtered = localList.filter(item => item.id !== mediaId && item.media_id !== mediaId);
    localStorage.setItem(WATCHLIST_STORAGE_KEY, JSON.stringify(filtered));

    if (isSupabaseConfigured && supabase && userId) {
      try {
        await supabase
          .from('user_watchlist')
          .delete()
          .eq('user_id', userId)
          .eq('media_id', mediaId);
      } catch {
        // ignore cloud error
      }
    }

    window.dispatchEvent(new Event('playlistUpdated'));
    return filtered;
  },

  // Get Watch History / Continue Watching
  async getWatchHistory(userId = null) {
    if (isSupabaseConfigured && supabase && userId) {
      try {
        const { data, error } = await supabase
          .from('user_history')
          .select('*')
          .eq('user_id', userId)
          .order('updated_at', { ascending: false });

        if (!error && data) {
          localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(data));
          return data;
        }
      } catch {
        // Fallback
      }
    }

    try {
      return JSON.parse(localStorage.getItem(HISTORY_STORAGE_KEY) || '[]');
    } catch {
      return [];
    }
  },

  // Remove single history item
  async removeFromHistory(userId, mediaId) {
    const historyList = JSON.parse(localStorage.getItem(HISTORY_STORAGE_KEY) || '[]');
    const filtered = historyList.filter(item => item.id !== mediaId && item.media_id !== mediaId);
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(filtered));

    if (isSupabaseConfigured && supabase && userId) {
      try {
        await supabase
          .from('user_history')
          .delete()
          .eq('user_id', userId)
          .eq('media_id', mediaId);
      } catch {
        // ignore
      }
    }

    window.dispatchEvent(new Event('historyUpdated'));
    return filtered;
  }
};

