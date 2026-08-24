import React, { createContext, useContext, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const PlayerContext = createContext(null);

export function PlayerProvider({ children }) {
  const [activeMedia, setActiveMedia] = useState(null);
  const [isPiPActive, setIsPiPActive] = useState(false);
  const navigate = useNavigate();

  const enterPiP = useCallback((mediaData) => {
    setActiveMedia(mediaData);
    setIsPiPActive(true);
  }, []);

  const closePiP = useCallback(() => {
    setIsPiPActive(false);
    setActiveMedia(null);
  }, []);

  const expandPiP = useCallback(() => {
    if (!activeMedia) return;
    const { type, id, season, episode, currentTime, selectedPlayerId } = activeMedia;
    setIsPiPActive(false);

    const basePath = type === 'tv' 
      ? `/watch/tv/${id}/${season || 1}/${episode || 1}`
      : `/watch/movie/${id}`;
    
    const params = new URLSearchParams();
    if (currentTime > 0) params.set('startAt', Math.floor(currentTime));
    if (selectedPlayerId) params.set('player', selectedPlayerId);

    const queryString = params.toString() ? `?${params.toString()}` : '';
    navigate(`${basePath}${queryString}`);
  }, [activeMedia, navigate]);

  return (
    <PlayerContext.Provider
      value={{
        activeMedia,
        isPiPActive,
        enterPiP,
        closePiP,
        expandPiP,
        setActiveMedia
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
}

