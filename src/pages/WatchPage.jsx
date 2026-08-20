import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CONFIG } from '../config/siteConfig';
import { ArrowLeft } from 'lucide-react';

export default function WatchPage() {
  const { type, id, season, episode } = useParams();
  const navigate = useNavigate();

  
  const currentSeason = season || 1;
  const currentEpisode = episode || 1;

  const embedUrl = type === 'movie'
    ? `${CONFIG.embedDomain}/embedded/movie/${id}`
    : `${CONFIG.embedDomain}/embedded/tv/${id}/${currentSeason}/${currentEpisode}`;

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      {/* Floating Back Control Button */}
      <div className="absolute top-6 left-6 z-50">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#1D2128]/80 hover:bg-[#1D2128] text-xs font-mono text-zinc-300 hover:text-white border border-white/10 backdrop-blur-md transition-all"
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