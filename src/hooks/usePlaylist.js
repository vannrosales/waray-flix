import { useState, useEffect } from 'react';
import { storageService } from '../services/storageService';
import { useAuth } from '../context/AuthContext';

export function usePlaylist(mediaId) {
  const [isAdded, setIsAdded] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (mediaId) {
      setIsAdded(storageService.isInPlaylist(mediaId));
    }
  }, [mediaId]);

  useEffect(() => {
    const handleUpdate = () => {
      if (mediaId) {
        setIsAdded(storageService.isInPlaylist(mediaId));
      }
    };
    window.addEventListener('playlistUpdated', handleUpdate);
    return () => window.removeEventListener('playlistUpdated', handleUpdate);
  }, [mediaId]);

  const toggle = (media) => {
    storageService.togglePlaylistItem(media, user?.id);
    setIsAdded(!isAdded);
  };

  return { isAdded, toggle };
}