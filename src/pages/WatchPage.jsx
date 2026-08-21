import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { CONFIG } from '../config/siteConfig';
import { ArrowLeft, Server } from 'lucide-react';

export default function WatchPage() {
  const { type, id, season, episode } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const startParam = searchParams.get('startAt') || searchParams.get('t');
  const currentSeason = season || 1;
  const currentEpisode = episode || 1;

  const [mediaTitle, setMediaTitle] = useState('');
  const [selectedPlayerId, setSelectedPlayerId] = useState(CONFIG.players[0].id);

  // Find active player configuration
  const activePlayer = CONFIG.players.find(p => p.id === selectedPlayerId) || CONFIG.players[0];

  const seconds = startParam ? (startParam.endsWith('m') ? parseInt(startParam) * 60 : parseInt(startParam)) : 0;

  // Generate embed URL using selected player's logic
  const embedUrl = type === 'movie'
    ? activePlayer.getMovieUrl(id, seconds)
    : activePlayer.getTvUrl(id, currentSeason, currentEpisode, seconds);

  // Save history on initial load
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
    <div className="fixed inset-0 z-50 bg-black flex flex-col font-sans">
      {/* Top Overlay Bar */}
      <div className="absolute top-6 left-6 right-6 z-50 flex items-center justify-between gap-4 pointer-events-none">
        
        {/* Left: Back Button & Title */}
        <div className="flex items-center gap-4 pointer-events-auto">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#1D2128]/80 hover:bg-[#1D2128] text-xs font-sans font-medium tracking-wide text-zinc-300 hover:text-white border border-white/10 backdrop-blur-md transition-all cursor-pointer shadow-lg"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>BACK</span>
          </button>
          {mediaTitle && (
            <span className="hidden sm:inline-block text-xs font-sans font-semibold tracking-wide text-zinc-300 bg-[#1D2128]/70 px-4 py-2 rounded-full backdrop-blur-md border border-white/10 shadow-lg">
              {mediaTitle} {type === 'tv' && `— S${currentSeason} E${currentEpisode}`}
            </span>
          )}
        </div>

        {/* Right: Server Switcher matching WarayFlix design */}
        <div className="flex items-center gap-2 bg-[#1D2128]/90 p-1.5 rounded-full backdrop-blur-md border border-white/10 pointer-events-auto shadow-xl">
          <div className="flex items-center gap-1.5 px-3 text-zinc-400 text-xs font-sans font-medium tracking-wide hidden md:flex">
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

      {/* Fullscreen Video Player */}
      <div className="w-full h-full relative">
        <iframe 
          src={embedUrl}
          key={selectedPlayerId}
          title={`${activePlayer.name} Video Player`}
          className="w-full h-full border-0"
          allowFullScreen
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        />
      </div>
    </div>
  );
}