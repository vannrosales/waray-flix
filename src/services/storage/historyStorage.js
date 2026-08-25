import { supabase, isSupabaseConfigured } from '../supabase';
import { resolveUserId } from './userResolver';

const HISTORY_KEY = 'warayflix_watch_history';

export const historyStorage = {
  getHistory: () => {
    try {
      const data = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  },

  fetchCloudHistory: async (userId = null) => {
    const effectiveUserId = await resolveUserId(userId);
    if (isSupabaseConfigured && supabase && effectiveUserId) {
      try {
        const { data, error } = await supabase
          .from('user_history')
          .select('*')
          .eq('user_id', effectiveUserId)
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
    return historyStorage.getHistory();
  },

  saveHistoryProgress: async (userId, historyItem) => {
    if (!historyItem || !historyItem.id) return;
    const mediaIdStr = String(historyItem.id);

    const localList = historyStorage.getHistory();
    const existingIndex = localList.findIndex(item => String(item.id) === mediaIdStr || String(item.media_id) === mediaIdStr);
    const existing = existingIndex >= 0 ? localList[existingIndex] : {};

    const record = {
      id: historyItem.id,
      media_id: mediaIdStr,
      media_type: historyItem.type || historyItem.media_type || existing.media_type || 'movie',
      type: historyItem.type || historyItem.media_type || existing.type || 'movie',
      title: historyItem.title || historyItem.name || existing.title || existing.name || '',
      poster_path: historyItem.poster_path || existing.poster_path || '',
      lastWatchedSeconds: Math.floor(
        (historyItem.lastWatchedSeconds !== undefined && (historyItem.lastWatchedSeconds > 0 || !existing.lastWatchedSeconds))
          ? historyItem.lastWatchedSeconds
          : (existing.lastWatchedSeconds || 0)
      ),
      totalSeconds: Math.floor(historyItem.totalSeconds || existing.totalSeconds || (historyItem.type === 'tv' ? 2700 : 7200)),
      durationSeconds: Math.floor(historyItem.durationSeconds || existing.durationSeconds || (historyItem.type === 'tv' ? 2700 : 7200)),
      season: Number(historyItem.season || existing.season) || 1,
      episode: Number(historyItem.episode || existing.episode) || 1,
      updated_at: new Date().toISOString()
    };

    if (existingIndex >= 0) {
      localList[existingIndex] = record;
    } else {
      localList.unshift(record);
    }
    localStorage.setItem(HISTORY_KEY, JSON.stringify(localList.slice(0, 30)));
    window.dispatchEvent(new Event('historyUpdated'));

    const effectiveUserId = await resolveUserId(userId);
    if (isSupabaseConfigured && supabase && effectiveUserId) {
      try {
        await supabase
          .from('user_history')
          .upsert({
            user_id: effectiveUserId,
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

  removeFromHistory: async (mediaId, userId = null) => {
    const mediaIdStr = String(mediaId);
    const list = historyStorage.getHistory();
    const filtered = list.filter(item => String(item.id) !== mediaIdStr && String(item.media_id) !== mediaIdStr);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(filtered));
    window.dispatchEvent(new Event('historyUpdated'));

    const effectiveUserId = await resolveUserId(userId);
    if (isSupabaseConfigured && supabase && effectiveUserId) {
      try {
        await supabase
          .from('user_history')
          .delete()
          .eq('user_id', effectiveUserId)
          .eq('media_id', mediaIdStr);
      } catch (err) {
        console.warn('Supabase remove history error:', err);
      }
    }

    return filtered;
  },

  clearHistory: async (userId = null) => {
    localStorage.removeItem(HISTORY_KEY);
    window.dispatchEvent(new Event('historyUpdated'));

    const effectiveUserId = await resolveUserId(userId);
    if (isSupabaseConfigured && supabase && effectiveUserId) {
      try {
        await supabase
          .from('user_history')
          .delete()
          .eq('user_id', effectiveUserId);
      } catch (err) {
        console.warn('Supabase clear history error:', err);
      }
    }
  }
};

