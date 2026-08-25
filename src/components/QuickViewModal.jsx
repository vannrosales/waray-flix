import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getImageUrl, fetchMediaVideos, fetchMediaDetails } from '../services/tmdb';
import { storageService } from '../services/storageService';
import { Play, X, Star, Clock, Bookmark, ArrowRight, Volume2, VolumeX, Film } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function QuickViewModal({ media, type = 'movie', isOpen, onClose }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [details, setDetails] = useState(null);
  const [trailerKey, setTrailerKey] = useState(null);
  const [isMuted, setIsMuted] = useState(true);
  const [isSaved, setIsSaved] = useState(false);

  const mediaType = media?.media_type || type || (media?.first_air_date ? 'tv' : 'movie');
  const mediaId = media?.id;

  useEffect(() => {
    if (!isOpen || !mediaId) return;

    let isMounted = true;
    setIsSaved(storageService.isInPlaylist(mediaId));

    async function loadQuickData() {
      try {
        const [detailData, videos] = await Promise.all([
          fetchMediaDetails(mediaId, mediaType),
          fetchMediaVideos(mediaId, mediaType)
        ]);

        if (!isMounted) return;
        setDetails(detailData);

        let trailer = (videos || []).find(v => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser')) || videos?.[0];
        if (String(mediaId) === '969681' || media?.trailerKey) {
          trailer = { key: media?.trailerKey || 'P3uI5sLosKU' };
        }

        if (trailer?.key) {
          setTrailerKey(trailer.key);
        } else {
          setTrailerKey(null);
        }
      } catch (err) {
        console.error("QuickView load error:", err);
      }
    }

    loadQuickData();

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      isMounted = false;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, mediaId, mediaType, onClose]);

  if (!isOpen || !media) return null;

  const currentData = details || media;
  const backdropUrl = getImageUrl(currentData.backdrop_path, 'backdrop') || getImageUrl(currentData.poster_path, 'poster');
  const releaseYear = currentData.release_date?.substring(0, 4) || currentData.first_air_date?.substring(0, 4) || '2026';
  const runtime = currentData.runtime || (currentData.episode_run_time ? currentData.episode_run_time[0] : null);

  const handleToggleList = (e) => {
    e.stopPropagation();
    storageService.togglePlaylistItem({ ...currentData, media_type: mediaType }, user?.id);
    setIsSaved(!isSaved);
  };

  const handlePlayNow = () => {
    onClose();
    if (mediaType === 'tv') {
      navigate(`/watch/tv/${mediaId}/1/1`);
    } else {
      navigate(`/watch/movie/${mediaId}`);
    }
  };

  const handleFullDetails = () => {
    onClose();
    navigate(`/details/${mediaType}/${mediaId}`);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in select-none"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-2xl bg-[#18181C] border border-white/[0.12] rounded-3xl overflow-hidden shadow-2xl animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Outlined Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-40 p-2 rounded-full bg-black/70 hover:bg-black text-white border border-white/20 backdrop-blur-md transition cursor-pointer shadow-sm"
          aria-label="Close modal"
        >
          <X className="w-4 h-4 stroke-[1.5]" />
        </button>

        {/* Video / Backdrop Area */}
        <div className="relative h-60 sm:h-72 w-full bg-black overflow-hidden flex items-center justify-center">
          {trailerKey ? (
            <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden">
              <div className="absolute w-[200%] h-[200%] -left-[50%] -top-[50%]">
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${trailerKey}?autoplay=1&mute=${isMuted ? 1 : 0}&controls=0&loop=1&playlist=${trailerKey}&rel=0&iv_load_policy=3&disablekb=1&modestbranding=1`}
                  title="Trailer"
                  className="w-full h-full object-cover border-0"
                  allow="autoplay"
                />
              </div>
            </div>
          ) : backdropUrl ? (
            <img 
              src={backdropUrl} 
              alt="" 
              className="w-full h-full object-cover object-center opacity-60"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-zinc-500 gap-2">
              <Film className="w-8 h-8 opacity-30 stroke-[1.5]" />
              <span className="text-[10px] font-mono">PREVIEW UNAVAILABLE</span>
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-[#18181C] via-black/40 to-transparent pointer-events-none" />

          {/* Sound Toggle */}
          {trailerKey && (
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="absolute bottom-4 right-4 z-30 p-2 rounded-full bg-black/70 hover:bg-black text-white border border-white/20 backdrop-blur-md transition cursor-pointer shadow-sm"
              title={isMuted ? "Unmute Preview" : "Mute Preview"}
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5 stroke-[1.5]" /> : <Volume2 className="w-3.5 h-3.5 stroke-[1.5]" />}
            </button>
          )}

          {/* Type Badge */}
          <div className="absolute top-4 left-4 z-20">
            <span className="px-2.5 py-0.5 rounded-full bg-white text-black text-[10px] font-mono uppercase tracking-wider font-semibold shadow-sm">
              {mediaType}
            </span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-7 space-y-5">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-400 font-mono">
              <span className="text-white font-medium">{releaseYear}</span>
              <span>·</span>
              {currentData.vote_average > 0 && (
                <>
                  <span className="flex items-center gap-1 text-white font-bold">
                    <Star className="w-3 h-3 text-white fill-white stroke-[1.5]" /> {currentData.vote_average.toFixed(1)}
                  </span>
                  <span>·</span>
                </>
              )}
              {runtime && (
                <span className="flex items-center gap-1 text-zinc-400">
                  <Clock className="w-3 h-3 stroke-[1.5]" /> {runtime}m
                </span>
              )}
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              {currentData.title || currentData.name}
            </h2>

            {/* Genre tags */}
            {currentData.genres && currentData.genres.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {currentData.genres.slice(0, 4).map((g) => (
                  <span key={g.id} className="px-2.5 py-0.5 rounded-full bg-white/[0.06] border border-white/[0.08] text-[10px] font-mono text-zinc-300">
                    {g.name}
                  </span>
                ))}
              </div>
            )}
          </div>

          <p className="text-zinc-300 text-xs sm:text-sm leading-relaxed line-clamp-3 font-normal">
            {currentData.overview || "No synopsis available for this selection."}
          </p>

          {/* Cast */}
          {details?.credits?.cast && details.credits.cast.length > 0 && (
            <div className="text-xs text-zinc-400 space-x-1 font-mono">
              <span className="text-white font-bold uppercase text-[10px]">Cast:</span>
              <span className="text-zinc-300 text-[11px]">
                {details.credits.cast.slice(0, 4).map(c => c.name).join(', ')}
              </span>
            </div>
          )}

          {/* Action Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/[0.08]">
            <div className="flex items-center gap-3">
              <button
                onClick={handlePlayNow}
                className="px-6 py-2 rounded-full bg-white hover:bg-zinc-200 text-black font-semibold text-xs uppercase tracking-wider flex items-center gap-2 transition cursor-pointer shadow-md hover:scale-105"
              >
                <Play className="w-3.5 h-3.5 stroke-[2] fill-black text-black" />
                <span>Watch Now</span>
              </button>

              <button
                onClick={handleToggleList}
                className={`px-4 py-2 rounded-full border text-xs font-medium uppercase tracking-wider flex items-center gap-2 transition cursor-pointer ${
                  isSaved 
                    ? 'bg-white border-white text-black font-bold' 
                    : 'bg-white/[0.06] border-white/10 text-zinc-300 hover:text-white hover:bg-white/[0.12]'
                }`}
              >
                <Bookmark className="w-3.5 h-3.5 stroke-[1.5]" />
                <span>{isSaved ? 'In Watchlist' : 'Save'}</span>
              </button>
            </div>

            <button
              onClick={handleFullDetails}
              className="text-xs text-zinc-400 hover:text-white flex items-center gap-1.5 font-mono group py-1.5 cursor-pointer transition font-medium"
            >
              <span>Full Details</span>
              <ArrowRight className="w-3.5 h-3.5 stroke-[1.5] group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
