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
    const effectiveUserId = await storageService.resolveUserId(userId);
    if (isSupabaseConfigured && supabase && effectiveUserId) {
      try {
        const { data, error } = await supabase
          .from('user_watchlist')
          .select('*')
          .eq('user_id', effectiveUserId)
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

    const effectiveUserId = await storageService.resolveUserId(userId);
    // Direct Supabase Cloud Operation
    if (isSupabaseConfigured && supabase && effectiveUserId) {
      try {
        if (exists) {
          await supabase
            .from('user_watchlist')
            .delete()
            .eq('user_id', effectiveUserId)
            .eq('media_id', mediaIdStr);
        } else {
          await supabase
            .from('user_watchlist')
            .upsert({
              user_id: effectiveUserId,
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
    const effectiveUserId = await storageService.resolveUserId(userId);
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
    return storageService.getHistory();
  },

  // Resolve user id from parameter or active Supabase session
  resolveUserId: async (userId = null) => {
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
  },

  // Save / Update Watch Progress (with safe merging)
  saveHistoryProgress: async (userId, historyItem) => {
    if (!historyItem || !historyItem.id) return;
    const mediaIdStr = String(historyItem.id);

    const localList = storageService.getHistory();
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

    const effectiveUserId = await storageService.resolveUserId(userId);
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

  // Remove single history item
  removeFromHistory: async (mediaId, userId = null) => {
    const mediaIdStr = String(mediaId);
    const list = storageService.getHistory();
    const filtered = list.filter(item => String(item.id) !== mediaIdStr && String(item.media_id) !== mediaIdStr);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(filtered));
    window.dispatchEvent(new Event('historyUpdated'));

    const effectiveUserId = await storageService.resolveUserId(userId);
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

  // Clear all history
  clearHistory: async (userId = null) => {
    localStorage.removeItem(HISTORY_KEY);
    window.dispatchEvent(new Event('historyUpdated'));

    const effectiveUserId = await storageService.resolveUserId(userId);
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
  },

  // Save or update Watch Party Room details to Supabase
  saveWatchPartyRoom: async (userId, roomData) => {
    if (!roomData || !roomData.roomId) return null;
    const effectiveUserId = await storageService.resolveUserId(userId);
    if (isSupabaseConfigured && supabase) {
      try {
        const payload = {
          room_id: String(roomData.roomId),
          host_user_id: effectiveUserId || null,
          media_id: String(roomData.mediaId || roomData.id || ''),
          media_type: roomData.mediaType || roomData.type || 'movie',
          media_title: roomData.title || roomData.name || '',
          poster_path: roomData.posterPath || roomData.poster_path || '',
          season: Number(roomData.season) || 1,
          episode: Number(roomData.episode) || 1,
          current_time: Number(roomData.currentTime || roomData.currentPlaybackSecs) || 0,
          selected_player_id: roomData.selectedPlayerId || 'server1',
          is_host_locked: Boolean(roomData.isHostOnlyLock),
          updated_at: new Date().toISOString()
        };

        const { data, error } = await supabase
          .from('watch_party_rooms')
          .upsert(payload, { onConflict: 'room_id' })
          .select();

        if (!error && data) return data[0];
      } catch (err) {
        console.warn('Supabase saveWatchPartyRoom notice (non-fatal):', err);
      }
    }
    return null;
  },

  // Fetch active Watch Party Room details from Supabase
  fetchWatchPartyRoom: async (roomId) => {
    if (!roomId) return null;
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('watch_party_rooms')
          .select('*')
          .eq('room_id', String(roomId))
          .maybeSingle();

        if (!error && data) return data;
      } catch (err) {
        console.warn('Supabase fetchWatchPartyRoom notice:', err);
      }
    }
    return null;
  }
};