import { useEffect, useRef } from 'react';
import { storageService } from '../services/storageService';

export function useWatchHistoryTracker({ id, type, currentSeason, currentEpisode, userId, mediaTitle, initialSeconds }) {
  const lastScrubSecondsRef = useRef(initialSeconds);
  const lastSaveTimestampRef = useRef(0);
  const mediaTitleRef = useRef(mediaTitle);

  useEffect(() => {
    mediaTitleRef.current = mediaTitle;
  }, [mediaTitle]);

  useEffect(() => {
    function handlePlayerScrubberEvent(event) {
      if (!event.data) return;
      let payload = event.data;
      if (typeof payload === 'string') {
        try {
          payload = JSON.parse(payload);
        } catch {
          return;
        }
      }

      const isProgressEvent =
        payload &&
        (payload.type === 'MEDIA_PROGRESS' ||
          payload.type === 'PLAYER_EVENT' ||
          payload.event === 'timeupdate' ||
          payload.type === 'timeupdate' ||
          payload.currentTime !== undefined ||
          (payload.data && payload.data.currentTime !== undefined));

      if (isProgressEvent) {
        const rawTime =
          payload.currentTime !== undefined
            ? payload.currentTime
            : payload.data?.currentTime !== undefined
            ? payload.data.currentTime
            : payload.time;

        const rawDuration =
          payload.duration !== undefined
            ? payload.duration
            : payload.data?.duration !== undefined
            ? payload.data.duration
            : type === 'movie'
            ? 7200
            : 2700;

        if (rawTime !== undefined && !isNaN(rawTime) && Number(rawTime) >= 0) {
          const exactSeekSeconds = Math.floor(Number(rawTime));
          const exactDuration = Math.floor(Number(rawDuration) || (type === 'movie' ? 7200 : 2700));

          lastScrubSecondsRef.current = exactSeekSeconds;

          const now = Date.now();
          if (now - lastSaveTimestampRef.current > 4000) {
            lastSaveTimestampRef.current = now;
            storageService.saveHistoryProgress(userId, {
              id,
              media_id: String(id),
              title: mediaTitleRef.current,
              media_type: type,
              season: type === 'tv' ? currentSeason : 1,
              episode: type === 'tv' ? currentEpisode : 1,
              lastWatchedSeconds: exactSeekSeconds,
              totalSeconds: exactDuration,
              durationSeconds: exactDuration,
            });
          }
        }
      }
    }

    window.addEventListener('message', handlePlayerScrubberEvent);

    return () => {
      window.removeEventListener('message', handlePlayerScrubberEvent);
      if (lastScrubSecondsRef.current > 0) {
        const estimatedDuration = type === 'movie' ? 7200 : 2700;
        storageService.saveHistoryProgress(userId, {
          id,
          media_id: String(id),
          title: mediaTitleRef.current,
          media_type: type,
          season: type === 'tv' ? currentSeason : 1,
          episode: type === 'tv' ? currentEpisode : 1,
          lastWatchedSeconds: lastScrubSecondsRef.current,
          totalSeconds: estimatedDuration,
          durationSeconds: estimatedDuration,
        });
      }
    };
  }, [id, type, currentSeason, currentEpisode, userId]);

  return { lastScrubSecondsRef };
}

