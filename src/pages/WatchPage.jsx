import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { CONFIG } from '../config/siteConfig';
import { ArrowLeft, Server, ChevronDown, SkipForward, Layers, X, Play, QrCode, Users2, PictureInPicture2 } from 'lucide-react';
import ShareModal from '../components/ShareModal';
import { usePlayer } from '../context/PlayerContext';
import { useAuth } from '../context/AuthContext';
import { storageService } from '../services/storageService';
import { fetchMediaDetails, fetchSeasonDetails, getImageUrl } from '../services/tmdb';

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
  const [epDrawerOpen, setEpDrawerOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [hudVisible, setHudVisible] = useState(true);

  const [tvShowDetails, setTvShowDetails] = useState(null);
  const [currentSeasonData, setCurrentSeasonData] = useState(null);
  const [selectedDrawerSeason, setSelectedDrawerSeason] = useState(currentSeason);
  
  const menuRef = useRef(null);
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
        try {
          payload = JSON.parse(payload);
        } catch {
          return;
        }
      }

      const isProgressEvent = 
        payload && (
          payload.type === 'MEDIA_PROGRESS' || 
          payload.type === 'PLAYER_EVENT' ||
          payload.event === 'timeupdate' ||
          payload.type === 'timeupdate' ||
          payload.currentTime !== undefined ||
          (payload.data && payload.data.currentTime !== undefined)
        );

      if (isProgressEvent) {
        const rawTime = payload.currentTime !== undefined 
          ? payload.currentTime 
          : (payload.data?.currentTime !== undefined ? payload.data.currentTime : payload.time);

        const rawDuration = payload.duration !== undefined 
          ? payload.duration 
          : (payload.data?.duration !== undefined ? payload.data.duration : (type === 'movie' ? 7200 : 2700));

        if (rawTime !== undefined && !isNaN(rawTime) && Number(rawTime) >= 0) {
          const exactSeekSeconds = Math.floor(Number(rawTime));
          const exactDuration = Math.floor(Number(rawDuration) || (type === 'movie' ? 7200 : 2700));

          lastScrubSecondsRef.current = exactSeekSeconds;

          // Throttle saves to once every 4 seconds to prevent iframe/UI flickering
          const now = Date.now();
          if (now - lastSaveTimestampRef.current > 4000) {
            lastSaveTimestampRef.current = now;
            storageService.saveHistoryProgress(user?.id, {
              id: id,
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
      // Final flush on unmount
      if (lastScrubSecondsRef.current > 0) {
        storageService.saveHistoryProgress(user?.id, {
          id: id,
          media_id: String(id),
          title: mediaTitleRef.current,
          media_type: type,
          season: type === 'tv' ? currentSeason : 1,
          episode: type === 'tv' ? currentEpisode : 1,
          lastWatchedSeconds: lastScrubSecondsRef.current,
        });
      }
    };
  }, [id, type, currentSeason, currentEpisode, user?.id]);

  // Auto hide HUD after 4s of mouse inactivity
  useEffect(() => {
    const handleMouseMove = () => {
      setHudVisible(true);
      if (hudTimeoutRef.current) clearTimeout(hudTimeoutRef.current);
      hudTimeoutRef.current = setTimeout(() => {
        if (!mobileMenuOpen && !epDrawerOpen) setHudVisible(false);
      }, 4000);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (hudTimeoutRef.current) clearTimeout(hudTimeoutRef.current);
    };
  }, [mobileMenuOpen, epDrawerOpen]);

  // Close menus on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMobileMenuOpen(false);
      }
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
      async function loadTvStructure() {
        try {
          const showData = await fetchMediaDetails(id, 'tv');
          setTvShowDetails(showData);
        } catch (err) {
          console.error("Failed to load show data for watch drawer:", err);
        }
      }
      loadTvStructure();
    }
  }, [id, type]);

  // Fetch Season episodes for drawer
  useEffect(() => {
    if (type === 'tv') {
      async function loadSeason() {
        try {
          const sData = await fetchSeasonDetails(id, selectedDrawerSeason);
          setCurrentSeasonData(sData);
        } catch (err) {
          console.error("Failed to load season data:", err);
        }
      }
      loadSeason();
    }
  }, [id, type, selectedDrawerSeason]);

  // Calculate Next Episode
  const getNextEpisodeInfo = useCallback(() => {
    if (type !== 'tv') return null;
    const episodes = currentSeasonData?.episodes || [];
    const hasNextInSeason = episodes.some(ep => ep.episode_number === currentEpisode + 1);

    if (hasNextInSeason) {
      return { season: currentSeason, episode: currentEpisode + 1 };
    }

    // Check if there's a next season
    const seasons = tvShowDetails?.seasons || [];
    const nextSeason = seasons.find(s => s.season_number === currentSeason + 1 && s.episode_count > 0);
    if (nextSeason) {
      return { season: currentSeason + 1, episode: 1 };
    }

    return null;
  }, [type, currentSeasonData, currentEpisode, currentSeason, tvShowDetails]);

  const nextEpisodeInfo = getNextEpisodeInfo();

  const handleNextEpisode = useCallback(() => {
    if (!nextEpisodeInfo) return;
    navigate(`/watch/tv/${id}/${nextEpisodeInfo.season}/${nextEpisodeInfo.episode}`);
  }, [nextEpisodeInfo, id, navigate]);

  // Keyboard Shortcuts (N for Next Ep, S for Next Server)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') return;

      if (e.key.toLowerCase() === 'n' && type === 'tv' && nextEpisodeInfo) {
        e.preventDefault();
        handleNextEpisode();
      } else if (e.key.toLowerCase() === 's') {
        e.preventDefault();
        const currentIndex = CONFIG.players.findIndex(p => p.id === selectedPlayerId);
        const nextPlayer = CONFIG.players[(currentIndex + 1) % CONFIG.players.length];
        setSelectedPlayerId(nextPlayer.id);
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
        if (!res.ok) return;
        const data = await res.json();
        
        if (!isMounted) return;
        const title = data.title || data.name;
        setMediaTitle(title);
        mediaTitleRef.current = title;

        const estimatedDuration = type === 'movie' ? 7200 : 2700;

        const historyItem = {
          id: data.id,
          title: title,
          poster_path: data.poster_path,
          backdrop_path: data.backdrop_path,
          overview: data.overview,
          vote_average: data.vote_average,
          release_date: data.release_date,
          first_air_date: data.first_air_date,
          media_type: type,
          season: type === 'tv' ? currentSeason : 1,
          episode: type === 'tv' ? currentEpisode : 1,
          lastWatchedSeconds: parsedSeconds, 
          totalSeconds: estimatedDuration,
          durationSeconds: estimatedDuration,
          updatedAt: Date.now()
        };

        await storageService.saveHistoryProgress(user?.id, historyItem);
      } catch (err) {
        console.error('Failed to update watch history metadata:', err);
      }
    }

    updateWatchHistory();

    return () => {
      isMounted = false;
    };
  }, [type, id, currentSeason, currentEpisode, user?.id, parsedSeconds]);

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col font-sans overflow-hidden select-none">
      
      {/* Fullscreen Video Embed Layer (Stable, Zero-Glitch) */}
      <div className="absolute inset-0 w-full h-full z-0 overflow-hidden bg-black">
        <iframe 
          src={embedUrl}
          key={`${selectedPlayerId}-${type}-${id}-${currentSeason}-${currentEpisode}`}
          title={`${activePlayer.name} Video Player`}
          className="w-full h-full border-0 pointer-events-auto"
          allowFullScreen
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        />
      </div>

      {/* Top Floating HUD Overlay */}
      <div className={`absolute top-4 sm:top-6 left-4 sm:left-6 right-4 sm:right-6 z-30 flex items-center justify-between gap-3 pointer-events-none transition-all duration-300 ${
        hudVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
      }`}>
        
        {/* Left: Back Button & Title Badge */}
        <div className="flex items-center gap-2.5 pointer-events-auto max-w-[60%]">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0E1017]/90 hover:bg-[#161922] text-xs font-mono text-zinc-300 hover:text-white border border-white/10 backdrop-blur-xl transition cursor-pointer shadow-lg flex-shrink-0"
          >
            <ArrowLeft className="w-3.5 h-3.5 stroke-[1.5]" />
            <span className="hidden xs:inline">BACK</span>
          </button>
          
          {mediaTitle && (
            <div className="truncate text-xs font-medium text-zinc-200 bg-[#0E1017]/90 px-3.5 py-1.5 rounded-full backdrop-blur-xl border border-white/10 shadow-lg flex items-center gap-2">
              <span className="truncate">{mediaTitle}</span>
              {type === 'tv' && (
                <span className="text-zinc-400 font-mono text-[10px] flex-shrink-0">
                  S{currentSeason}:E{currentEpisode}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Right Action Bar: Next Episode + Episodes Drawer + Server Switcher */}
        <div className="flex items-center gap-2 pointer-events-auto">
          
          {/* Binge Mode: Next Episode Button (TV Only) */}
          {type === 'tv' && nextEpisodeInfo && (
            <button
              onClick={handleNextEpisode}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white hover:bg-zinc-200 text-black text-xs font-semibold uppercase tracking-wider transition cursor-pointer shadow-lg"
              title={`Play S${nextEpisodeInfo.season} E${nextEpisodeInfo.episode} (Key: N)`}
            >
              <SkipForward className="w-3.5 h-3.5 stroke-[2] text-black" />
              <span className="hidden sm:inline">Next Ep</span>
              <kbd className="hidden md:inline text-[9px] font-mono opacity-60">N</kbd>
            </button>
          )}

          {/* Episode Drawer Toggle Button (TV Only) */}
          {type === 'tv' && (
            <button
              onClick={() => setEpDrawerOpen(!epDrawerOpen)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#0E1017]/90 hover:bg-[#161922] text-xs font-mono text-zinc-300 hover:text-white border border-white/10 backdrop-blur-xl transition cursor-pointer shadow-lg"
              title="Browse Episodes"
            >
              <Layers className="w-3.5 h-3.5 stroke-[1.5]" />
              <span className="hidden sm:inline">Episodes</span>
            </button>
          )}

          {/* PiP Mini Player Button */}
          <button
            onClick={() => {
              enterPiP({
                type,
                id,
                season: currentSeason,
                episode: currentEpisode,
                title: mediaTitle,
                selectedPlayerId,
                currentTime: lastScrubSecondsRef.current
              });
              navigate(`/details/${type}/${id}`);
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#0E1017]/90 hover:bg-[#161922] text-xs font-mono text-zinc-300 hover:text-white border border-white/10 backdrop-blur-xl transition cursor-pointer shadow-lg"
            title="Minimize to Floating Mini Player"
          >
            <PictureInPicture2 className="w-3.5 h-3.5 stroke-[1.5]" />
            <span className="hidden lg:inline">Mini Player</span>
          </button>

          {/* Watch Party Button */}
          <button
            onClick={() => navigate(`/party/${type}/${id}`)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#0E1017]/90 hover:bg-[#161922] text-xs font-mono text-zinc-300 hover:text-white border border-white/10 backdrop-blur-xl transition cursor-pointer shadow-lg"
            title="Start a P2P Watch Party Room"
          >
            <Users2 className="w-3.5 h-3.5 stroke-[1.5]" />
            <span className="hidden lg:inline">Party</span>
          </button>

          {/* Send to Phone / Share Button */}
          <button
            onClick={() => setShareOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#0E1017]/90 hover:bg-[#161922] text-xs font-mono text-zinc-300 hover:text-white border border-white/10 backdrop-blur-xl transition cursor-pointer shadow-lg"
            title="Send to Phone via QR Code"
          >
            <QrCode className="w-3.5 h-3.5 stroke-[1.5]" />
            <span className="hidden lg:inline">Phone Sync</span>
          </button>

          {/* Server Switcher */}
          <div className="relative" ref={menuRef}>
            {/* Mobile Server Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden flex items-center gap-2 bg-[#0E1017]/95 px-3 py-1.5 rounded-full backdrop-blur-xl border border-white/10 text-zinc-200 shadow-lg cursor-pointer text-xs"
            >
              <Server className="w-3.5 h-3.5 stroke-[1.5] text-zinc-400" />
              <span>{activePlayer.name}</span>
              <ChevronDown className={`w-3.5 h-3.5 stroke-[1.5] transition-transform ${mobileMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Mobile Server Dropdown */}
            {mobileMenuOpen && (
              <div className="md:hidden absolute right-0 mt-2 w-40 bg-[#0E1017] border border-white/10 rounded-xl shadow-2xl p-1 backdrop-blur-2xl z-50 flex flex-col gap-0.5">
                {CONFIG.players.map((player) => {
                  const isSelected = player.id === selectedPlayerId;
                  return (
                    <button
                      key={player.id}
                      onClick={() => {
                        setSelectedPlayerId(player.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs font-mono transition cursor-pointer flex items-center justify-between ${
                        isSelected 
                          ? 'bg-white text-black font-semibold' 
                          : 'text-zinc-300 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <span>{player.name}</span>
                      {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-black" />}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Desktop Server Pills */}
            <div className="hidden md:flex items-center bg-[#0E1017]/90 p-1 rounded-full border border-white/10 backdrop-blur-xl shadow-lg">
              {CONFIG.players.map((player) => {
                const isSelected = player.id === selectedPlayerId;
                return (
                  <button
                    key={player.id}
                    onClick={() => setSelectedPlayerId(player.id)}
                    className={`px-3 py-1 rounded-full text-xs font-mono transition cursor-pointer ${
                      isSelected 
                        ? 'bg-white text-black font-semibold shadow-sm' 
                        : 'text-zinc-400 hover:text-white hover:bg-white/5'
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

      {/* Episode Selection Drawer (TV Only) */}
      {type === 'tv' && epDrawerOpen && (
        <div className="absolute inset-y-0 right-0 w-full max-w-md bg-[#0E1017]/95 border-l border-white/10 backdrop-blur-2xl z-40 flex flex-col p-6 space-y-4 shadow-2xl animate-in slide-in-from-right duration-200">
          
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="space-y-0.5">
              <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest block font-semibold">
                BINGE DRAWER
              </span>
              <h2 className="text-lg font-bold text-white font-['Outfit'] truncate">
                {mediaTitle || 'TV Episodes'}
              </h2>
            </div>
            <button 
              onClick={() => setEpDrawerOpen(false)}
              className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
            >
              <X className="w-4 h-4 stroke-[1.5]" />
            </button>
          </div>

          {/* Season Selector Dropdown */}
          {tvShowDetails?.seasons && (
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono text-zinc-400 uppercase">Select Season</label>
              <select
                value={selectedDrawerSeason}
                onChange={(e) => setSelectedDrawerSeason(Number(e.target.value))}
                className="w-full bg-[#161922] border border-white/10 text-white text-xs font-mono rounded-xl p-2.5 focus:outline-none focus:border-white/30 cursor-pointer"
              >
                {tvShowDetails.seasons
                  .filter(s => s.season_number > 0)
                  .map(s => (
                    <option key={s.id} value={s.season_number}>
                      Season {s.season_number} ({s.episode_count} Episodes)
                    </option>
                  ))}
              </select>
            </div>
          )}

          {/* Episodes List */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
            {currentSeasonData?.episodes?.map((ep) => {
              const isPlaying = currentSeason === ep.season_number && currentEpisode === ep.episode_number;

              return (
                <button
                  key={ep.id}
                  onClick={() => {
                    navigate(`/watch/tv/${id}/${ep.season_number}/${ep.episode_number}`);
                    setEpDrawerOpen(false);
                  }}
                  className={`w-full text-left p-3 rounded-xl border transition cursor-pointer flex items-center justify-between gap-3 ${
                    isPlaying
                      ? 'bg-white text-black border-transparent shadow-md'
                      : 'bg-white/[0.03] hover:bg-white/[0.08] text-zinc-300 hover:text-white border-white/[0.06]'
                  }`}
                >
                  <div className="space-y-0.5 min-w-0 flex-1">
                    <span className="text-[10px] font-mono opacity-60 block">
                      EPISODE {ep.episode_number}
                    </span>
                    <h4 className="text-xs font-semibold truncate leading-tight">
                      {ep.name || `Episode ${ep.episode_number}`}
                    </h4>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {isPlaying ? (
                      <span className="px-2 py-0.5 rounded bg-black text-white text-[9px] font-mono font-bold uppercase">
                        Playing
                      </span>
                    ) : (
                      <Play className="w-3.5 h-3.5 opacity-60 stroke-[1.5]" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

        </div>
      )}

      {/* Share / QR Code Modal */}
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