import React from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { CONFIG } from '../config/siteConfig';
import { ArrowLeft } from 'lucide-react';

export default function WatchPage() {
  const { type, id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const season = searchParams.get('season') || 1;
  const episode = searchParams.get('episode') || 1;

  const embedUrl = type === 'movie'
    ? `${CONFIG.embedDomain}/embedded/movie/${id}`
    : `${CONFIG.embedDomain}/embedded/tv/${id}/${season}/${episode}`;

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
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