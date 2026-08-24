import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { CONFIG } from '../config/siteConfig';
import { ArrowLeft, Server, ChevronDown } from 'lucide-react';

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
  const [hudVisible, setHudVisible] = useState(true);
  
  const menuRef = useRef(null);
  const hudTimeoutRef = useRef(null);

  const activePlayer = CONFIG.players.find(p => p.id === selectedPlayerId) || CONFIG.players[0];
  
  const currentSeconds = startParam 
    ? (startParam.endsWith('m') ? parseInt(startParam) * 60 : parseInt(startParam)) 
    : 0;

  const embedUrl = type === 'movie'
    ? activePlayer.getMovieUrl(id, currentSeconds)
    : activePlayer.getTvUrl(id, currentSeason, currentEpisode, currentSeconds);

  // Auto hide HUD after 4s
  useEffect(() => {
    const handleMouseMove = () => {
      setHudVisible(true);
      if (hudTimeoutRef.current) clearTimeout(hudTimeoutRef.current);
      hudTimeoutRef.current = setTimeout(() => {
        if (!mobileMenuOpen) setHudVisible(false);
      }, 4000);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (hudTimeoutRef.current) clearTimeout(hudTimeoutRef.current);
    };
  }, [mobileMenuOpen]);

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

        {/* Right: Server Switcher */}
        <div className="pointer-events-auto relative" ref={menuRef}>
          
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
  );
}