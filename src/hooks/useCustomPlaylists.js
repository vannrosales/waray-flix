import { useState, useEffect } from 'react';
import { storageService } from '../services/storageService';

export function useCustomPlaylists() {
  const [playlists, setPlaylists] = useState([]);

  useEffect(() => {
    // Initial load
    setPlaylists(storageService.getCustomPlaylists());

    const handleUpdate = () => {
      setPlaylists(storageService.getCustomPlaylists());
    };

    window.addEventListener('customPlaylistsUpdated', handleUpdate);
    return () => window.removeEventListener('customPlaylistsUpdated', handleUpdate);
  }, []);

  const createPlaylist = (name) => {
    storageService.createCustomPlaylist(name);
  };

  const deletePlaylist = (id) => {
    storageService.deleteCustomPlaylist(id);
  };

  const toggleMedia = (playlistId, media) => {
    storageService.toggleMediaInCustomPlaylist(playlistId, media);
  };

  const isInPlaylist = (playlistId, mediaId) => {
    return storageService.isInCustomPlaylist(playlistId, mediaId);
  };

  return { playlists, createPlaylist, deletePlaylist, toggleMedia, isInPlaylist };
}

