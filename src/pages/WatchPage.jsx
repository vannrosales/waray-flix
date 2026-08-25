import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { CONFIG } from '../config/siteConfig';
import { ArrowLeft, Server, ChevronDown, SkipForward, Layers, X, Play, QrCode, Users2, PictureInPicture2, MoreHorizontal } from 'lucide-react';
import ShareModal from '../components/ShareModal';
import { usePlayer } from '../context/PlayerContext';
import { useAuth } from '../context/AuthContext';
import { storageService } from '../services/storageService';
import { fetchMediaDetails, fetchSeasonDetails } from '../services/tmdb';

export default function WatchPage() {
  const { type, id, season, episode } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const startParam = searchParams.get('startAt') || searchParams.get('t') || searchParams.get('time');
  const currentSeason = season ? parseInt(season) : 1;
  const currentEpisode = episode ? parseInt(episode) : 1;

  // Retrieve initial seek position once on load
  const parsedSeconds = useMemo(() => {
    if (startParam) {
      return startParam.endsWith('m') ? parseInt(startParam) * 60 : parseInt(startParam);
    }
    const saved = storageService.getHistory().find(item => String(item.id || item.media_id) === String(id));
    return saved?.lastWatchedSeconds || 0;
  }, [id, startParam]);

  const { enterPiP } = usePlayer();
  const [mediaTitle, setMediaTitle] = useState('');
  const [selectedPlayerId, setSelectedPlayerId] = useState(CONFIG.players[0].id);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const [epDrawerOpen, setEpDrawerOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [hudVisible, setHudVisible] = useState(true);

  const [tvShowDetails, setTvShowDetails] = useState(null);
  const [currentSeasonData, setCurrentSeasonData] = useState(null);
  const [selectedDrawerSeason, setSelectedDrawerSeason] = useState(currentSeason);
  
  const menuRef = useRef(null);
  const moreMenuRef = useRef(null);
  const hudTimeoutRef = useRef(null);

  // Scrubber Tracking Refs (prevent 60fps React re-renders)
  const lastScrubSecondsRef = useRef(parsedSeconds);
  const lastSaveTimestampRef = useRef(0);
  const mediaTitleRef = useRef('');

  useEffect(() => {
    mediaTitleRef.current = mediaTitle;
  }, [mediaTitle]);

  const activePlayer = useMemo(() => {
    return CONFIG.players.find(p => p.id === selectedPlayerId) || CONFIG.players[0];
  }, [selectedPlayerId]);
  
  // Memoized embed URL - stays completely stable without blinking
  const embedUrl = useMemo(() => {
    return type === 'movie'
      ? activePlayer.getMovieUrl(id, parsedSeconds)
      : activePlayer.getTvUrl(id, currentSeason, currentEpisode, parsedSeconds);
  }, [activePlayer, type, id, currentSeason, currentEpisode, parsedSeconds]);

  // Scrubber Message Event Listener (throttled saving without state thrashing)
  useEffect(() => {
    function handlePlayerScrubberEvent(event) {
      if (!event.data) return;
      let payload = event.data;
      if (typeof payload === 'string') {
        try { payload = JSON.parse(payload); } catch { return; }
      }
      const isProgressEvent = payload && (
        payload.type === 'MEDIA_PROGRESS' || payload.type === 'PLAYER_EVENT' ||
        payload.event === 'timeupdate' || payload.type === 'timeupdate' ||
        payload.currentTime !== undefined || (payload.data && payload.data.currentTime !== undefined)
      );
      if (isProgressEvent) {
        const rawTime = payload.currentTime !== undefined ? payload.currentTime
          : (payload.data?.currentTime !== undefined ? payload.data.currentTime : payload.time);
        const rawDuration = payload.duration !== undefined ? payload.duration
          : (payload.data?.duration !== undefined ? payload.data.duration : (type === 'movie' ? 7200 : 2700));
        if (rawTime !== undefined && !isNaN(rawTime) && Number(rawTime) >= 0) {
          const exactSeekSeconds = Math.floor(Number(rawTime));
          const exactDuration = Math.floor(Number(rawDuration) || (type === 'movie' ? 7200 : 2700));
          lastScrubSecondsRef.current = exactSeekSeconds;
          const now = Date.now();
          if (now - lastSaveTimestampRef.current > 4000) {
            lastSaveTimestampRef.current = now;
            storageService.saveHistoryProgress(user?.id, {
              id, media_id: String(id), title: mediaTitleRef.current, media_type: type,
              season: type === 'tv' ? currentSeason : 1, episode: type === 'tv' ? currentEpisode : 1,
              lastWatchedSeconds: exactSeekSeconds, totalSeconds: exactDuration, durationSeconds: exactDuration,
            });
          }
        }
      }
    }
    window.addEventListener('message', handlePlayerScrubberEvent);
    return () => {
      window.removeEventListener('message', handlePlayerScrubberEvent);
      if (lastScrubSecondsRef.current > 0) {
        storageService.saveHistoryProgress(user?.id, {
          id, media_id: String(id), title: mediaTitleRef.current, media_type: type,
          season: type === 'tv' ? currentSeason : 1, episode: type === 'tv' ? currentEpisode : 1,
          lastWatchedSeconds: lastScrubSecondsRef.current,
        });
      }
    };
  }, [id, type, currentSeason, currentEpisode, user?.id]);

  // HUD visibility: tap to show/hide on mobile, auto-hide after 4s on desktop
  useEffect(() => {
    const showHud = () => {
      setHudVisible(true);
      if (hudTimeoutRef.current) clearTimeout(hudTimeoutRef.current);
      hudTimeoutRef.current = setTimeout(() => {
        if (!mobileMenuOpen && !moreMenuOpen && !epDrawerOpen) setHudVisible(false);
      }, 4000);
    };
    window.addEventListener('mousemove', showHud);
    window.addEventListener('touchstart', showHud, { passive: true });
    return () => {
      window.removeEventListener('mousemove', showHud);
      window.removeEventListener('touchstart', showHud);
      if (hudTimeoutRef.current) clearTimeout(hudTimeoutRef.current);
    };
  }, [mobileMenuOpen, moreMenuOpen, epDrawerOpen]);

  // Close menus on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) setMobileMenuOpen(false);
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target)) setMoreMenuOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  // Fetch TV Series structure for Binge Mode
  useEffect(() => {
    if (type === 'tv') {
      fetchMediaDetails(id, 'tv').then(setTvShowDetails).catch(err => console.error("Failed to load show:", err));
    }
  }, [id, type]);

  // Fetch Season episodes for drawer
  useEffect(() => {
    if (type === 'tv') {
      fetchSeasonDetails(id, selectedDrawerSeason).then(setCurrentSeasonData).catch(err => console.error("Failed to load season:", err));
    }
  }, [id, type, selectedDrawerSeason]);

  // Calculate Next Episode
  const getNextEpisodeInfo = useCallback(() => {
    if (type !== 'tv') return null;
    const episodes = currentSeasonData?.episodes || [];
    if (episodes.some(ep => ep.episode_number === currentEpisode + 1)) {
      return { season: currentSeason, episode: currentEpisode + 1 };
    }
    const nextSeason = (tvShowDetails?.seasons || []).find(s => s.season_number === currentSeason + 1 && s.episode_count > 0);
    return nextSeason ? { season: currentSeason + 1, episode: 1 } : null;
  }, [type, currentSeasonData, currentEpisode, currentSeason, tvShowDetails]);

  const nextEpisodeInfo = getNextEpisodeInfo();

  const handleNextEpisode = useCallback(() => {
    if (!nextEpisodeInfo) return;
    navigate(`/watch/tv/${id}/${nextEpisodeInfo.season}/${nextEpisodeInfo.episode}`);
  }, [nextEpisodeInfo, id, navigate]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') return;
      if (e.key.toLowerCase() === 'n' && type === 'tv' && nextEpisodeInfo) { e.preventDefault(); handleNextEpisode(); }
      else if (e.key.toLowerCase() === 's') {
        e.preventDefault();
        const currentIndex = CONFIG.players.findIndex(p => p.id === selectedPlayerId);
        setSelectedPlayerId(CONFIG.players[(currentIndex + 1) % CONFIG.players.length].id);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [type, nextEpisodeInfo, selectedPlayerId, handleNextEpisode]);

  // Fetch initial media title metadata
  useEffect(() => {
    let isMounted = true;
    async function updateWatchHistory() {
      try {
        const res = await fetch(`https://api.themoviedb.org/3/${type}/${id}?api_key=${CONFIG.tmdbApiKey}`);
        if (!res.ok || !isMounted) return;
        const data = await res.json();
        const title = data.title || data.name;
        setMediaTitle(title);
        mediaTitleRef.current = title;
        const estimatedDuration = type === 'movie' ? 7200 : 2700;
        await storageService.saveHistoryProgress(user?.id, {
          id: data.id, title, poster_path: data.poster_path, backdrop_path: data.backdrop_path,
          overview: data.overview, vote_average: data.vote_average, release_date: data.release_date,
          first_air_date: data.first_air_date, media_type: type,
          season: type === 'tv' ? currentSeason : 1, episode: type === 'tv' ? currentEpisode : 1,
          lastWatchedSeconds: parsedSeconds, totalSeconds: estimatedDuration,
          durationSeconds: estimatedDuration, updatedAt: Date.now()
        });
      } catch (err) { console.error('Failed to update watch history:', err); }
    }
    updateWatchHistory();
    return () => { isMounted = false; };
  }, [type, id, currentSeason, currentEpisode, user?.id, parsedSeconds]);

  // Pill button style helpers
  const pillBase = 'flex items-center gap-1.5 rounded-full backdrop-blur-xl border border-white/10 shadow-lg transition cursor-pointer text-xs font-mono';
  const pillDark = `${pillBase} bg-[#0E1017]/90 hover:bg-[#161922] text-zinc-300 hover:text-white`;

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col font-sans overflow-hidden select-none">

      {/* ─── Fullscreen Video Layer ─── */}
      <div className="absolute inset-0 z-0 bg-black">
        <iframe
          src={embedUrl}
          key={`${selectedPlayerId}-${type}-${id}-${currentSeason}-${currentEpisode}`}
          title={`${activePlayer.name} Video Player`}
          className="w-full h-full border-0 pointer-events-auto"
          allowFullScreen
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        />
      </div>

      {/* ─── TOP HUD ─── */}
      <div className={`absolute top-0 left-0 right-0 z-30 pointer-events-none transition-all duration-300 ${
        hudVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
      }`}>
        {/* Gradient fade for readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-transparent pointer-events-none" style={{ height: '80px' }} />

        <div className="relative flex items-center justify-between gap-2 px-3 py-3 sm:px-5 sm:py-4 pointer-events-auto">

          {/* LEFT: Back + Title */}
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <button
              onClick={() => navigate(-1)}
              className={`${pillDark} px-2.5 py-1.5 flex-shrink-0`}
              aria-label="Go back"
            >
              <ArrowLeft className="w-3.5 h-3.5 stroke-[1.5]" />
              <span className="hidden sm:inline">Back</span>
            </button>

            {mediaTitle && (
              <div className="min-w-0 flex items-center gap-1.5 bg-[#0E1017]/80 px-2.5 py-1.5 rounded-full border border-white/10 backdrop-blur-xl shadow-lg">
                <span className="text-[11px] font-medium text-zinc-200 truncate max-w-[120px] sm:max-w-[220px] md:max-w-none">{mediaTitle}</span>
                {type === 'tv' && (
                  <span className="text-[10px] font-mono text-zinc-400 flex-shrink-0">S{currentSeason}·E{currentEpisode}</span>
                )}
              </div>
            )}
          </div>

          {/* RIGHT: Actions */}
          <div className="flex items-center gap-1.5 flex-shrink-0">

            {/* Next Ep — always icon, label on sm+ */}
            {type === 'tv' && nextEpisodeInfo && (
              <button
                onClick={handleNextEpisode}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-white hover:bg-zinc-100 text-black text-xs font-semibold transition cursor-pointer shadow-lg"
                title={`S${nextEpisodeInfo.season} E${nextEpisodeInfo.episode}`}
              >
                <SkipForward className="w-3.5 h-3.5 stroke-[2]" />
                <span className="hidden sm:inline">Next</span>
              </button>
            )}

            {/* Episodes drawer — TV only */}
            {type === 'tv' && (
              <button
                onClick={() => setEpDrawerOpen(!epDrawerOpen)}
                className={`${pillDark} px-2.5 py-1.5`}
                title="Browse Episodes"
              >
                <Layers className="w-3.5 h-3.5 stroke-[1.5]" />
                <span className="hidden sm:inline">Episodes</span>
              </button>
            )}

            {/* Desktop-only extras: PiP, Party, QR */}
            <button
              onClick={() => {
                enterPiP({ type, id, season: currentSeason, episode: currentEpisode, title: mediaTitle, selectedPlayerId, currentTime: lastScrubSecondsRef.current });
                navigate(`/details/${type}/${id}`);
              }}
              className={`${pillDark} px-2.5 py-1.5 hidden sm:flex`}
              title="Mini Player"
            >
              <PictureInPicture2 className="w-3.5 h-3.5 stroke-[1.5]" />
              <span className="hidden lg:inline">Mini Player</span>
            </button>

            <button
              onClick={() => navigate(`/party/${type}/${id}`)}
              className={`${pillDark} px-2.5 py-1.5 hidden sm:flex`}
              title="Watch Party"
            >
              <Users2 className="w-3.5 h-3.5 stroke-[1.5]" />
              <span className="hidden lg:inline">Party</span>
            </button>

            <button
              onClick={() => setShareOpen(true)}
              className={`${pillDark} px-2.5 py-1.5 hidden sm:flex`}
              title="Phone Sync"
            >
              <QrCode className="w-3.5 h-3.5 stroke-[1.5]" />
              <span className="hidden lg:inline">Phone Sync</span>
            </button>

            {/* Mobile "More" menu (PiP, Party, QR collapsed) */}
            <div className="relative sm:hidden" ref={moreMenuRef}>
              <button
                onClick={() => setMoreMenuOpen(!moreMenuOpen)}
                className={`${pillDark} px-2.5 py-1.5`}
                aria-label="More options"
              >
                <MoreHorizontal className="w-3.5 h-3.5 stroke-[1.5]" />
              </button>
              {moreMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-44 bg-[#0E1017] border border-white/10 rounded-2xl shadow-2xl backdrop-blur-2xl z-50 overflow-hidden">
                  <button
                    onClick={() => {
                      enterPiP({ type, id, season: currentSeason, episode: currentEpisode, title: mediaTitle, selectedPlayerId, currentTime: lastScrubSecondsRef.current });
                      navigate(`/details/${type}/${id}`);
                      setMoreMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-xs text-zinc-300 hover:bg-white/10 hover:text-white transition"
                  >
                    <PictureInPicture2 className="w-3.5 h-3.5 stroke-[1.5]" />
                    Mini Player
                  </button>
                  <button
                    onClick={() => { navigate(`/party/${type}/${id}`); setMoreMenuOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-xs text-zinc-300 hover:bg-white/10 hover:text-white transition"
                  >
                    <Users2 className="w-3.5 h-3.5 stroke-[1.5]" />
                    Watch Party
                  </button>
                  <button
                    onClick={() => { setShareOpen(true); setMoreMenuOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-xs text-zinc-300 hover:bg-white/10 hover:text-white transition"
                  >
                    <QrCode className="w-3.5 h-3.5 stroke-[1.5]" />
                    Phone Sync (QR)
                  </button>
                </div>
              )}
            </div>

            {/* Server Switcher */}
            <div className="relative" ref={menuRef}>
              {/* Mobile: compact dropdown toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className={`${pillDark} px-2.5 py-1.5 md:hidden`}
                aria-label="Switch server"
              >
                <Server className="w-3.5 h-3.5 stroke-[1.5] text-zinc-400" />
                <ChevronDown className={`w-3 h-3 stroke-[1.5] transition-transform ${mobileMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {mobileMenuOpen && (
                <div className="md:hidden absolute right-0 top-full mt-2 w-40 bg-[#0E1017] border border-white/10 rounded-2xl shadow-2xl backdrop-blur-2xl z-50 overflow-hidden">
                  {CONFIG.players.map((player) => {
                    const isSelected = player.id === selectedPlayerId;
                    return (
                      <button
                        key={player.id}
                        onClick={() => { setSelectedPlayerId(player.id); setMobileMenuOpen(false); }}
                        className={`w-full flex items-center justify-between px-4 py-3 text-xs font-mono transition cursor-pointer ${
                          isSelected ? 'bg-white text-black font-semibold' : 'text-zinc-300 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        <span>{player.name}</span>
                        {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-black flex-shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Desktop: inline pill switcher */}
              <div className="hidden md:flex items-center bg-[#0E1017]/90 p-1 rounded-full border border-white/10 backdrop-blur-xl shadow-lg">
                {CONFIG.players.map((player) => {
                  const isSelected = player.id === selectedPlayerId;
                  return (
                    <button
                      key={player.id}
                      onClick={() => setSelectedPlayerId(player.id)}
                      className={`px-3 py-1 rounded-full text-xs font-mono transition cursor-pointer ${
                        isSelected ? 'bg-white text-black font-semibold shadow-sm' : 'text-zinc-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      {player.name}
                    </button>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ─── Episode Drawer (TV Only) ─── */}
      {type === 'tv' && epDrawerOpen && (
        <div className="absolute inset-y-0 right-0 w-full max-w-[min(420px,100vw)] bg-[#0E1017]/95 border-l border-white/10 backdrop-blur-2xl z-40 flex flex-col shadow-2xl">
          {/* Drawer Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 flex-shrink-0">
            <div>
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Binge Drawer</span>
              <h2 className="text-base font-bold text-white truncate max-w-[220px]">{mediaTitle || 'Episodes'}</h2>
            </div>
            <button onClick={() => setEpDrawerOpen(false)} className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer flex-shrink-0">
              <X className="w-4 h-4 stroke-[1.5]" />
            </button>
          </div>

          {/* Season Select */}
          {tvShowDetails?.seasons && (
            <div className="px-5 pt-4 pb-2 flex-shrink-0">
              <label className="text-[10px] font-mono text-zinc-500 uppercase block mb-1.5">Season</label>
              <select
                value={selectedDrawerSeason}
                onChange={(e) => setSelectedDrawerSeason(Number(e.target.value))}
                className="w-full bg-[#161922] border border-white/10 text-white text-xs font-mono rounded-xl p-2.5 focus:outline-none focus:border-white/30 cursor-pointer"
              >
                {tvShowDetails.seasons.filter(s => s.season_number > 0).map(s => (
                  <option key={s.id} value={s.season_number}>
                    Season {s.season_number} ({s.episode_count} eps)
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Episodes List */}
          <div className="flex-1 overflow-y-auto px-5 pb-6 pt-2 space-y-1.5">
            {currentSeasonData?.episodes?.map((ep) => {
              const isPlaying = currentSeason === ep.season_number && currentEpisode === ep.episode_number;
              return (
                <button
                  key={ep.id}
                  onClick={() => { navigate(`/watch/tv/${id}/${ep.season_number}/${ep.episode_number}`); setEpDrawerOpen(false); }}
                  className={`w-full text-left px-3 py-3 rounded-xl border transition cursor-pointer flex items-center justify-between gap-3 ${
                    isPlaying
                      ? 'bg-white text-black border-transparent shadow-md'
                      : 'bg-white/[0.03] hover:bg-white/[0.08] text-zinc-300 hover:text-white border-white/[0.06]'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-mono opacity-50 block">EP {ep.episode_number}</span>
                    <h4 className="text-xs font-semibold truncate leading-snug">{ep.name || `Episode ${ep.episode_number}`}</h4>
                  </div>
                  <div className="flex-shrink-0">
                    {isPlaying
                      ? <span className="px-2 py-0.5 rounded bg-black text-white text-[9px] font-mono font-bold uppercase">Playing</span>
                      : <Play className="w-3.5 h-3.5 opacity-50 stroke-[1.5]" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Share / QR Modal */}
      {shareOpen && (
        <ShareModal
          isOpen={shareOpen}
          onClose={() => setShareOpen(false)}
          title={mediaTitle}
          type={type}
          id={id}
          season={currentSeason}
          episode={currentEpisode}
        />
      )}
    </div>
  );
}