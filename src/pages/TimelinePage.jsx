import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FRANCHISE_TIMELINES } from '../constants/franchiseTimelines';
import { storageService } from '../services/storageService';
import { getImageUrl, fetchMediaDetails, fetchMediaVideos } from '../services/tmdb';
import { 
  Play, 
  Check, 
  Sparkles, 
  RotateCcw, 
  Film, 
  Compass, 
  CheckCircle2, 
  Eye, 
  CheckCheck,
  Volume2,
  VolumeX,
  X
} from 'lucide-react';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { useAuth } from '../context/AuthContext';
import QuickViewModal from '../components/QuickViewModal';

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

  // Filtered items
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

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#09090B] font-sans selection:bg-[#2563EB] selection:text-white pb-24 select-none">
      
      {/* ─── Full-Bleed Cinematic Hero Section ─── */}
      <div className="relative h-[70vh] sm:h-[80vh] w-full overflow-hidden flex items-end select-none bg-black">
        
        {/* High-Resolution Photography Backdrop */}
        {activeBackdrop && (
          <img
            src={activeBackdrop}
            alt={currentTimeline.title}
            fetchPriority="high"
            decoding="async"
            className={`absolute inset-0 w-full h-full object-cover object-center transition-all duration-1000 ${
              showVideo && activeTrailerKey ? 'opacity-0 scale-105' : 'opacity-85 scale-100'
            }`}
          />
        )}

        {/* Interactive Autoplaying / Active Trailer */}
        {activeTrailerKey && showVideo && (
          <div className="absolute inset-0 w-full h-full overflow-hidden flex items-center justify-center animate-fade-in">
            <div className="absolute w-[320%] h-[320%] md:w-[150%] md:h-[150%]">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${activeTrailerKey}?autoplay=1&mute=${isMuted ? 1 : 0}&controls=1&rel=0&modestbranding=1`}
                title={currentTimeline.trailerTitle || 'Official Trailer'}
                className="w-full h-full object-cover border-0"
                allow="autoplay; encrypted-media"
                allowFullScreen
              />
            </div>

            {/* Sound & Close Video Control Deck */}
            <div className="absolute top-24 right-6 md:right-12 z-30 flex items-center gap-2">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="w-10 h-10 rounded-full bg-black/70 hover:bg-black text-white border border-white/20 backdrop-blur-md flex items-center justify-center transition cursor-pointer shadow-xl hover:scale-105"
                title={isMuted ? "Unmute Preview" : "Mute Preview"}
              >
                {isMuted ? <VolumeX className="w-4 h-4 stroke-[1.5]" /> : <Volume2 className="w-4 h-4 stroke-[1.5]" />}
              </button>

              <button
                onClick={() => setShowVideo(false)}
                className="px-3 py-2 rounded-full bg-black/70 hover:bg-black text-white border border-white/20 backdrop-blur-md text-xs font-mono flex items-center gap-1.5 transition cursor-pointer shadow-xl"
                title="Exit Special Look"
              >
                <X className="w-4 h-4" />
                <span>Close Trailer</span>
              </button>
            </div>
          </div>
        )}

        {/* Cinema Vignettes */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/30 pointer-events-none" />
        <div className="absolute inset-y-0 left-0 w-full md:w-3/5 bg-gradient-to-r from-black/95 via-black/50 to-transparent pointer-events-none" />
        
        {/* Soft Bottom Merge to #FAFAFA Canvas */}
        <div className="absolute bottom-0 inset-x-0 h-14 bg-gradient-to-t from-[#FAFAFA] to-transparent pointer-events-none" />

        {/* Hero Content Section */}
        <div className="relative z-20 max-w-[1440px] w-full mx-auto px-6 md:px-12 pb-14 space-y-4">
          
          {/* Metadata Badges */}
          <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-zinc-300">
            <span className="px-2.5 py-0.5 rounded-full border border-white/20 bg-black/60 backdrop-blur-md text-white font-bold text-[10px] tracking-wider uppercase shadow-sm">
              {currentTimeline.universe}
            </span>
            <span className="text-white font-semibold">15 CHAPTERS</span>
            <span>·</span>
            <span className="text-zinc-300 text-[11px] font-semibold">CHRONOLOGICAL CANON</span>
            <span>·</span>
            <span className="text-[#2563EB] font-bold">ROAD TO DOOMSDAY</span>
          </div>

          {/* Clean Typography Title */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white font-['Outfit'] max-w-3xl leading-[1.05] drop-shadow-lg">
            {currentTimeline.title}
          </h1>

          {/* Overview Synopsis */}
          <p className="text-zinc-200 text-xs sm:text-sm line-clamp-2 max-w-2xl font-normal leading-relaxed drop-shadow-md">
            {currentTimeline.tagline} Follow the 15-chapter sequence in chronological storyline order and track your readiness for the collision with Doctor Doom.
          </p>

          {/* Action Button Deck */}
          <div className="pt-2 flex flex-wrap items-center gap-3.5">
            {/* Primary Watch / Continue Button */}
            <button
              onClick={() => {
                if (nextUpItem) {
                  if (nextUpItem.mediaType === 'tv') {
                    navigate(`/watch/tv/${nextUpItem.id}/1/1`);
                  } else {
                    navigate(`/watch/movie/${nextUpItem.id}`);
                  }
                }
              }}
              className="px-7 py-2.5 rounded-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold text-xs tracking-wider uppercase flex items-center gap-2 transition cursor-pointer shadow-xl hover:scale-105"
            >
              <Play className="w-3.5 h-3.5 stroke-[2] fill-white text-white" />
              <span>{watchedCount === 0 ? 'Start Timeline' : 'Continue Watching'}</span>
            </button>

            {/* Special Look Trailer Button */}
            {activeTrailerKey && (
              <button
                onClick={() => {
                  setShowVideo(true);
                  setIsMuted(false);
                }}
                className="px-5 py-2.5 rounded-full bg-black/60 hover:bg-black text-white font-medium text-xs tracking-wider uppercase border border-white/20 backdrop-blur-md flex items-center gap-2 transition cursor-pointer shadow-md hover:scale-105"
              >
                <Film className="w-3.5 h-3.5 stroke-[1.5] text-[#2563EB]" />
                <span>Watch Special Look Trailer</span>
              </button>
            )}
          </div>

        </div>

      </div>

      {/* ─── Main Content Canvas ─── */}
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 space-y-8 mt-6">
        
        {/* ─── Franchise Selector & Prep Progress Card ─── */}
        <div className="bg-white border border-black/[0.08] rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
          
          {/* Franchise Tabs */}
          <div className="space-y-3 w-full md:w-auto">
            <span className="text-[11px] font-mono text-[#52525B] uppercase tracking-wider font-semibold block">
              Select Franchise Universe
            </span>
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
              {FRANCHISE_TIMELINES.map((saga) => {
                const isActive = saga.id === activeSagaId;
                return (
                  <button
                    key={saga.id}
                    onClick={() => {
                      setActiveSagaId(saga.id);
                      setActivePhase('all');
                    }}
                    className={`px-4 py-2 rounded-full text-xs font-mono transition cursor-pointer flex items-center gap-2 flex-shrink-0 border ${
                      isActive
                        ? 'bg-[#09090B] text-white border-transparent shadow-sm font-bold scale-[1.02]'
                        : 'bg-zinc-50 hover:bg-zinc-100 text-[#52525B] hover:text-[#09090B] border-black/[0.08]'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5 stroke-[1.5]" />
                    <span>{saga.shortTitle}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Progress Tracker Dial */}
          <div className="w-full md:w-80 space-y-2 border-t md:border-t-0 md:border-l border-black/[0.08] pt-4 md:pt-0 md:pl-6">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="font-semibold text-[#09090B]">
                Your Progress ({watchedCount}/{totalCount})
              </span>
              <span className="font-bold text-[#2563EB]">{progressPercent}% Ready</span>
            </div>
            <div className="w-full h-2.5 bg-zinc-100 rounded-full overflow-hidden border border-black/[0.06] p-0.5">
              <div 
                className="h-full rounded-full bg-[#2563EB] transition-all duration-500 shadow-sm"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex items-center gap-3 pt-0.5 text-xs font-mono">
              <button
                onClick={() => handleMarkAll(true)}
                className="text-[11px] text-[#52525B] hover:text-[#2563EB] flex items-center gap-1 transition cursor-pointer hover:underline"
              >
                <CheckCheck className="w-3 h-3 stroke-[2] text-[#2563EB]" />
                <span>Mark all</span>
              </button>
              <span className="text-zinc-300">·</span>
              <button
                onClick={() => handleMarkAll(false)}
                className="text-[11px] text-[#52525B] hover:text-[#09090B] flex items-center gap-1 transition cursor-pointer hover:underline"
              >
                <RotateCcw className="w-3 h-3 stroke-[2]" />
                <span>Reset</span>
              </button>
            </div>
          </div>

        </div>

        {/* ─── Phase Categories Filter Pills ─── */}
        <div className="flex items-center gap-2 border-b border-black/[0.08] pb-4 overflow-x-auto scrollbar-none">
          {currentTimeline.phases.map(phase => (
            <button
              key={phase.id}
              onClick={() => setActivePhase(phase.id)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition cursor-pointer flex-shrink-0 ${
                activePhase === phase.id
                  ? 'bg-[#09090B] text-white font-bold shadow-xs'
                  : 'bg-black/[0.04] text-[#52525B] hover:text-[#09090B] hover:bg-black/[0.08]'
              }`}
            >
              {phase.label}
            </button>
          ))}
        </div>

        {/* ─── Visual Media Cards Grid (Matching Home Page MediaCard Tokens) ─── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          {filteredItems.map((item) => {
            const isChecked = Boolean(checkedMap[item.id]);
            const liveData = liveMediaMap[item.id];
            const rawPoster = liveData?.poster_path || item.posterPath;
            const rawBackdrop = liveData?.backdrop_path || item.backdropPath;
            const posterUrl = getImageUrl(rawPoster, 'posterSmall') || getImageUrl(rawBackdrop, 'backdropSmall');

            return (
              <div
                key={item.id}
                onClick={() => navigate(`/details/${item.mediaType}/${item.id}`)}
                className="cursor-pointer group/item flex flex-col gap-2 flex-shrink-0 transition-all duration-200"
              >
                {/* Poster Canvas */}
                <div className={`relative aspect-[2/3] w-full rounded-2xl overflow-hidden bg-white border border-black/[0.06] group-hover/item:border-[#2563EB]/40 transition-all duration-200 group-hover/item:scale-[1.02] shadow-sm hover:shadow-md ${
                  isChecked ? 'ring-2 ring-[#2563EB]/30' : ''
                }`}>
                  {posterUrl ? (
                    <img 
                      src={posterUrl} 
                      alt={item.title} 
                      loading="lazy"
                      decoding="async"
                      className={`absolute inset-0 w-full h-full object-cover transition duration-300 group-hover/item:brightness-105 ${
                        isChecked ? 'brightness-95' : ''
                      }`}
                    />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-3 text-center text-zinc-400 bg-zinc-100">
                      <Film className="w-6 h-6 mb-1 opacity-30 stroke-[1.5]" />
                      <span className="text-[9px] font-mono text-[#52525B] line-clamp-2">{item.title}</span>
                    </div>
                  )}

                  {/* Top Left: Chronological Number Badge */}
                  <div className="absolute top-2 left-2 z-20 pointer-events-none">
                    <span className="bg-[#09090B]/90 text-white text-[9px] font-mono font-bold px-2 py-0.5 rounded-md shadow-xs">
                      #{item.order}
                    </span>
                  </div>

                  {/* Top Right: Watched Checkbox Pill */}
                  <div className="absolute top-2 right-2 z-20">
                    <button
                      onClick={(e) => handleToggleCheck(item.id, e)}
                      className={`px-2 py-0.5 rounded-md text-[9px] font-mono font-bold flex items-center gap-1 transition cursor-pointer shadow-xs ${
                        isChecked
                          ? 'bg-[#2563EB] text-white'
                          : 'bg-white/90 backdrop-blur-md text-[#09090B] border border-black/10 hover:bg-white'
                      }`}
                      title={isChecked ? 'Mark as unwatched' : 'Mark as watched'}
                    >
                      {isChecked ? (
                        <>
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                          <span>Watched</span>
                        </>
                      ) : (
                        <span>+ Watch</span>
                      )}
                    </button>
                  </div>

                  {/* Hover Quick Action Deck */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/item:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2 z-30 p-2 pointer-events-none">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (item.mediaType === 'tv') {
                          navigate(`/watch/tv/${item.id}/1/1`);
                        } else {
                          navigate(`/watch/movie/${item.id}`);
                        }
                      }}
                      className="pointer-events-auto w-9 h-9 rounded-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white flex items-center justify-center transition cursor-pointer shadow-md hover:scale-105"
                      title="Watch Now"
                    >
                      <Play className="w-3.5 h-3.5 stroke-[2] fill-white text-white" />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setQuickMedia({ ...item, media_type: item.mediaType });
                      }}
                      className="pointer-events-auto w-8 h-8 rounded-full bg-white/90 hover:bg-white text-[#09090B] backdrop-blur-md flex items-center justify-center border border-black/10 transition cursor-pointer shadow-xs hover:scale-105"
                      title="Quick Preview"
                    >
                      <Eye className="w-3.5 h-3.5 stroke-[1.5]" />
                    </button>
                  </div>
                </div>

                {/* Title & Metadata (Identical to Home Page MediaCards) */}
                <div className="space-y-0.5 px-0.5">
                  <h3 className={`text-xs font-semibold line-clamp-1 transition group-hover/item:text-[#2563EB] ${
                    isChecked ? 'text-zinc-500 line-through' : 'text-[#09090B]'
                  }`}>
                    {item.title}
                  </h3>
                  <div className="flex items-center gap-1.5 text-[10px] text-[#52525B] font-mono">
                    <span>{item.year}</span>
                    <span>·</span>
                    <span className="uppercase font-medium">{item.mediaType}</span>
                    {item.importanceLabel && (
                      <>
                        <span>·</span>
                        <span className="text-[#2563EB] font-bold">{item.importanceLabel}</span>
                      </>
                    )}
                  </div>
                </div>

              </div>
            );
          })}
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
