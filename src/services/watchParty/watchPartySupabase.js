import { supabase, isSupabaseConfigured } from '../supabase';

export function setupWatchPartySupabase({
  roomId,
  onPacketReceived,
  onConnected
}) {
  if (!isSupabaseConfigured || !supabase) {
    return null;
  }

  const cleanRoom = roomId.toLowerCase().replace(/[^a-z0-9]/g, '');
  const channelName = `party_${cleanRoom}`;

  const channel = supabase.channel(channelName, {
    config: {
      broadcast: { self: false }
    }
  });

  channel
    .on('broadcast', { event: 'party_packet' }, (payload) => {
      if (payload && payload.payload && onPacketReceived) {
        onPacketReceived(payload.payload);
      }
    })
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        if (onConnected) onConnected();
      }
    });

  return {
    sendData: (packet) => {
      channel.send({
        type: 'broadcast',
        event: 'party_packet',
        payload: packet
      }).catch((err) => {
        console.warn('Supabase broadcast error:', err);
      });
    },
    destroy: () => {
      try {
        supabase.removeChannel(channel);
      } catch {
        // ignore
      }
    }
  };
}
