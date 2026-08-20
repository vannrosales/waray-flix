import React from 'react';
import { CONFIG } from '../config/siteConfig';
import { X } from 'lucide-react';

export default function PlayerModal({ activeMedia, onClose }) {
  if (!activeMedia) return null;

  // Build the embed source according to exact specifications
  const embedUrl = activeMedia.type === 'movie'
    ? `${CONFIG.embedDomain}/embedded/movie/${activeMedia.id}`
    : `${CONFIG.embedDomain}/embedded/tv/${activeMedia.id}/${activeMedia.season || 1}/${activeMedia.episode || 1}`;

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center animate-fade-in">
      <button 
        onClick={onClose}
        className="absolute top-6 right-6 text-zinc-400 hover:text-white z-50 bg-zinc-900/80 hover:bg-zinc-800 p-2.5 rounded-full border border-zinc-700 transition"
      >
        <X className="w-6 h-6" />
      </button>
      
      <div className="w-full h-full relative">
        <iframe 
          src={embedUrl}
          title={activeMedia.title || "Video Player"}
          className="w-full h-full border-0"
          allowFullScreen
        />
      </div>
    </div>
  );
}