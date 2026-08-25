import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Volume2, VolumeX } from 'lucide-react';

export default function DetailHeroVisual({
  backdrop,
  trailerKey,
  showVideo,
  isMuted,
  onToggleMute
}) {
  const navigate = useNavigate();

  return (
    <>
      {/* Return Back Button */}
      <div className="fixed top-20 sm:top-24 left-6 z-40">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/70 hover:bg-black text-xs font-mono text-white border border-white/20 backdrop-blur-xl transition cursor-pointer shadow-lg hover:scale-105"
        >
          <ArrowLeft className="w-3.5 h-3.5 stroke-[1.5]" />
          <span>BACK</span>
        </button>
      </div>

      {/* Hero Visual Area with Trailer / Backdrop */}
      <div className="relative h-[45vh] sm:h-[55vh] lg:h-[65vh] w-full overflow-hidden flex items-end bg-black">
        {backdrop && (
          <img 
            src={backdrop} 
            alt="" 
            fetchPriority="high"
            className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-1000 ${
              showVideo && trailerKey ? 'opacity-0' : 'opacity-90'
            }`}
          />
        )}

        {trailerKey && (
          <div className={`absolute inset-0 w-full h-full pointer-events-none overflow-hidden flex items-center justify-center transition-opacity duration-1000 ${
            showVideo ? 'opacity-100' : 'opacity-0'
          }`}>
            <div className="absolute w-[300%] h-[300%] md:w-[150%] md:h-[150%]">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${trailerKey}?autoplay=1&mute=${isMuted ? 1 : 0}&controls=0&loop=1&playlist=${trailerKey}&rel=0&iv_load_policy=3&disablekb=1&modestbranding=1`}
                title="Detail Trailer"
                className="w-full h-full object-cover border-0"
                allow="autoplay"
              />
            </div>
          </div>
        )}

        {/* Cinema Vignette Overlays fading into #000000 */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />
        <div className="absolute bottom-0 inset-x-0 h-28 bg-gradient-to-t from-[#000000] via-[#000000]/70 to-transparent pointer-events-none" />

        {/* Sound toggle button */}
        {showVideo && trailerKey && (
          <div className="absolute bottom-6 right-6 md:right-12 z-30 animate-fade-in">
            <button
              onClick={onToggleMute}
              className="w-10 h-10 rounded-full bg-black/70 hover:bg-black text-white border border-white/20 backdrop-blur-md flex items-center justify-center transition cursor-pointer shadow-xl hover:scale-105"
              title={isMuted ? "Unmute Preview" : "Mute Preview"}
            >
              {isMuted ? <VolumeX className="w-4 h-4 stroke-[1.5]" /> : <Volume2 className="w-4 h-4 stroke-[1.5]" />}
            </button>
          </div>
        )}
      </div>
    </>
  );
}
