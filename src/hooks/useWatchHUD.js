import { useState, useEffect, useRef } from 'react';
import { CONFIG } from '../config/siteConfig';

export function useWatchHUD({ mobileMenuOpen, epDrawerOpen, type, nextEpisodeInfo, onNextEpisode, selectedPlayerId, onSelectPlayerId }) {
  const [hudVisible, setHudVisible] = useState(true);
  const hudTimeoutRef = useRef(null);
  const menuRef = useRef(null);

  // Auto-hide HUD on mouse/touch inactivity
  useEffect(() => {
    const showHud = () => {
      setHudVisible(true);
      if (hudTimeoutRef.current) clearTimeout(hudTimeoutRef.current);
      hudTimeoutRef.current = setTimeout(() => {
        if (!mobileMenuOpen && !epDrawerOpen) setHudVisible(false);
      }, 4000);
    };

    window.addEventListener('mousemove', showHud);
    window.addEventListener('touchstart', showHud);

    return () => {
      window.removeEventListener('mousemove', showHud);
      window.removeEventListener('touchstart', showHud);
      if (hudTimeoutRef.current) clearTimeout(hudTimeoutRef.current);
    };
  }, [mobileMenuOpen, epDrawerOpen]);

  // Keyboard Shortcuts ('N' for next episode, 'S' for next server)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') return;
      if (e.key.toLowerCase() === 'n' && type === 'tv' && nextEpisodeInfo) {
        e.preventDefault();
        onNextEpisode();
      } else if (e.key.toLowerCase() === 's') {
        e.preventDefault();
        const currentIndex = CONFIG.players.findIndex(p => p.id === selectedPlayerId);
        onSelectPlayerId(CONFIG.players[(currentIndex + 1) % CONFIG.players.length].id);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [type, nextEpisodeInfo, selectedPlayerId, onNextEpisode, onSelectPlayerId]);

  return {
    hudVisible,
    setHudVisible,
    menuRef
  };
}

