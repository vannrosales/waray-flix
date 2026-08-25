import { useEffect, useRef } from 'react';

export function useWatchPartyScrubber({
  roomId,
  isHostRef,
  localPlayerRef,
  hostUsernameRef,
  isHostOnlyLockRef,
  onBroadcastData,
  onTimeUpdated
}) {
  const anchorSecondsRef = useRef(0);
  const sessionStartRef = useRef(Date.now());

  // Load existing history
  useEffect(() => {
    try {
      const savedHistory = JSON.parse(localStorage.getItem('warayflix_watch_history') || '[]');
      const item = savedHistory.find(h => h.id && roomId.includes(h.id.toString()));
      if (item && item.lastWatchedSeconds > 0) {
        anchorSecondsRef.current = item.lastWatchedSeconds;
        sessionStartRef.current = Date.now();
        if (onTimeUpdated) onTimeUpdated(item.lastWatchedSeconds, true);
      }
    } catch {
      // ignore
    }
  }, [roomId]);

  // Playback clock ticker
  useEffect(() => {
    const ticker = setInterval(() => {
      const elapsed = Math.floor((Date.now() - sessionStartRef.current) / 1000);
      const computedTime = Math.max(0, anchorSecondsRef.current + elapsed);
      if (onTimeUpdated) onTimeUpdated(computedTime, false);
    }, 1000);

    return () => clearInterval(ticker);
  }, []);

  // Listen to iframe scrubber events
  useEffect(() => {
    function handleScrubberMessage(event) {
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

        if (rawTime !== undefined && !isNaN(rawTime) && Number(rawTime) >= 0) {
          const exactSeekSeconds = Math.floor(Number(rawTime));
          anchorSecondsRef.current = exactSeekSeconds;
          sessionStartRef.current = Date.now();
          if (onTimeUpdated) onTimeUpdated(exactSeekSeconds, false);

          if (isHostRef.current) {
            onBroadcastData({
              type: 'SYNC_PLAYBACK',
              hostTime: exactSeekSeconds,
              selectedPlayerId: localPlayerRef.current,
              isHost: true,
              hostUsername: hostUsernameRef.current,
              isHostOnlyLock: isHostOnlyLockRef.current,
            });
          }
        }
      }
    }

    window.addEventListener('message', handleScrubberMessage);
    return () => window.removeEventListener('message', handleScrubberMessage);
  }, [onBroadcastData]);

  const setManualTime = (timeSecs) => {
    anchorSecondsRef.current = timeSecs;
    sessionStartRef.current = Date.now();
  };

  const getCurrentSeconds = () => {
    return Math.max(0, anchorSecondsRef.current + Math.floor((Date.now() - sessionStartRef.current) / 1000));
  };

  return {
    setManualTime,
    getCurrentSeconds
  };
}

