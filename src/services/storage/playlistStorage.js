import { supabase, isSupabaseConfigured } from '../supabase';
import { resolveUserId } from './userResolver';

const PLAYLIST_KEY = 'warayflix_my_list';

export const playlistStorage = {
  getPlaylist: () => {
    try {
      const data = JSON.parse(localStorage.getItem(PLAYLIST_KEY) || '[]');
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  },

  fetchCloudPlaylist: async (userId = null) => {
    const effectiveUserId = await resolveUserId(userId);
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
    return playlistStorage.getPlaylist();
  },

  togglePlaylistItem: async (media, userId = null) => {
    if (!media || !media.id) return [];
    const mediaIdStr = String(media.id);

    const localList = playlistStorage.getPlaylist();
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

    const effectiveUserId = await resolveUserId(userId);
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
    const list = playlistStorage.getPlaylist();
    return list.some(item => String(item.id) === String(id) || String(item.media_id) === String(id));
  }
};

