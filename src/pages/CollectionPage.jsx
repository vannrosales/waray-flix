import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchCollectionDetails, getImageUrl } from '../services/tmdb';
import { ArrowLeft, Play, Star, Film, Layers } from 'lucide-react';
import useDocumentTitle from '../hooks/useDocumentTitle';
import QuickViewModal from '../components/QuickViewModal';
import PageLoader from '../components/common/PageLoader';

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
    <div className="min-h-screen bg-[#000000] text-[#FFFFFF] pb-24 select-none">
      
      {/* Return Back Button */}
      <div className="fixed top-20 sm:top-24 left-6 z-40">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/70 hover:bg-black text-xs font-mono text-white border border-white/20 backdrop-blur-xl transition cursor-pointer shadow-md"
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
            className="absolute inset-0 w-full h-full object-cover object-center brightness-[0.7]" 
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F0F12] via-[#0F0F12]/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0F0F12]/95 via-[#0F0F12]/60 to-transparent" />
      </div>

      {/* Main Content Info Container */}
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 -mt-20 sm:-mt-28 relative z-30 space-y-12">
        
        {/* Top Info Deck with Floating Poster */}
        <div className="flex flex-col md:flex-row gap-8 items-start">
          
          {/* Floating Poster Card */}
          <div className="w-44 sm:w-56 md:w-60 flex-shrink-0 aspect-[2/3] rounded-3xl overflow-hidden bg-[#18181C] border border-white/10 shadow-2xl relative hidden sm:block">
            {poster ? (
              <img src={poster} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-zinc-500">
                <Film className="w-8 h-8 opacity-30 stroke-[1.5]" />
              </div>
            )}
          </div>

          {/* Metadata & Actions */}
          <div className="flex-1 space-y-4">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-400 font-mono">
                <span className="px-2.5 py-0.5 rounded-full bg-white text-black uppercase text-[10px] font-bold">
                  Franchise Collection
                </span>
                <span className="text-white font-semibold">{parts.length} Films</span>
                {averageRating && (
                  <>
                    <span>·</span>
                    <span className="flex items-center gap-1 text-white font-bold">
                      <Star className="w-3 h-3 text-white fill-white stroke-[1.5]" /> Avg {averageRating}
                    </span>
                  </>
                )}
              </div>

              <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white leading-[1.05]">
                {collection.name}
              </h1>
            </div>

            {/* Actions */}
            {firstPart && (
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button 
                  onClick={() => navigate(`/watch/movie/${firstPart.id}`)}
                  className="px-7 py-2.5 rounded-full bg-white hover:bg-zinc-200 text-black font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition cursor-pointer shadow-md hover:scale-105"
                >
                  <Play className="w-3.5 h-3.5 stroke-[2] fill-black text-black" />
                  <span>Start Series (Part 1)</span>
                </button>
              </div>
            )}

            {/* Overview */}
            {collection.overview && (
              <div className="space-y-1.5 pt-2 border-t border-white/[0.08]">
                <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest font-bold">ABOUT THE SAGA</span>
                <p className="text-zinc-300 text-xs sm:text-sm leading-relaxed max-w-3xl font-normal">
                  {collection.overview}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Chronological Parts Grid */}
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-white stroke-[1.5]" />
            <h2 className="text-lg sm:text-xl font-bold text-white">
              Chronological Release Sequence ({parts.length})
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5 sm:gap-4">
            {parts.map((item, index) => {
              const partPoster = getImageUrl(item.poster_path, 'posterSmall') || getImageUrl(item.backdrop_path, 'backdropSmall');
              const releaseYear = (item.release_date || '').substring(0, 4);

              return (
                <div
                  key={item.id}
                  onClick={() => navigate(`/details/movie/${item.id}`)}
                  className="cursor-pointer group/item flex flex-col gap-2 flex-shrink-0 transition-all duration-200"
                >
                  {/* Poster Card */}
                  <div className="relative aspect-[2/3] w-full rounded-2xl overflow-hidden bg-[#18181C] border border-white/[0.06] group-hover/item:border-white/40 transition-all duration-200 group-hover/item:scale-[1.02] shadow-sm hover:shadow-md">
                    {partPoster ? (
                      <img 
                        src={partPoster} 
                        alt={item.title} 
                        loading="lazy"
                        className="w-full h-full object-cover transition duration-300 group-hover/item:brightness-105" 
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-3 text-center text-zinc-500 bg-[#18181C] text-xs">
                        <Film className="w-6 h-6 opacity-30 stroke-[1.5]" />
                      </div>
                    )}

                    {/* Part Number Badge */}
                    <div className="absolute top-2 left-2 z-20">
                      <span className="px-2 py-0.5 rounded-md bg-black/90 text-white font-mono text-[10px] font-bold tracking-wider shadow-sm border border-white/10">
                        Part {index + 1}
                      </span>
                    </div>

                    {/* Rating Badge */}
                    {item.vote_average > 0 && (
                      <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-md px-2 py-0.5 rounded-md flex items-center gap-1 border border-white/20 z-20 shadow-sm text-white">
                        <Star className="w-2.5 h-2.5 text-white fill-white stroke-[1.5]" />
                        <span className="text-[10px] font-mono font-bold text-white">{item.vote_average.toFixed(1)}</span>
                      </div>
                    )}
                  </div>

                  {/* Title & Date */}
                  <div className="space-y-0.5 px-0.5">
                    <h3 className="text-xs font-semibold text-white line-clamp-1 group-hover/item:text-zinc-300 transition">
                      {item.title}
                    </h3>
                    <div className="flex items-center gap-2 text-[10px] text-zinc-400 font-mono">
                      <span>{releaseYear || '—'}</span>
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
