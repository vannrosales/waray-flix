import { supabase, isSupabaseConfigured } from '../supabase';
import { resolveUserId } from './userResolver';

export const watchPartyStorage = {
  saveWatchPartyRoom: async (userId, roomData) => {
    if (!roomData || !roomData.roomId) return null;
    const effectiveUserId = await resolveUserId(userId);
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

