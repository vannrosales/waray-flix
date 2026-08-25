import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchCollectionDetails, getImageUrl } from '../services/tmdb';
import { ArrowLeft, Play, Star, Film, Layers } from 'lucide-react';
import useDocumentTitle from '../hooks/useDocumentTitle';
import QuickViewModal from '../components/QuickViewModal';
import PageLoader from '../components/common/PageLoader';
import { getReleaseYear, formatRating } from '../utils/formatters';

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
    return <PageLoader text="LOADING_FRANCHISE_COLLECTION..." />;
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
    <div className="min-h-screen bg-[#FAFAFA] text-[#09090B] pb-24 select-none">
      
      {/* Return Back Button */}
      <div className="fixed top-20 sm:top-24 left-6 z-40">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 hover:bg-white text-xs font-mono text-[#09090B] border border-black/10 backdrop-blur-xl transition cursor-pointer shadow-md"
        >
          <ArrowLeft className="w-3.5 h-3.5 stroke-[1.5]" />
          <span>BACK</span>
        </button>
      </div>

      {/* Hero Backdrop Banner */}
      <div className="relative h-[48vh] sm:h-[55vh] w-full overflow-hidden flex items-end bg-black">
        {backdrop && (
          <img 
            src={backdrop} 
            alt="" 
            className="absolute inset-0 w-full h-full object-cover object-center brightness-[0.75]" 
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#FAFAFA] via-[#FAFAFA]/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#FAFAFA]/95 via-[#FAFAFA]/60 to-transparent" />
      </div>

      {/* Main Content Info Container */}
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 -mt-20 sm:-mt-28 relative z-30 space-y-12">
        
        {/* Top Info Deck with Floating Poster */}
        <div className="flex flex-col md:flex-row gap-8 items-start">
          
          {/* Floating Poster Card */}
          <div className="w-44 sm:w-56 md:w-60 flex-shrink-0 aspect-[2/3] rounded-3xl overflow-hidden bg-white border border-black/10 shadow-2xl relative hidden sm:block">
            {poster ? (
              <img src={poster} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-zinc-400">
                <Film className="w-8 h-8 opacity-30 stroke-[1.5]" />
              </div>
            )}
          </div>

          {/* Metadata & Actions */}
          <div className="flex-1 space-y-4">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-3 text-xs text-[#52525B] font-mono">
                <span className="px-2.5 py-0.5 rounded-full bg-[#09090B] text-white uppercase text-[10px] font-bold">
                  Franchise Collection
                </span>
                <span className="text-[#09090B] font-semibold">{parts.length} Films</span>
                {averageRating && (
                  <>
                    <span>·</span>
                    <span className="flex items-center gap-1 text-[#09090B] font-bold">
                      <Star className="w-3 h-3 text-[#2563EB] fill-[#2563EB] stroke-[1.5]" /> Avg {averageRating}
                    </span>
                  </>
                )}
              </div>

              <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#09090B] font-['Outfit'] leading-[1.05]">
                {collection.name}
              </h1>
            </div>

            {/* Actions */}
            {firstPart && (
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button 
                  onClick={() => navigate(`/watch/movie/${firstPart.id}`)}
                  className="px-7 py-2.5 rounded-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition cursor-pointer shadow-md hover:scale-105"
                >
                  <Play className="w-3.5 h-3.5 stroke-[2] fill-white text-white" />
                  <span>Start Series (Part 1)</span>
                </button>
              </div>
            )}

            {/* Overview */}
            {collection.overview && (
              <div className="space-y-1.5 pt-2 border-t border-black/[0.08]">
                <span className="text-[10px] font-mono text-[#52525B] uppercase tracking-widest font-bold">ABOUT THE SAGA</span>
                <p className="text-[#52525B] text-xs sm:text-sm leading-relaxed max-w-3xl font-normal">
                  {collection.overview}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Chronological Film List */}
        <div className="space-y-6 pt-4 border-t border-black/[0.08]">
          <div className="flex items-center gap-2 text-xs font-mono text-[#52525B] uppercase tracking-wider font-semibold">
            <Layers className="w-4 h-4 stroke-[1.5] text-[#2563EB]" />
            <span>Chronological Order ({parts.length} Films)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {parts.map((part, index) => {
              const partPoster = getImageUrl(part.poster_path, 'posterSmall') || getImageUrl(part.backdrop_path, 'backdropSmall');
              const year = part.release_date?.substring(0, 4) || 'TBA';

              return (
                <div
                  key={part.id}
                  onClick={() => navigate(`/details/movie/${part.id}`)}
                  className="group relative flex gap-3.5 p-3 rounded-2xl bg-white hover:bg-zinc-50 border border-black/[0.06] hover:border-[#2563EB]/40 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md"
                >
                  {/* Thumbnail */}
                  <div className="relative w-20 aspect-[2/3] rounded-xl overflow-hidden bg-zinc-100 flex-shrink-0 border border-black/10">
                    {partPoster ? (
                      <img src={partPoster} alt="" className="w-full h-full object-cover group-hover:scale-105 transition" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-400 text-xs">
                        <Film className="w-5 h-5 opacity-30 stroke-[1.5]" />
                      </div>
                    )}
                    <div className="absolute top-1.5 left-1.5 bg-[#09090B] text-white px-1.5 py-0.5 rounded text-[9px] font-mono font-bold">
                      #{index + 1}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[10px] font-mono text-[#52525B]">
                        <span>{year}</span>
                        {part.vote_average > 0 && (
                          <span className="flex items-center gap-0.5 text-[#09090B] font-bold">
                            <Star className="w-2.5 h-2.5 text-[#2563EB] fill-[#2563EB] stroke-[1.5]" />
                            {part.vote_average.toFixed(1)}
                          </span>
                        )}
                      </div>
                      <h3 className="text-xs sm:text-sm font-semibold text-[#09090B] group-hover:text-[#2563EB] transition line-clamp-2 leading-tight">
                        {part.title}
                      </h3>
                      <p className="text-[11px] text-[#52525B] line-clamp-2 font-normal">
                        {part.overview || "Stream this franchise installment now."}
                      </p>
                    </div>

                    <div className="pt-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/watch/movie/${part.id}`);
                        }}
                        className="w-full py-1.5 px-3 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-[10px] font-semibold font-mono uppercase tracking-wider flex items-center justify-center gap-1.5 transition shadow-sm"
                      >
                        <Play className="w-3 h-3 stroke-[2] fill-white" />
                        <span>Watch Part {index + 1}</span>
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
