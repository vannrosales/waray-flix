import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { CONFIG } from '../config/siteConfig';
import { ArrowLeft } from 'lucide-react';

export default function WatchPage() {
  const { type, id, season, episode } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Accept either 't' (from your existing history links) or 'startAt' (seconds)
  const startParam = searchParams.get('startAt') || searchParams.get('t');

  const currentSeason = season || 1;
  const currentEpisode = episode || 1;

  const [mediaTitle, setMediaTitle] = useState('');

  // Construct VidLink Pro URL format with ?startAt= if available
  let embedUrl = type === 'movie'
    ? `${CONFIG.embedDomain}/movie/${id}`
    : `${CONFIG.embedDomain}/tv/${id}/${currentSeason}/${currentEpisode}`;

  if (startParam) {
    // If your old history stores minutes (e.g. ?t=5m), convert to seconds, else use raw seconds
    const seconds = startParam.endsWith('m') 
      ? parseInt(startParam) * 60 
      : parseInt(startParam);

    if (!isNaN(seconds)) {
      embedUrl += `?startAt=${seconds}`;
    }
  }

  // Save/Update watch history locally when the page loads
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
          lastWatchedSeconds: startParam ? parseInt(startParam) : 0, 
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
  }, [type, id, currentSeason, currentEpisode, startParam]);

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      {/* Top Header Bar */}
      <div className="absolute top-6 left-6 z-50 flex items-center gap-4">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#1D2128]/80 hover:bg-[#1D2128] text-xs font-mono text-zinc-300 hover:text-white border border-white/10 backdrop-blur-md transition-all cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>BACK</span>
        </button>
        {mediaTitle && (
          <span className="hidden sm:inline-block text-xs font-bold text-zinc-400 bg-black/50 px-3 py-1.5 rounded-full backdrop-blur-md border border-white/5">
            {mediaTitle} {type === 'tv' && `— S${currentSeason} E${currentEpisode}`}
          </span>
        )}
      </div>

      {/* Fullscreen Video Player */}
      <div className="w-full h-full relative">
        <iframe 
          src={embedUrl}
          title="VidLink Video Player"
          className="w-full h-full border-0"
          allowFullScreen
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        />
      </div>
    </div>
  );
}