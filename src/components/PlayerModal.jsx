import React from 'react';
import { CONFIG } from '../config/siteConfig';
import { X } from 'lucide-react';

export default function PlayerModal({ activeMedia, onClose }) {
  if (!activeMedia) return null;

  const player = CONFIG.players[0];
  const embedUrl = activeMedia.type === 'movie'
    ? player.getMovieUrl(activeMedia.id)
    : player.getTvUrl(activeMedia.id, activeMedia.season || 1, activeMedia.episode || 1);

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center animate-fade-in">
      <button 
        onClick={onClose}
        className="absolute top-6 right-6 text-zinc-400 hover:text-white z-50 bg-black/70 hover:bg-black p-2 rounded-full border border-white/10 backdrop-blur-md transition cursor-pointer"
        aria-label="Close"
      >
        <X className="w-5 h-5 stroke-[1.5]" />
      </button>
      
      <div className="w-full h-full relative">
        <iframe 
          src={embedUrl}
          title={activeMedia.title || "Video Player"}
          className="w-full h-full border-0"
          allowFullScreen
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        />
      </div>
    </div>
  );
}
