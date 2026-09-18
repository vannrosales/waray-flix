export const CUSTOM_PLAYLISTS_KEY = 'warayflix_custom_playlists';

export const customPlaylistStorage = {
  getPlaylists: () => {
    try {
      const data = JSON.parse(localStorage.getItem(CUSTOM_PLAYLISTS_KEY) || '[]');
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  },

  createPlaylist: (name) => {
    const list = customPlaylistStorage.getPlaylists();
    const newPlaylist = {
      id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
      name: name.trim(),
      items: [],
      createdAt: new Date().toISOString()
    };
    list.push(newPlaylist);
    localStorage.setItem(CUSTOM_PLAYLISTS_KEY, JSON.stringify(list));
    window.dispatchEvent(new Event('customPlaylistsUpdated'));
    return newPlaylist;
  },

  deletePlaylist: (playlistId) => {
    let list = customPlaylistStorage.getPlaylists();
    list = list.filter(p => p.id !== playlistId);
    localStorage.setItem(CUSTOM_PLAYLISTS_KEY, JSON.stringify(list));
    window.dispatchEvent(new Event('customPlaylistsUpdated'));
  },

  toggleMediaInPlaylist: (playlistId, media) => {
    if (!media || !media.id) return;
    const mediaIdStr = String(media.id);
    let list = customPlaylistStorage.getPlaylists();
    
    const playlistIndex = list.findIndex(p => p.id === playlistId);
    if (playlistIndex === -1) return;

    const playlist = list[playlistIndex];
    const exists = playlist.items.some(item => String(item.id) === mediaIdStr || String(item.media_id) === mediaIdStr);

    if (exists) {
      playlist.items = playlist.items.filter(item => String(item.id) !== mediaIdStr && String(item.media_id) !== mediaIdStr);
    } else {
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
        overview: media.overview || '',
        addedAt: new Date().toISOString()
      };
      // add to beginning
      playlist.items = [normalizedItem, ...playlist.items];
    }

    list[playlistIndex] = playlist;
    localStorage.setItem(CUSTOM_PLAYLISTS_KEY, JSON.stringify(list));
    window.dispatchEvent(new Event('customPlaylistsUpdated'));
    return playlist;
  },

  isInCustomPlaylist: (playlistId, mediaId) => {
    const list = customPlaylistStorage.getPlaylists();
    const playlist = list.find(p => p.id === playlistId);
    if (!playlist) return false;
    return playlist.items.some(item => String(item.id) === String(mediaId) || String(item.media_id) === String(mediaId));
  }
};

