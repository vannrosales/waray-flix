import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { CONFIG } from '../config/siteConfig';
import { ArrowLeft, Server, ChevronDown } from 'lucide-react';

export default function WatchPage() {
  const { type, id, season, episode } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const startParam = searchParams.get('startAt') || searchParams.get('t');
  const currentSeason = season || 1;
  const currentEpisode = episode || 1;

  const [mediaTitle, setMediaTitle] = useState('');
  const [selectedPlayerId, setSelectedPlayerId] = useState(CONFIG.players[0].id);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const menuRef = useRef(null);

  const activePlayer = CONFIG.players.find(p => p.id === selectedPlayerId) || CONFIG.players[0];
  const seconds = startParam ? (startParam.endsWith('m') ? parseInt(startParam) * 60 : parseInt(startParam)) : 0;

  const embedUrl = type === 'movie'
    ? activePlayer.getMovieUrl(id, seconds)
    : activePlayer.getTvUrl(id, currentSeason, currentEpisode, seconds);

  // Close mobile dropdown when clicking outside
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

  useEffect(() => {
    let isMounted = true;

    async function saveInitialHistory() {
      try {
        const res = await fetch(`https://api.themoviedb.org/3/${type}/${id}?api_key=${CONFIG.tmdbApiKey}`);
        if (!res.ok) return;
        const data = await res.json();
        
        if (!isMounted) return;
        const title = data.title || data.name;
        setMediaTitle(title);

        const historyItem = {
          id: data.id,
          title: title,
          poster_path: data.poster_path,
          backdrop_path: data.backdrop_path,
          media_type: type,
          season: type === 'tv' ? currentSeason : undefined,
          episode: type === 'tv' ? currentEpisode : undefined,
          lastWatchedSeconds: seconds,
          updatedAt: Date.now()
        };

        const existingHistory = JSON.parse(localStorage.getItem('warayflix_watch_history') || '[]');
        const filtered = existingHistory.filter(item => item.id.toString() !== id.toString());
        localStorage.setItem('warayflix_watch_history', JSON.stringify([historyItem, ...filtered]));
      } catch (err) {
        console.error('Failed to save watch history:', err);
      }
    }
    saveInitialHistory();

    return () => {
      isMounted = false;
    };
  }, [type, id, currentSeason, currentEpisode, seconds]);

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col font-sans overflow-hidden">
      
      {/* Fullscreen Video Player */}
      <div className="absolute inset-0 w-full h-full z-0 overflow-hidden">
        <iframe 
          src={embedUrl}
          key={selectedPlayerId}
          title={`${activePlayer.name} Video Player`}
          className="w-full h-full border-0 pointer-events-auto"
          allowFullScreen
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        />
      </div>

      {/* Top Overlay Bar Container */}
      <div className="absolute top-4 sm:top-6 left-4 sm:left-6 right-4 sm:right-6 z-30 flex items-center justify-between gap-2 sm:gap-4 pointer-events-none">
        
        {/* Left: Back Button & Title */}
        <div className="flex items-center gap-2 sm:gap-4 pointer-events-auto max-w-[55%] sm:max-w-[60%]">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-full bg-[#1D2128]/90 hover:bg-[#1D2128] text-xs font-sans font-medium tracking-wide text-zinc-300 hover:text-white border border-white/10 backdrop-blur-md transition-all cursor-pointer shadow-xl flex-shrink-0"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">BACK</span>
          </button>
          {mediaTitle && (
            <span className="truncate text-[11px] sm:text-xs font-sans font-semibold tracking-wide text-zinc-300 bg-[#1D2128]/80 px-3 sm:px-4 py-2 rounded-full backdrop-blur-md border border-white/10 shadow-xl">
              {mediaTitle} {type === 'tv' && `— S${currentSeason}E${currentEpisode}`}
            </span>
          )}
        </div>

        {/* Right: Responsive Server Switcher */}
        <div className="pointer-events-auto relative" ref={menuRef}>
          
          {/* MOBILE TOGGLE BUTTON (< md screens) */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden flex items-center gap-2 bg-[#1D2128]/95 px-3.5 py-2 rounded-full backdrop-blur-md border border-white/10 text-white shadow-xl cursor-pointer text-xs font-semibold"
          >
            <Server className="w-3.5 h-3.5 text-white" />
            <span>{activePlayer.name}</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${mobileMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* MOBILE DROPDOWN MENU */}
          {mobileMenuOpen && (
            <div className="md:hidden absolute right-0 mt-2 w-40 bg-[#1D2128] border border-white/10 rounded-2xl shadow-2xl p-1.5 backdrop-blur-2xl z-50 flex flex-col gap-1">
              <div className="px-3 py-1 text-[10px] font-mono text-zinc-400 border-b border-white/5 mb-0.5">
                SELECT SERVER
              </div>
              {CONFIG.players.map((player) => {
                const isSelected = player.id === selectedPlayerId;
                return (
                  <button
                    key={player.id}
                    onClick={() => {
                      setSelectedPlayerId(player.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      isSelected 
                        ? 'bg-white text-black shadow-md' 
                        : 'text-zinc-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {player.name}
                  </button>
                );
              })}
            </div>
          )}

          {/* DESKTOP PILL BAR (>= md screens) */}
          <div className="hidden md:flex items-center gap-2 bg-[#1D2128]/90 p-1.5 rounded-full backdrop-blur-md border border-white/10 shadow-xl">
            <div className="flex items-center gap-1.5 px-3 text-zinc-400 text-xs font-sans font-medium tracking-wide">
              <Server className="w-3.5 h-3.5 text-white" />
              <span>Server:</span>
            </div>
            <div className="flex items-center gap-1">
              {CONFIG.players.map((player) => {
                const isSelected = player.id === selectedPlayerId;
                return (
                  <button
                    key={player.id}
                    onClick={() => setSelectedPlayerId(player.id)}
                    className={`px-4 py-1.5 rounded-full text-xs font-sans font-semibold tracking-wide transition-all cursor-pointer ${
                      isSelected 
                        ? 'bg-white text-black shadow-[0_0_12px_rgba(255,255,255,0.3)]' 
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

    </div>
  );
}