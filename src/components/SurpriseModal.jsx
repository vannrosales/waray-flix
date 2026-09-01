import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchRandomMediaByGenre, getImageUrl } from '../services/tmdb';
import { X, Play, Dices, Star, ArrowRight, Film, RefreshCw } from 'lucide-react';

const MOODS = [
  { 
    id: 'random', 
    label: 'Surprise Me', 
    movieGenres: 'all', 
    tvGenres: 'all', 
    desc: 'Any genre or masterpiece' 
  },
  { 
    id: 'mind_bending', 
    label: 'Mind-Bending', 
    movieGenres: '878,9648', 
    tvGenres: '10765,9648', // 10765 is Sci-Fi & Fantasy for TV
    desc: 'Sci-Fi & Psychological Mystery' 
  },
  { 
    id: 'adrenaline', 
    label: 'Adrenaline Rush', 
    movieGenres: '28,53', 
    tvGenres: '10759', // 10759 is Action & Adventure for TV
    desc: 'High-Octane Action & Thrillers' 
  },
  { 
    id: 'dark_gritty', 
    label: 'Dark & Gritty', 
    movieGenres: '80,27', 
    tvGenres: '80,9648', 
    desc: 'Crime Noir, Thriller & Horror' 
  },
  { 
    id: 'cozy_fun', 
    label: 'Cozy & Fun', 
    movieGenres: '35,16', 
    tvGenres: '35,16', // 35 Comedy, 16 Animation
    desc: 'Feel-Good Comedy & Animation' 
  },
  { 
    id: 'prestige', 
    label: 'Prestige Drama', 
    movieGenres: '18', 
    tvGenres: '18', 
    desc: 'Critically Acclaimed Masterpieces' 
  },
];

export default function SurpriseModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const [selectedMood, setSelectedMood] = useState(MOODS[0]);
  const [mediaType, setMediaType] = useState('movie');
  const [pickedMedia, setPickedMedia] = useState(null);
  const [isRolling, setIsRolling] = useState(false);

  const handleRoll = React.useCallback(async (mood = selectedMood, type = mediaType) => {
    setIsRolling(true);
    try {
      const genres = type === 'tv' ? mood.tvGenres : mood.movieGenres;
      const data = await fetchRandomMediaByGenre(genres, type);
      setTimeout(() => {
        setPickedMedia(data);
        setIsRolling(false);
      }, 350);
    } catch (err) {
      console.error("Roll failed:", err);
      setIsRolling(false);
    }
  }, [selectedMood, mediaType]);

  // Automatically roll on first open
  React.useEffect(() => {
    if (isOpen) {
      handleRoll(selectedMood, mediaType);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSelectMood = (mood) => {
    setSelectedMood(mood);
    handleRoll(mood, mediaType);
  };

  const handlePlayNow = () => {
    if (!pickedMedia) return;
    onClose();
    if (pickedMedia.media_type === 'tv') {
      navigate(`/watch/tv/${pickedMedia.id}/1/1`);
    } else {
      navigate(`/watch/movie/${pickedMedia.id}`);
    }
  };

  const handleFullDetails = () => {
    if (!pickedMedia) return;
    onClose();
    navigate(`/details/${pickedMedia.media_type || mediaType}/${pickedMedia.id}`);
  };

  const poster = pickedMedia ? (getImageUrl(pickedMedia.poster_path, 'posterSmall') || getImageUrl(pickedMedia.backdrop_path, 'backdropSmall')) : null;
  const releaseYear = pickedMedia?.release_date?.substring(0, 4) || pickedMedia?.first_air_date?.substring(0, 4) || '2026';

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in select-none"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-xl bg-[#18181C] border border-white/[0.12] rounded-3xl overflow-hidden shadow-2xl animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Outlined Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-40 p-2 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-zinc-400 hover:text-white border border-white/10 transition cursor-pointer"
          aria-label="Close"
        >
          <X className="w-4 h-4 stroke-[1.5]" />
        </button>

        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-white/[0.08] bg-[#141416] space-y-3">
          <div className="flex items-center gap-2 text-xs text-zinc-400 font-semibold">
            <Dices className="w-4 h-4 stroke-[2] text-white" />
            <span>Cinema Roulette & Mood Matcher</span>
          </div>

          {/* Mood Selector Chips */}
          <div className="flex flex-wrap gap-1.5">
            {MOODS.map((mood) => {
              const isSelected = selectedMood.id === mood.id;
              return (
                <button
                  key={mood.id}
                  onClick={() => handleSelectMood(mood)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition cursor-pointer ${
                    isSelected 
                      ? 'bg-white text-black font-bold shadow-sm' 
                      : 'bg-[#18181C] text-zinc-300 hover:text-white border border-white/10 hover:bg-[#222228]'
                  }`}
                >
                  {mood.label}
                </button>
              );
            })}
          </div>

          {/* Movie / TV Toggle */}
          <div className="flex items-center gap-2 pt-1 text-[11px] text-zinc-400">
            <span className="font-semibold">Format:</span>
            {['movie', 'tv'].map((t) => (
              <button
                key={t}
                onClick={() => {
                  setMediaType(t);
                  handleRoll(selectedMood, t);
                }}
                className={`px-2.5 py-0.5 rounded-full border transition uppercase text-[10px] cursor-pointer ${
                  mediaType === t 
                    ? 'border-white text-black bg-white font-bold' 
                    : 'border-white/10 text-zinc-400 hover:text-white'
                }`}
              >
                {t === 'movie' ? 'Film' : 'Series'}
              </button>
            ))}
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6">
          {isRolling ? (
            <div className="py-16 flex flex-col items-center justify-center text-center space-y-3">
              <RefreshCw className="w-6 h-6 stroke-[1.5] text-white animate-spin" />
              <p className="text-xs text-zinc-400">ROLLING THE ARCHIVES...</p>
            </div>
          ) : pickedMedia ? (
            <div className="space-y-5">
              
              {/* Media Card Showcase */}
              <div className="flex gap-4 items-start">
                <div className="w-28 sm:w-32 aspect-[2/3] rounded-2xl overflow-hidden bg-zinc-900 border border-white/10 flex-shrink-0 relative shadow-sm">
                  {poster ? (
                    <img src={poster} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-500">
                      <Film className="w-6 h-6 opacity-30 stroke-[1.5]" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-center gap-2 text-xs text-zinc-400">
                    <span className="text-white font-medium">{releaseYear}</span>
                    <span>·</span>
                    <span className="uppercase text-[10px] font-bold text-white">{pickedMedia.media_type || mediaType}</span>
                    {pickedMedia.vote_average > 0 && (
                      <>
                        <span>·</span>
                        <span className="flex items-center gap-1 text-white font-bold">
                          <Star className="w-3 h-3 text-white fill-white stroke-[1.5]" /> {pickedMedia.vote_average.toFixed(1)}
                        </span>
                      </>
                    )}
                  </div>

                  <h3 className="text-lg sm:text-xl font-bold text-white leading-tight">
                    {pickedMedia.title || pickedMedia.name}
                  </h3>

                  <p className="text-xs text-zinc-300 line-clamp-3 font-normal leading-relaxed">
                    {pickedMedia.overview || "No synopsis available for this selection."}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/[0.08]">
                <div className="flex items-center gap-2.5">
                  <button
                    onClick={handlePlayNow}
                    className="px-5 py-2 rounded-full bg-white hover:bg-zinc-200 text-black font-semibold text-xs uppercase tracking-wider flex items-center gap-2 transition cursor-pointer shadow-md hover:scale-105"
                  >
                    <Play className="w-3.5 h-3.5 stroke-[2] fill-black text-black" />
                    <span>Watch Now</span>
                  </button>

                  <button
                    onClick={() => handleRoll()}
                    className="px-4 py-2 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-white text-xs font-medium flex items-center gap-2 transition cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5 stroke-[1.5]" />
                    <span>Roll Again</span>
                  </button>
                </div>

                <button
                  onClick={handleFullDetails}
                  className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 group py-1 cursor-pointer transition font-medium"
                >
                  <span>Details</span>
                  <ArrowRight className="w-3.5 h-3.5 stroke-[1.5] group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

            </div>
          ) : (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center">
                <Dices className="w-6 h-6 stroke-[1.5] text-white" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-semibold text-white">Can't decide what to watch?</h4>
                <p className="text-xs text-zinc-400 font-normal max-w-sm">
                  Select a mood or tap Roll to let the cinema matrix pick a top-rated title for you.
                </p>
              </div>
              <button
                onClick={() => handleRoll()}
                className="px-6 py-2.5 rounded-full bg-white hover:bg-zinc-200 text-black font-semibold text-xs uppercase tracking-wider flex items-center gap-2 transition cursor-pointer shadow-md hover:scale-105"
              >
                <Dices className="w-4 h-4 stroke-[1.5]" />
                <span>Roll Film</span>
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
