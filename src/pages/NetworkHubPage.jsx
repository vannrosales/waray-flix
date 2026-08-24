import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchMediaByProvider, fetchMediaByCompany, getImageUrl } from '../services/tmdb';
import { ArrowLeft, Film, Star, ChevronDown, Play, Layers } from 'lucide-react';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { STUDIOS_LIST } from '../constants/studios';
import QuickViewModal from '../components/QuickViewModal';

export default function NetworkHubPage() {
  const { networkName, id } = useParams();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [quickMedia, setQuickMedia] = useState(null);

  const currentStudio = STUDIOS_LIST.find(s => String(s.code) === String(id) || s.name.toLowerCase().replace(/[^a-z0-9]/g, '') === networkName?.toLowerCase());
  const displayName = currentStudio?.name || (networkName ? networkName.toUpperCase() : 'Studio Hub');

  useDocumentTitle(`${displayName} — WarayFlix`);

  useEffect(() => {
    async function loadNetworkMedia() {
      try {
        setLoading(true);
        setPage(1);
        let data = { results: [], total_pages: 1 };
        
        if (currentStudio?.type === 'company') {
          const res = await fetchMediaByCompany(id, 1);
          data = { results: res || [], total_pages: 5 };
        } else {
          try {
            const res = await fetchMediaByProvider(id, 'movie', 1);
            data = { results: res || [], total_pages: 5 };
          } catch {
            const res = await fetchMediaByCompany(id, 1);
            data = { results: res || [], total_pages: 5 };
          }
        }

        setItems(data.results || []);
        setTotalPages(data.total_pages || 1);
      } catch (err) {
        console.error("NetworkHub load error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadNetworkMedia();
  }, [id, currentStudio]);

  const loadMoreItems = async () => {
    if (page >= totalPages) return;
    try {
      setLoadingMore(true);
      const nextPage = page + 1;
      let moreData = [];

      if (currentStudio?.type === 'company') {
        moreData = await fetchMediaByCompany(id, nextPage);
      } else {
        moreData = await fetchMediaByProvider(id, 'movie', nextPage);
      }

      setItems((prev) => [...prev, ...(moreData || [])]);
      setPage(nextPage);
    } catch (err) {
      console.error("Error loading more studio titles:", err);
    } finally {
      setLoadingMore(false);
    }
  };

  const leadItem = items[0];
  const remainingItems = items.slice(1);
  const leadBackdrop = getImageUrl(leadItem?.backdrop_path, 'backdrop') || getImageUrl(leadItem?.poster_path, 'poster');

  return (
    <div className="min-h-screen bg-[#090A0F] text-white pb-24 pt-24 sm:pt-28 px-6 md:px-12">
      <div className="max-w-[1440px] mx-auto space-y-8">
        
        {/* Navigation & Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-white/[0.06]">
          <div className="space-y-2.5">
            <button 
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 text-xs text-zinc-400 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] px-3.5 py-1.5 rounded-full border border-white/[0.08] transition cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5 stroke-[1.5]" /> Back
            </button>

            <div>
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
                Channel Stream
              </span>
              <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white font-['Outfit'] mt-0.5">
                {displayName}
              </h1>
            </div>
          </div>
        </div>

        {/* Content Section */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {[...Array(15)].map((_, i) => (
              <div key={i} className="aspect-[2/3] rounded-xl shimmer-skeleton" />
            ))}
          </div>
        ) : items.length > 0 ? (
          <div className="space-y-10">
            
            {/* Featured Lead Spotlight Card */}
            {leadItem && (
              <div 
                onClick={() => navigate(`/details/${leadItem.media_type || 'movie'}/${leadItem.id}`)}
                className="group relative rounded-2xl overflow-hidden bg-[#11131A] border border-white/[0.06] hover:border-white/20 cursor-pointer min-h-[340px] sm:min-h-[420px] flex flex-col justify-end p-6 sm:p-8 transition-all duration-300 shadow-xl"
              >
                {leadBackdrop && (
                  <img 
                    src={leadBackdrop} 
                    alt="" 
                    className="absolute inset-0 w-full h-full object-cover object-center brightness-[0.35] group-hover:scale-105 transition duration-500" 
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#090A0F] via-[#090A0F]/60 to-transparent" />

                <div className="relative z-10 max-w-2xl space-y-2.5">
                  <div className="flex items-center gap-3 text-xs font-mono">
                    <span className="px-2 py-0.5 rounded border border-white/20 bg-black/70 backdrop-blur-md text-white font-medium uppercase tracking-wider text-[10px]">
                      Featured
                    </span>
                    <span className="text-zinc-300">
                      {leadItem.release_date?.substring(0, 4) || leadItem.first_air_date?.substring(0, 4) || '2026'}
                    </span>
                    {leadItem.vote_average > 0 && (
                      <span className="flex items-center gap-1 text-zinc-200 font-medium">
                        <Star className="w-3 h-3 text-zinc-400 stroke-[1.5]" /> {leadItem.vote_average.toFixed(1)}
                      </span>
                    )}
                  </div>

                  <h2 className="text-2xl sm:text-4xl font-bold text-white font-['Outfit'] tracking-tight group-hover:text-zinc-200 transition-colors">
                    {leadItem.title || leadItem.name}
                  </h2>

                  <p className="text-zinc-300 text-xs sm:text-sm line-clamp-2 font-light leading-relaxed">
                    {leadItem.overview || "Stream this title directly from the channel catalog."}
                  </p>

                  <div className="pt-1">
                    <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white hover:bg-zinc-200 text-black text-xs font-semibold uppercase tracking-wider transition shadow-md">
                      <Play className="w-3.5 h-3.5 stroke-[2] text-black" /> Watch Title
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Remaining Grid */}
            {remainingItems.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 uppercase tracking-wider">
                  <Layers className="w-3.5 h-3.5 stroke-[1.5]" />
                  <span>Catalog ({items.length} titles)</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-4">
                  {remainingItems.map((item, index) => {
                    const poster = getImageUrl(item.poster_path, 'posterSmall') || getImageUrl(item.backdrop_path, 'backdropSmall');
                    const itemType = item.media_type || 'movie';

                    return (
                      <div
                        key={`${item.id}-${index}`}
                        onClick={() => navigate(`/details/${itemType}/${item.id}`)}
                        className="cursor-pointer group/item flex flex-col gap-2 flex-shrink-0 transition-all duration-200"
                      >
                        <div className="relative aspect-[2/3] w-full rounded-xl overflow-hidden bg-[#11131A] border border-white/[0.06] group-hover/item:border-white/20 transition-all duration-200 group-hover/item:scale-[1.02] shadow-sm">
                          {poster ? (
                            <img 
                              src={poster} 
                              alt="" 
                              loading="lazy"
                              className="w-full h-full object-cover transition duration-300 group-hover/item:brightness-105" 
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-zinc-600 text-xs">
                              <Film className="w-6 h-6 opacity-30 stroke-[1.5]" />
                            </div>
                          )}

                          {item.vote_average > 0 && (
                            <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-md px-2 py-0.5 rounded-md flex items-center gap-1 border border-white/10 z-20">
                              <Star className="w-2.5 h-2.5 text-zinc-400 stroke-[1.5]" />
                              <span className="text-[10px] font-mono text-zinc-300">{item.vote_average.toFixed(1)}</span>
                            </div>
                          )}
                        </div>

                        <div className="space-y-0.5 px-0.5">
                          <h3 className="text-xs font-semibold text-zinc-200 line-clamp-1 group-hover/item:text-white transition">
                            {item.title || item.name}
                          </h3>
                          <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-mono">
                            <span>{item.release_date?.substring(0, 4) || item.first_air_date?.substring(0, 4) || '2026'}</span>
                            <span>·</span>
                            <span className="uppercase">{itemType}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Load More Button */}
            {page < totalPages && (
              <div className="flex justify-center pt-6">
                <button
                  onClick={loadMoreItems}
                  disabled={loadingMore}
                  className="px-6 py-2.5 rounded-full bg-[#11131A] hover:bg-[#161922] border border-white/10 text-zinc-300 hover:text-white text-xs font-mono tracking-wider uppercase transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <span>{loadingMore ? 'FETCHING...' : 'LOAD MORE'}</span>
                  {!loadingMore && <ChevronDown className="w-3.5 h-3.5 stroke-[1.5]" />}
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center text-xs text-zinc-500 font-mono">
            NO TITLES FOUND
          </div>
        )}

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