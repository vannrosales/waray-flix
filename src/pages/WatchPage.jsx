import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { CONFIG } from '../config/siteConfig';
import { fetchSeasonDetails, fetchMediaDetails, getImageUrl } from '../services/tmdb';
import { ArrowLeft, Server, ChevronDown, SkipForward, Layers, X, Play, QrCode } from 'lucide-react';
import ShareModal from '../components/ShareModal';

export default function WatchPage() {
  const { type, id, season, episode } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const startParam = searchParams.get('startAt') || searchParams.get('t');
  const currentSeason = season ? parseInt(season) : 1;
  const currentEpisode = episode ? parseInt(episode) : 1;

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

  const activePlayer = CONFIG.players.find(p => p.id === selectedPlayerId) || CONFIG.players[0];
  
  const currentSeconds = startParam 
    ? (startParam.endsWith('m') ? parseInt(startParam) * 60 : parseInt(startParam)) 
    : 0;

  const embedUrl = type === 'movie'
    ? activePlayer.getMovieUrl(id, currentSeconds)
    : activePlayer.getTvUrl(id, currentSeason, currentEpisode, currentSeconds);

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

  // Listen for real-time postMessages
  useEffect(() => {
    function handlePlayerMessage(event) {
      if (event.data && (event.data.type === 'MEDIA_PROGRESS' || event.data.currentTime !== undefined)) {
        const preciseCurrentSecs = Math.floor(event.data.currentTime);
        const preciseTotalDuration = Math.floor(event.data.duration || (type === 'movie' ? 7200 : 2700));

        try {
          const existingHistory = JSON.parse(localStorage.getItem('warayflix_watch_history') || '[]');
          const targetIndex = existingHistory.findIndex(item => item.id.toString() === id.toString());

          if (targetIndex > -1) {
            existingHistory[targetIndex].lastWatchedSeconds = preciseCurrentSecs;
            existingHistory[targetIndex].durationSeconds = preciseTotalDuration;
            existingHistory[targetIndex].updatedAt = Date.now();
            localStorage.setItem('warayflix_watch_history', JSON.stringify(existingHistory));
          }
        } catch (e) {
          console.error('Failed to update live player progress:', e);
        }
      }
    }

    window.addEventListener('message', handlePlayerMessage);
    return () => window.removeEventListener('message', handlePlayerMessage);
  }, [id, type]);

  // Fetch initial details & update watch history
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
          season: type === 'tv' ? currentSeason : undefined,
          episode: type === 'tv' ? currentEpisode : undefined,
          lastWatchedSeconds: currentSeconds, 
          durationSeconds: estimatedDuration,
          updatedAt: Date.now()
        };

        const existingHistory = JSON.parse(localStorage.getItem('warayflix_watch_history') || '[]');
        const filtered = existingHistory.filter(item => item.id.toString() !== id.toString());
        localStorage.setItem('warayflix_watch_history', JSON.stringify([historyItem, ...filtered]));
      } catch (err) {
        console.error('Failed to update watch history:', err);
      }
    }

    updateWatchHistory();

    return () => {
      isMounted = false;
    };
  }, [type, id, currentSeason, currentEpisode, currentSeconds]);

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col font-sans overflow-hidden select-none">
      
      {/* Fullscreen Video Embed Layer */}
      <div className="absolute inset-0 w-full h-full z-0 overflow-hidden">
        <iframe 
          src={embedUrl}
          key={`${selectedPlayerId}-${currentSeason}-${currentEpisode}`}
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
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#0E1017]/90 hover:bg-[#161922] text-xs font-mono text-zinc-300 hover:text-white border border-white/10 backdrop-blur-xl transition cursor-pointer shadow-lg"
              title="Browse Episodes"
            >
              <Layers className="w-3.5 h-3.5 stroke-[1.5]" />
              <span className="hidden sm:inline">Episodes</span>
            </button>
          )}

          {/* Send to Phone / Share Button */}
          <button
            onClick={() => setShareOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#0E1017]/90 hover:bg-[#161922] text-xs font-mono text-zinc-300 hover:text-white border border-white/10 backdrop-blur-xl transition cursor-pointer shadow-lg"
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
                      className={`w-full text-left px-3 py-1.5 rounded-lg text-xs transition cursor-pointer ${
                        isSelected 
                          ? 'bg-white text-black font-semibold' 
                          : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
                      }`}
                    >
                      {player.name}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Desktop Server Pill Bar */}
            <div className="hidden md:flex items-center gap-1.5 bg-[#0E1017]/90 p-1 rounded-full backdrop-blur-xl border border-white/10 shadow-lg">
              <div className="flex items-center gap-1.5 px-2.5 text-zinc-500 text-xs font-mono">
                <Server className="w-3 h-3 stroke-[1.5] text-zinc-400" />
                <span>Server:</span>
              </div>
              <div className="flex items-center gap-1">
                {CONFIG.players.map((player) => {
                  const isSelected = player.id === selectedPlayerId;
                  return (
                    <button
                      key={player.id}
                      onClick={() => setSelectedPlayerId(player.id)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition cursor-pointer ${
                        isSelected 
                          ? 'bg-white text-black font-semibold' 
                          : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
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

      {/* In-Player TV Episode Quick-Switcher Slide-Over Drawer */}
      {type === 'tv' && epDrawerOpen && (
        <div 
          className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-fade-in"
          onClick={() => setEpDrawerOpen(false)}
        >
          <div 
            className="w-full max-w-sm sm:max-w-md h-full bg-[#0E1017] border-l border-white/10 p-5 space-y-4 flex flex-col animate-slide-up shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
              <div className="space-y-0.5">
                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
                  EPISODE SELECTOR
                </span>
                <h3 className="text-sm font-bold text-white font-['Outfit'] truncate max-w-[240px]">
                  {mediaTitle}
                </h3>
              </div>
              <button 
                onClick={() => setEpDrawerOpen(false)}
                className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-white/[0.04]"
              >
                <X className="w-4 h-4 stroke-[1.5]" />
              </button>
            </div>

            {/* Season Picker */}
            {tvShowDetails?.seasons && tvShowDetails.seasons.length > 1 && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-zinc-500">Season:</span>
                <select
                  value={selectedDrawerSeason}
                  onChange={(e) => setSelectedDrawerSeason(Number(e.target.value))}
                  className="bg-[#141822] border border-white/10 text-zinc-200 text-xs font-mono py-1.5 px-3 rounded-lg focus:outline-none transition cursor-pointer flex-1"
                >
                  {tvShowDetails.seasons.map((s) => (
                    <option key={s.id} value={s.season_number} className="bg-[#090A0F]">
                      {s.name} ({s.episode_count} Ep)
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Episodes List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {currentSeasonData?.episodes && currentSeasonData.episodes.length > 0 ? (
                currentSeasonData.episodes.map((ep) => {
                  const isCurrent = ep.episode_number === currentEpisode && selectedDrawerSeason === currentSeason;
                  const epStill = getImageUrl(ep.still_path, 'thumbnail');

                  return (
                    <div
                      key={ep.id}
                      onClick={() => {
                        setEpDrawerOpen(false);
                        navigate(`/watch/tv/${id}/${selectedDrawerSeason}/${ep.episode_number}`);
                      }}
                      className={`flex items-center gap-3 p-2.5 rounded-xl border transition cursor-pointer ${
                        isCurrent 
                          ? 'bg-white/[0.08] border-white/20 text-white' 
                          : 'bg-white/[0.02] border-white/[0.04] text-zinc-300 hover:bg-white/[0.06] hover:text-white'
                      }`}
                    >
                      <div className="w-16 h-11 rounded-lg bg-black overflow-hidden flex-shrink-0 relative">
                        {epStill ? (
                          <img src={epStill} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[8px] font-mono text-zinc-600">EP {ep.episode_number}</div>
                        )}
                        {isCurrent && (
                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                            <Play className="w-3.5 h-3.5 stroke-[2] text-white" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 mb-0.5">
                          <span className={isCurrent ? 'text-white font-semibold' : ''}>
                            EPISODE {ep.episode_number}
                          </span>
                          {ep.runtime && <span>{ep.runtime}m</span>}
                        </div>
                        <h4 className="text-xs font-semibold truncate">
                          {ep.name}
                        </h4>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-12 text-center text-xs font-mono text-zinc-500">
                  Loading episodes...
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Send to Phone / Share QR Modal */}
      <ShareModal
        isOpen={shareOpen}
        onClose={() => setShareOpen(false)}
        title={mediaTitle || "Live Stream Player"}
      />

    </div>
  );
}