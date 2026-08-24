import { supabase, isSupabaseConfigured } from './supabase';

const PLAYLIST_KEY = 'warayflix_my_list';
const HISTORY_KEY = 'warayflix_watch_history';

export const storageService = {
  // Synchronous getter - ALWAYS returns an Array for instant UI renders
  getPlaylist: () => {
    try {
      const data = JSON.parse(localStorage.getItem(PLAYLIST_KEY) || '[]');
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  },

  // Async cloud sync from Supabase
  fetchCloudPlaylist: async (userId = null) => {
    if (isSupabaseConfigured && supabase && userId) {
      try {
        const { data, error } = await supabase
          .from('user_watchlist')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (!error && Array.isArray(data)) {
          const normalized = data.map(item => ({
            ...item,
            id: item.media_id || item.id,
            name: item.title || item.name,
          }));
          localStorage.setItem(PLAYLIST_KEY, JSON.stringify(normalized));
          window.dispatchEvent(new Event('playlistUpdated'));
          return normalized;
        }
      } catch (err) {
        console.warn('Supabase fetchCloudPlaylist error:', err);
      }
    }
    return storageService.getPlaylist();
  },

  // Toggle Item in Watchlist (Instant UI update + Background Supabase Cloud sync)
  togglePlaylistItem: async (media, userId = null) => {
    if (!media || !media.id) return [];
    const mediaIdStr = String(media.id);

    const localList = storageService.getPlaylist();
    const exists = localList.some(item => String(item.id) === mediaIdStr || String(item.media_id) === mediaIdStr);

    const normalizedItem = {
      id: media.id,
      media_id: mediaIdStr,
      title: media.title || media.name || '',
      name: media.title || media.name || '',
      poster_path: media.poster_path || '',
      backdrop_path: media.backdrop_path || '',
      media_type: media.media_type || (media.first_air_date ? 'tv' : 'movie'),
      vote_average: Number(media.vote_average) || 0,
      release_date: media.release_date || media.first_air_date || '',
      overview: media.overview || ''
    };

    const updatedList = exists 
      ? localList.filter(item => String(item.id) !== mediaIdStr && String(item.media_id) !== mediaIdStr)
      : [normalizedItem, ...localList];

    localStorage.setItem(PLAYLIST_KEY, JSON.stringify(updatedList));
    window.dispatchEvent(new Event('playlistUpdated'));

    // Direct Supabase Cloud Operation
    if (isSupabaseConfigured && supabase && userId) {
      try {
        if (exists) {
          await supabase
            .from('user_watchlist')
            .delete()
            .eq('user_id', userId)
            .eq('media_id', mediaIdStr);
        } else {
          await supabase
            .from('user_watchlist')
            .upsert({
              user_id: userId,
              media_id: mediaIdStr,
              media_type: normalizedItem.media_type,
              title: normalizedItem.title,
              poster_path: normalizedItem.poster_path,
              backdrop_path: normalizedItem.backdrop_path,
              vote_average: normalizedItem.vote_average,
              release_date: normalizedItem.release_date,
              overview: normalizedItem.overview
            }, { onConflict: 'user_id,media_id' });
        }
      } catch (err) {
        console.warn('Supabase toggle error:', err);
      }
    }

    return updatedList;
  },

  isInPlaylist: (id) => {
    const list = storageService.getPlaylist();
    return list.some(item => String(item.id) === String(id) || String(item.media_id) === String(id));
  },

  // Synchronous history getter - ALWAYS returns an Array
  getHistory: () => {
    try {
      const data = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  },

  // Async cloud sync for Watch History
  fetchCloudHistory: async (userId = null) => {
    if (isSupabaseConfigured && supabase && userId) {
      try {
        const { data, error } = await supabase
          .from('user_history')
          .select('*')
          .eq('user_id', userId)
          .order('updated_at', { ascending: false });

        if (!error && Array.isArray(data)) {
          const normalized = data.map(item => ({
            ...item,
            id: item.media_id || item.id,
            lastWatchedSeconds: Number(item.last_watched_seconds) || 0,
            totalSeconds: Number(item.total_seconds) || 0,
            type: item.media_type
          }));
          localStorage.setItem(HISTORY_KEY, JSON.stringify(normalized));
          window.dispatchEvent(new Event('historyUpdated'));
          return normalized;
        }
      } catch (err) {
        console.warn('Supabase fetchCloudHistory error:', err);
      }
    }
    return storageService.getHistory();
  },

  // Save / Update Watch Progress
  saveHistoryProgress: async (userId, historyItem) => {
    if (!historyItem || !historyItem.id) return;
    const mediaIdStr = String(historyItem.id);

    const localList = storageService.getHistory();
    const existingIndex = localList.findIndex(item => String(item.id) === mediaIdStr);

    const record = {
      id: historyItem.id,
      media_id: mediaIdStr,
      media_type: historyItem.type || 'movie',
      type: historyItem.type || 'movie',
      title: historyItem.title || historyItem.name || '',
      poster_path: historyItem.poster_path || '',
      lastWatchedSeconds: Math.floor(historyItem.lastWatchedSeconds || 0),
      totalSeconds: Math.floor(historyItem.totalSeconds || 0),
      season: Number(historyItem.season) || 1,
      episode: Number(historyItem.episode) || 1,
      updated_at: new Date().toISOString()
    };

    if (existingIndex >= 0) {
      localList[existingIndex] = record;
    } else {
      localList.unshift(record);
    }
    localStorage.setItem(HISTORY_KEY, JSON.stringify(localList.slice(0, 30)));
    window.dispatchEvent(new Event('historyUpdated'));

    if (isSupabaseConfigured && supabase && userId) {
      try {
        await supabase
          .from('user_history')
          .upsert({
            user_id: userId,
            media_id: mediaIdStr,
            media_type: record.media_type,
            title: record.title,
            poster_path: record.poster_path,
            last_watched_seconds: record.lastWatchedSeconds,
            total_seconds: record.totalSeconds,
            season: record.season,
            episode: record.episode,
            updated_at: record.updated_at
          }, { onConflict: 'user_id,media_id' });
      } catch (err) {
        console.warn('Supabase save history error:', err);
      }
    }
  },

  // Remove single history item
  removeFromHistory: async (mediaId, userId = null) => {
    const mediaIdStr = String(mediaId);
    const list = storageService.getHistory();
    const filtered = list.filter(item => String(item.id) !== mediaIdStr && String(item.media_id) !== mediaIdStr);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(filtered));
    window.dispatchEvent(new Event('historyUpdated'));

    if (isSupabaseConfigured && supabase && userId) {
      try {
        await supabase
          .from('user_history')
          .delete()
          .eq('user_id', userId)
          .eq('media_id', mediaIdStr);
      } catch (err) {
        console.warn('Supabase remove history error:', err);
      }
    }

    return filtered;
  },

  // Clear all history
  clearHistory: async (userId = null) => {
    localStorage.removeItem(HISTORY_KEY);
    window.dispatchEvent(new Event('historyUpdated'));

    if (isSupabaseConfigured && supabase && userId) {
      try {
        await supabase
          .from('user_history')
          .delete()
          .eq('user_id', userId);
      } catch (err) {
        console.warn('Supabase clear history error:', err);
      }
    }
  }
};