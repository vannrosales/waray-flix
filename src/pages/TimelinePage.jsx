import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FRANCHISE_TIMELINES } from '../constants/franchiseTimelines';
import { storageService } from '../services/storageService';
import { getImageUrl, fetchMediaDetails, fetchMediaVideos } from '../services/tmdb';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { useAuth } from '../context/AuthContext';
import QuickViewModal from '../components/QuickViewModal';
import TimelineHero from '../components/timeline/TimelineHero';
import TimelineProgressShelf from '../components/timeline/TimelineProgressShelf';
import TimelinePhaseFilter from '../components/timeline/TimelinePhaseFilter';
import TimelineCard from '../components/timeline/TimelineCard';

export default function TimelinePage() {
  const { sagaId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [activeSagaId, setActiveSagaId] = useState(sagaId || 'mcu-doomsday');
  const [activePhase, setActivePhase] = useState('all');
  const [checkedMap, setCheckedMap] = useState({});
  const [liveMediaMap, setLiveMediaMap] = useState({});
  const [quickMedia, setQuickMedia] = useState(null);
  const [showVideo, setShowVideo] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [heroData, setHeroData] = useState({ backdrop: null, trailerKey: null });

  const currentTimeline = useMemo(() => {
    return FRANCHISE_TIMELINES.find(t => t.id === activeSagaId) || FRANCHISE_TIMELINES[0];
  }, [activeSagaId]);

  useDocumentTitle(`${currentTimeline.title} — WarayFlix`);

  // Load exact Doomsday movie 1003596 trailer & backdrop
  useEffect(() => {
    let isMounted = true;
    setShowVideo(false);

    async function loadHeroTrailer() {
      const destinationId = activeSagaId === 'mcu-doomsday' ? 1003596 : (currentTimeline.items[0]?.id || 1003596);
      try {
        const [details, videos] = await Promise.all([
          fetchMediaDetails(destinationId, 'movie'),
          fetchMediaVideos(destinationId, 'movie')
        ]);
        if (!isMounted) return;

        const trailer = (videos || []).find(v => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser')) || videos?.[0];
        
        setHeroData({
          backdrop: details?.backdrop_path ? getImageUrl(details.backdrop_path, 'backdrop') : null,
          trailerKey: trailer?.key || currentTimeline.trailerKey
        });
      } catch (err) {
        console.error("Error loading hero trailer:", err);
      }
    }

    loadHeroTrailer();
    return () => {
      isMounted = false;
    };
  }, [activeSagaId, currentTimeline]);

  // Load live TMDB metadata
  useEffect(() => {
    let isMounted = true;

    async function loadLiveDetails() {
      const promises = currentTimeline.items.map(async (item) => {
        try {
          const details = await fetchMediaDetails(item.id, item.mediaType || 'movie');
          return { id: item.id, details };
        } catch {
          return { id: item.id, details: null };
        }
      });

      const results = await Promise.allSettled(promises);
      if (!isMounted) return;

      const map = {};
      results.forEach((res) => {
        if (res.status === 'fulfilled' && res.value?.details) {
          map[res.value.id] = res.value.details;
        }
      });
      setLiveMediaMap(map);
    }

    loadLiveDetails();
    return () => {
      isMounted = false;
    };
  }, [currentTimeline]);

  // Load checklist
  useEffect(() => {
    const localChecks = JSON.parse(localStorage.getItem(`warayflix_timeline_checks_${activeSagaId}`) || '{}');
    const watchHistory = storageService.getHistory();
    const historyIds = new Set(watchHistory.map(h => String(h.id || h.media_id)));

    const merged = { ...localChecks };
    currentTimeline.items.forEach(item => {
      if (historyIds.has(String(item.id)) || historyIds.has(String(item.mediaId))) {
        merged[item.id] = true;
      }
    });

    setCheckedMap(merged);
  }, [activeSagaId, currentTimeline]);

  const handleToggleCheck = useCallback((itemId, e) => {
    if (e) e.stopPropagation();
    setCheckedMap(prev => {
      const updated = { ...prev, [itemId]: !prev[itemId] };
      localStorage.setItem(`warayflix_timeline_checks_${activeSagaId}`, JSON.stringify(updated));
      return updated;
    });
  }, [activeSagaId]);

  const handleMarkAll = useCallback((val) => {
    const updated = {};
    currentTimeline.items.forEach(item => {
      updated[item.id] = val;
    });
    setCheckedMap(updated);
    localStorage.setItem(`warayflix_timeline_checks_${activeSagaId}`, JSON.stringify(updated));
  }, [activeSagaId, currentTimeline]);

  const filteredItems = useMemo(() => {
    if (activePhase === 'all') return currentTimeline.items;
    return currentTimeline.items.filter(item => item.tier === activePhase);
  }, [currentTimeline, activePhase]);

  const totalCount = currentTimeline.items.length;
  const watchedCount = currentTimeline.items.filter(item => checkedMap[item.id]).length;
  const progressPercent = totalCount > 0 ? Math.round((watchedCount / totalCount) * 100) : 0;

  const nextUpItem = useMemo(() => {
    return currentTimeline.items.find(item => !checkedMap[item.id]) || currentTimeline.items[0];
  }, [currentTimeline, checkedMap]);

  const activeBackdrop = heroData.backdrop || getImageUrl(currentTimeline.backdropPath, 'backdrop') || getImageUrl(nextUpItem?.posterPath, 'backdrop');
  const activeTrailerKey = heroData.trailerKey || currentTimeline.trailerKey;

  const handleStartWatching = () => {
    if (nextUpItem) {
      if (nextUpItem.mediaType === 'tv') {
        navigate(`/watch/tv/${nextUpItem.id}/1/1`);
      } else {
        navigate(`/watch/movie/${nextUpItem.id}`);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#09090B] font-sans selection:bg-[#2563EB] selection:text-white pb-24 select-none">
      <TimelineHero
        currentTimeline={currentTimeline}
        activeBackdrop={activeBackdrop}
        activeTrailerKey={activeTrailerKey}
        showVideo={showVideo}
        isMuted={isMuted}
        onToggleMute={() => setIsMuted(!isMuted)}
        onCloseVideo={() => setShowVideo(false)}
        onOpenVideo={() => {
          setShowVideo(true);
          setIsMuted(false);
        }}
        onStartWatching={handleStartWatching}
        watchedCount={watchedCount}
      />

      <div className="max-w-[1440px] mx-auto px-6 md:px-12 space-y-8 mt-6">
        <TimelineProgressShelf
          watchedCount={watchedCount}
          totalCount={totalCount}
          progressPercent={progressPercent}
          onMarkAll={handleMarkAll}
          onReset={() => handleMarkAll(false)}
        />

        <TimelinePhaseFilter
          phases={currentTimeline.phases}
          activePhase={activePhase}
          onSelectPhase={setActivePhase}
        />

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          {filteredItems.map((item) => (
            <TimelineCard
              key={item.id}
              item={item}
              liveData={liveMediaMap[item.id]}
              isChecked={Boolean(checkedMap[item.id])}
              onToggleCheck={handleToggleCheck}
              onQuickView={setQuickMedia}
            />
          ))}
        </div>
      </div>

      {quickMedia && (
        <QuickViewModal
          media={quickMedia}
          type={quickMedia.media_type || 'movie'}
          isOpen={Boolean(quickMedia)}
          onClose={() => setQuickMedia(null)}
        />
      )}
    </div>
  );
}
