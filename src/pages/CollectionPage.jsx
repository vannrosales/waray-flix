import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchCollectionDetails, getImageUrl } from '../services/tmdb';
import { ArrowLeft, Play, Star, Film, Layers } from 'lucide-react';
import useDocumentTitle from '../hooks/useDocumentTitle';
import QuickViewModal from '../components/QuickViewModal';

export default function CollectionPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [collection, setCollection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quickMedia, setQuickMedia] = useState(null);

  useDocumentTitle(collection ? `${collection.name} — WarayFlix` : 'Franchise Collection');

  useEffect(() => {
    async function loadCollection() {
      try {
        setLoading(true);
        const data = await fetchCollectionDetails(id);
        setCollection(data);
      } catch (err) {
        console.error("Failed to load collection:", err);
      } finally {
        setLoading(false);
      }
    }
    loadCollection();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#090A0F] flex items-center justify-center text-zinc-600 font-mono text-xs">
        LOADING_FRANCHISE_COLLECTION...
      </div>
    );
  }

  if (!collection) return null;

  const backdrop = getImageUrl(collection.backdrop_path, 'backdrop') || getImageUrl(collection.poster_path, 'poster');
  const poster = getImageUrl(collection.poster_path, 'poster');
  
  // Sort parts chronologically by release date
  const parts = (collection.parts || []).sort((a, b) => {
    const dateA = a.release_date || '9999';
    const dateB = b.release_date || '9999';
    return dateA.localeCompare(dateB);
  });

  const firstPart = parts[0];

  const averageRating = parts.length > 0
    ? (parts.reduce((acc, p) => acc + (p.vote_average || 0), 0) / parts.length).toFixed(1)
    : null;

  return (
    <div className="min-h-screen bg-[#090A0F] text-[#EDEDED] pb-24">
      
      {/* Return Back Button */}
      <div className="fixed top-20 sm:top-24 left-6 z-40">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/60 hover:bg-black text-xs font-mono text-zinc-400 hover:text-white border border-white/10 backdrop-blur-xl transition cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5 stroke-[1.5]" />
          <span>BACK</span>
        </button>
      </div>

      {/* Hero Visual Area */}
      <div className="relative h-[45vh] sm:h-[55vh] lg:h-[65vh] w-full overflow-hidden flex items-end">
        {backdrop && (
          <img 
            src={backdrop} 
            alt={collection.name} 
            fetchPriority="high"
            className="absolute inset-0 w-full h-full object-cover object-center opacity-35"
          />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-[#090A0F] via-[#090A0F]/50 to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#090A0F]/90 via-[#090A0F]/30 to-transparent pointer-events-none" />
      </div>

      {/* Main Content Container */}
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 -mt-20 sm:-mt-32 relative z-30 space-y-12">
        
        {/* Top Header Deck with Poster */}
        <div className="flex flex-col md:flex-row gap-8 items-start">
          
          {/* Floating Poster Card */}
          <div className="w-44 sm:w-56 md:w-60 flex-shrink-0 aspect-[2/3] rounded-2xl overflow-hidden bg-[#11131A] border border-white/10 shadow-2xl relative hidden sm:block">
            {poster ? (
              <img src={poster} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-zinc-600">
                <Film className="w-8 h-8 opacity-30 stroke-[1.5]" />
              </div>
            )}
          </div>

          {/* Metadata & Actions */}
          <div className="flex-1 space-y-5">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-400 font-mono">
                <span className="px-2.5 py-0.5 rounded border border-white/15 bg-black/70 backdrop-blur-md text-white font-medium uppercase tracking-wider text-[10px]">
                  Franchise Hub
                </span>
                <span className="text-zinc-200">{parts.length} Installments</span>
                {averageRating && (
                  <>
                    <span>·</span>
                    <span className="flex items-center gap-1 text-zinc-200">
                      <Star className="w-3 h-3 text-zinc-400 stroke-[1.5]" /> {averageRating} Avg Rating
                    </span>
                  </>
                )}
              </div>

              <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white font-['Outfit'] leading-[1.05]">
                {collection.name}
              </h1>
            </div>

            {/* Actions */}
            {firstPart && (
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button 
                  onClick={() => navigate(`/watch/movie/${firstPart.id}`)}
                  className="px-7 py-2.5 rounded-full bg-white hover:bg-zinc-200 text-black font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition cursor-pointer shadow-lg"
                >
                  <Play className="w-3.5 h-3.5 stroke-[2] text-black" />
                  <span>Start Marathon (Part 1)</span>
                </button>
              </div>
            )}

            {/* Synopsis */}
            {collection.overview && (
              <div className="space-y-1.5 pt-3 border-t border-white/[0.06]">
                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">FRANCHISE OVERVIEW</span>
                <p className="text-zinc-300 text-sm leading-relaxed font-light max-w-3xl">
                  {collection.overview}
                </p>
              </div>
            )}

          </div>
        </div>

        {/* Chronological Timeline Grid */}
        <div className="space-y-5 pt-6 border-t border-white/[0.06]">
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 uppercase tracking-wider">
            <Layers className="w-3.5 h-3.5 stroke-[1.5]" />
            <span>Chronological Timeline ({parts.length} Movies)</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {parts.map((movie, index) => {
              const movieBackdrop = getImageUrl(movie.backdrop_path, 'backdropSmall') || getImageUrl(movie.poster_path, 'posterSmall');
              const year = movie.release_date?.substring(0, 4) || '—';

              return (
                <div
                  key={movie.id}
                  onClick={() => navigate(`/details/movie/${movie.id}`)}
                  className="group flex gap-4 p-3 rounded-2xl bg-[#11131A] hover:bg-[#161922] border border-white/[0.06] hover:border-white/20 transition cursor-pointer"
                >
                  {/* Thumbnail */}
                  <div className="w-28 sm:w-36 aspect-video rounded-xl bg-black overflow-hidden flex-shrink-0 relative">
                    {movieBackdrop ? (
                      <img 
                        src={movieBackdrop} 
                        alt={movie.title} 
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-600">
                        <Film className="w-5 h-5 stroke-[1.5]" />
                      </div>
                    )}
                    <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-black/80 backdrop-blur-md text-[9px] font-mono text-zinc-300 border border-white/10">
                      PART {index + 1}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-400">
                      <span className="text-zinc-200">{year}</span>
                      {movie.vote_average > 0 && (
                        <>
                          <span>·</span>
                          <span className="flex items-center gap-0.5 text-zinc-200">
                            <Star className="w-2.5 h-2.5 text-zinc-400 stroke-[1.5]" /> {movie.vote_average.toFixed(1)}
                          </span>
                        </>
                      )}
                    </div>

                    <h3 className="text-sm font-semibold text-white group-hover:text-zinc-200 transition truncate">
                      {movie.title}
                    </h3>

                    <p className="text-[11px] text-zinc-400 line-clamp-2 font-light leading-relaxed">
                      {movie.overview || "Stream this installment."}
                    </p>

                    <div className="pt-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/watch/movie/${movie.id}`);
                        }}
                        className="inline-flex items-center gap-1.5 text-[10px] font-mono text-zinc-300 group-hover:text-white uppercase tracking-wider py-0.5"
                      >
                        <Play className="w-2.5 h-2.5 stroke-[2]" />
                        <span>Watch Now</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {quickMedia && (
        <QuickViewModal
          media={quickMedia}
          type="movie"
          isOpen={Boolean(quickMedia)}
          onClose={() => setQuickMedia(null)}
        />
      )}
    </div>
  );
}
