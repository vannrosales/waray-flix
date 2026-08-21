import React, { useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { CONFIG } from '../config/siteConfig';
import { ArrowLeft } from 'lucide-react';

export default function WatchPage() {
  const { type, id, season, episode } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const startMinute = searchParams.get('t'); // e.g. "45"

  const currentSeason = season || 1;
  const currentEpisode = episode || 1;

  // Append time parameter if supported by your embed provider (e.g., ?t=45m or #t=45m)
  let embedUrl = type === 'movie'
    ? `${CONFIG.embedDomain}/embedded/movie/${id}`
    : `${CONFIG.embedDomain}/embedded/tv/${id}/${currentSeason}/${currentEpisode}`;

  // If a timestamp parameter exists, append it to the iframe URL
  if (startMinute) {
    embedUrl += `?t=${startMinute}m`; // Adjust format (e.g. `?t=${startMinute}m` or `?start=${startMinute}`) depending on your embed provider's syntax
  }

  // Automatically record progress to localStorage when viewing
  useEffect(() => {
    async function saveProgress() {
      try {
        const res = await fetch(`https://api.themoviedb.org/3/${type}/${id}?api_key=${CONFIG.tmdbApiKey}`);
        const data = await res.json();

        const historyItem = {
          id: data.id,
          title: data.title || data.name,
          poster_path: data.poster_path,
          media_type: type,
          lastWatchedMinute: startMinute ? parseInt(startMinute) : 45, // Captures current or default mock mark
          updatedAt: Date.now()
        };

        const existingHistory = JSON.parse(localStorage.getItem('warayflix_watch_history') || '[]');
        const filtered = existingHistory.filter(item => item.id.toString() !== id.toString());
        localStorage.setItem('warayflix_watch_history', JSON.stringify([historyItem, ...filtered]));
      } catch (err) {
        console.error('Failed to save progress:', err);
      }
    }
    saveProgress();
  }, [type, id, startMinute]);

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      <div className="absolute top-6 left-6 z-50">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#1D2128]/80 hover:bg-[#1D2128] text-xs font-mono text-zinc-300 hover:text-white border border-white/10 backdrop-blur-md transition-all cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>BACK</span>
        </button>
      </div>

      <div className="w-full h-full relative">
        <iframe 
          src={embedUrl}
          title="Video Player"
          className="w-full h-full border-0"
          allowFullScreen
        />
      </div>
    </div>
  );
}