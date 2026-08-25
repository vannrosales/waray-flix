import React from 'react';
import { Play, Film, Volume2, VolumeX, X } from 'lucide-react';

export default function TimelineHero({
  currentTimeline,
  activeBackdrop,
  activeTrailerKey,
  showVideo,
  isMuted,
  onToggleMute,
  onCloseVideo,
  onOpenVideo,
  onStartWatching,
  watchedCount
}) {
  return (
    <div className="relative h-[70vh] sm:h-[80vh] w-full overflow-hidden flex items-end select-none bg-black">
      {/* High-Resolution Photography Backdrop */}
      {activeBackdrop && (
        <img
          src={activeBackdrop}
          alt={currentTimeline.title}
          fetchPriority="high"
          decoding="async"
          className={`absolute inset-0 w-full h-full object-cover object-center transition-all duration-1000 ${
            showVideo && activeTrailerKey ? 'opacity-0 scale-105' : 'opacity-85 scale-100'
          }`}
        />
      )}

      {/* Interactive Autoplaying / Active Trailer */}
      {activeTrailerKey && showVideo && (
        <div className="absolute inset-0 w-full h-full overflow-hidden flex items-center justify-center animate-fade-in">
          <div className="absolute w-[320%] h-[320%] md:w-[150%] md:h-[150%]">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${activeTrailerKey}?autoplay=1&mute=${isMuted ? 1 : 0}&controls=1&rel=0&modestbranding=1`}
              title={currentTimeline.trailerTitle || 'Official Trailer'}
              className="w-full h-full object-cover border-0"
              allow="autoplay; encrypted-media"
              allowFullScreen
            />
          </div>

          {/* Sound & Close Video Control Deck */}
          <div className="absolute top-24 right-6 md:right-12 z-30 flex items-center gap-2">
            <button
              onClick={onToggleMute}
              className="w-10 h-10 rounded-xl bg-black/70 hover:bg-black text-white border border-white/20 backdrop-blur-md flex items-center justify-center transition cursor-pointer shadow-xl hover:scale-105"
              title={isMuted ? "Unmute Preview" : "Mute Preview"}
            >
              {isMuted ? <VolumeX className="w-4 h-4 stroke-[1.5]" /> : <Volume2 className="w-4 h-4 stroke-[1.5]" />}
            </button>

            <button
              onClick={onCloseVideo}
              className="px-3 py-2 rounded-xl bg-black/70 hover:bg-black text-white border border-white/20 backdrop-blur-md text-xs flex items-center gap-1.5 transition cursor-pointer shadow-xl"
              title="Exit Special Look"
            >
              <X className="w-4 h-4" />
              <span>Close Trailer</span>
            </button>
          </div>
        </div>
      )}

      {/* Cinema Vignettes fading into #000000 */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/30 pointer-events-none" />
      <div className="absolute inset-y-0 left-0 w-full md:w-3/5 bg-gradient-to-r from-[#000000]/95 via-black/60 to-transparent pointer-events-none" />
      <div className="absolute bottom-0 inset-x-0 h-14 bg-gradient-to-t from-[#000000] to-transparent pointer-events-none" />

      {/* Hero Content Section */}
      <div className="relative z-20 max-w-[1440px] w-full mx-auto px-6 md:px-12 pb-14 space-y-4">
        <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-300">
          <span className="px-2.5 py-0.5 rounded-xl border border-white/20 bg-white/10 backdrop-blur-md text-white font-bold text-[10px] tracking-wider uppercase shadow-sm">
            {currentTimeline.universe}
          </span>
          <span className="text-white font-semibold">15 CHAPTERS</span>
          <span>·</span>
          <span className="text-zinc-300 text-[11px] font-semibold">CHRONOLOGICAL CANON</span>
          <span>·</span>
          <span className="text-white font-bold">ROAD TO DOOMSDAY</span>
        </div>

        <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white max-w-3xl leading-[1.05] drop-shadow-lg">
          {currentTimeline.title}
        </h1>

        <p className="text-zinc-300 text-xs sm:text-sm line-clamp-2 max-w-2xl font-normal leading-relaxed drop-shadow-md">
          {currentTimeline.tagline} Follow the 15-chapter sequence in chronological storyline order and track your readiness for the collision with Doctor Doom.
        </p>

        <div className="pt-2 flex flex-wrap items-center gap-3.5">
          <button
            onClick={onStartWatching}
            className="px-7 py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-black font-semibold text-xs tracking-wider uppercase flex items-center gap-2 transition cursor-pointer shadow-xl hover:scale-105"
          >
            <Play className="w-3.5 h-3.5 stroke-[2] fill-black text-black" />
            <span>{watchedCount === 0 ? 'Start Timeline' : 'Continue Watching'}</span>
          </button>

          {activeTrailerKey && (
            <button
              onClick={onOpenVideo}
              className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-xs tracking-wider uppercase border border-white/20 backdrop-blur-md flex items-center gap-2 transition cursor-pointer shadow-md hover:scale-105"
            >
              <Film className="w-3.5 h-3.5 stroke-[1.5] text-white" />
              <span>Watch Special Look Trailer</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
