const PLAYLIST_KEY = 'warayflix_my_list';

export const storageService = {
  getPlaylist: () => {
    try {
      return JSON.parse(localStorage.getItem(PLAYLIST_KEY) || '[]');
    } catch (e) {
      return [];
    }
  },

  togglePlaylistItem: (media) => {
    const list = storageService.getPlaylist();
    
    const exists = list.find(item => String(item.id) === String(media.id));
    
    const updatedList = exists 
      ? list.filter(item => String(item.id) !== String(media.id))
      : [media, ...list];
    
    localStorage.setItem(PLAYLIST_KEY, JSON.stringify(updatedList));
    return updatedList;
  },

  isInPlaylist: (id) => {
    
    return storageService.getPlaylist().some(item => String(item.id) === String(id));
  }
};