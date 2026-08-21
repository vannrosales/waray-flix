import { useState, useEffect } from 'react';
import { storageService } from '../services/storageService';

export function usePlaylist(mediaId) {
  const [isAdded, setIsAdded] = useState(false);

  useEffect(() => {
    if (mediaId) {
      setIsAdded(storageService.isInPlaylist(mediaId));
    }
  }, [mediaId]);

  const toggle = (media) => {
    storageService.togglePlaylistItem(media);
    setIsAdded(!isAdded);
  };

  return { isAdded, toggle };
}