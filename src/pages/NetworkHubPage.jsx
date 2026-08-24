import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchMediaByProvider, fetchMediaByCompany, getImageUrl } from '../services/tmdb';
import { storageService } from '../services/storageService';
import { ArrowLeft, Film, Star, Play, Info, Bookmark, Loader2 } from 'lucide-react';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { STUDIOS_LIST } from '../constants/studios';
import StudioLogo from '../components/StudioLogo';
import QuickViewModal from '../components/QuickViewModal';
import { useAuth } from '../context/AuthContext';

export default function NetworkHubPage() {
  const { networkName, id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [items, setItems] = useState([]);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'movie' | 'tv' | 'top_rated'
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [quickMedia, setQuickMedia] = useState(null);

  const currentStudio = STUDIOS_LIST.find(
    s => String(s.code) === String(id) || s.name.toLowerCase().replace(/[^a-z0-9]/g, '') === networkName?.toLowerCase()
  ) || STUDIOS_LIST[0];

  const displayName = currentStudio?.name || (networkName ? networkName.toUpperCase() : 'Studio Hub');

  useDocumentTitle(`${displayName} — WarayFlix`);

  useEffect(() => {
    async function loadStudioCatalog() {
      try {
        setLoading(true);
        setPage(1);
        let results = [];

        if (currentStudio?.type === 'company') {
          results = await fetchMediaByCompany(currentStudio.code || id, 1);
        } else {
          try {
            results = await fetchMediaByProvider(currentStudio.code || id, 'movie', 1);
          } catch {
            results = await fetchMediaByCompany(currentStudio.code || id, 1);
          }
        }

        setItems(results || []);
      } catch (err) {
        console.error("NetworkHub load error:", err);
      } finally {
        setLoading(false);
      }
    }

    loadStudioCatalog();
  }, [id, currentStudio]);

  const loadMoreItems = async () => {
    if (loadingMore) return;
    try {
      setLoadingMore(true);
      const nextPage = page + 1;
      let moreData = [];

      if (currentStudio?.type === 'company') {
        moreData = await fetchMediaByCompany(currentStudio.code || id, nextPage);
      } else {
        moreData = await fetchMediaByProvider(currentStudio.code || id, 'movie', nextPage);
      }

      if (moreData && moreData.length > 0) {
        setItems((prev) => {
          const existing = new Set(prev.map(i => i.id));
          const additions = moreData.filter(i => !existing.has(i.id));
          return [...prev, ...additions];
        });
        setPage(nextPage);
      }
    } catch (err) {
      console.error("Error loading more studio titles:", err);
    } finally {
      setLoadingMore(false);
    }
  };

  // Filter Items
  const filteredItems = items.filter(item => {
    if (activeTab === 'movie') return item.media_type === 'movie' || !item.first_air_date;
    if (activeTab === 'tv') return item.media_type === 'tv' || Boolean(item.first_air_date);
    if (activeTab === 'top_rated') return (item.vote_average || 0) >= 7.5;
    return true;
  });

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#09090B] pb-24 pt-24 sm:pt-28 px-6 md:px-12 select-none">
      <div className="max-w-[1440px] mx-auto space-y-6">
        
        {/* Back Button */}
        <div>
          <button 
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 text-xs font-mono text-[#52525B] hover:text-[#09090B] bg-white hover:bg-zinc-50 px-3.5 py-1.5 rounded-full border border-black/10 transition cursor-pointer shadow-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5 stroke-[1.5]" />
            <span>Back</span>
          </button>
        </div>

        {/* Studio Switcher Ribbon with Authentic Vector Logos */}
        <div className="flex gap-2.5 overflow-x-auto scrollbar-none py-1 -mx-6 px-6 md:-mx-12 md:px-12 items-center">
          {STUDIOS_LIST.map((studio) => {
            const isActive = String(studio.code) === String(id) || studio.name.toLowerCase().replace(/[^a-z0-9]/g, '') === networkName?.toLowerCase();
            const studioSlug = studio.name.toLowerCase().replace(/[^a-z0-9]/g, '');

            return (
              <button
                key={studio.id}
                onClick={() => navigate(`/network/${studioSlug}/${studio.code}`)}
                className={`h-10 px-4 rounded-full whitespace-nowrap transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 border ${
                  isActive
                    ? 'bg-[#09090B] text-white border-transparent shadow-md scale-[1.02]'
                    : 'bg-white hover:bg-zinc-50 text-[#09090B] border-black/[0.08] shadow-sm hover:border-black/20'
                }`}
                title={studio.name}
              >
                <StudioLogo name={studio.name} className="h-4 max-w-[85px] object-contain" active={isActive} />
              </button>
            );
          })}
        </div>

        {/* Header & Filter Bar */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pt-2 pb-4 border-b border-black/[0.08]">
          <div className="space-y-1">
            <span className="text-[10px] font-mono text-[#52525B] uppercase tracking-widest block font-semibold">
              {currentStudio?.category || 'Studio Archive'}
            </span>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#09090B] font-['Outfit']">
                {displayName}
              </h1>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1 sm:pb-0">
            {[
              { id: 'all', label: 'All' },
              { id: 'movie', label: 'Movies' },
              { id: 'tv', label: 'Series' },
              { id: 'top_rated', label: 'Top Rated' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-mono transition cursor-pointer whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-[#09090B] text-white font-bold shadow-sm'
                    : 'bg-white hover:bg-zinc-50 text-[#52525B] hover:text-[#09090B] border border-black/[0.08]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Media Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5 sm:gap-4">
            {[...Array(18)].map((_, i) => (
              <div key={i} className="aspect-[2/3] rounded-2xl shimmer-skeleton-light" />
            ))}
          </div>
        ) : filteredItems.length > 0 ? (
          <div className="space-y-10">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5 sm:gap-4">
              {filteredItems.map((item, index) => {
                const poster = getImageUrl(item.poster_path, 'posterSmall') || getImageUrl(item.backdrop_path, 'backdropSmall');
                const itemType = item.media_type || (item.first_air_date ? 'tv' : 'movie');
                const releaseYear = (item.release_date || item.first_air_date || '').substring(0, 4);

                return (
                  <div
                    key={`${item.id}-${index}`}
                    onClick={() => navigate(`/details/${itemType}/${item.id}`)}
                    className="cursor-pointer group/item flex flex-col gap-2 flex-shrink-0 transition-all duration-200"
                  >
                    {/* Poster Card Container */}
                    <div className="relative aspect-[2/3] w-full rounded-2xl overflow-hidden bg-white border border-black/[0.06] group-hover/item:border-black/30 transition-all duration-200 group-hover/item:scale-[1.02] shadow-sm hover:shadow-md">
                      {poster ? (
                        <img 
                          src={poster} 
                          alt="" 
                          loading="lazy"
                          className="w-full h-full object-cover transition duration-300 group-hover/item:brightness-105" 
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center p-3 text-center text-zinc-400 bg-zinc-100 text-xs">
                          <Film className="w-6 h-6 opacity-30 stroke-[1.5]" />
                          <span className="text-[9px] font-mono text-[#52525B] mt-1">{item.title || item.name}</span>
                        </div>
                      )}

                      {/* Rating Badge */}
                      {item.vote_average > 0 && (
                        <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-md px-2 py-0.5 rounded-md flex items-center gap-1 border border-white/20 z-20 shadow-sm text-white">
                          <Star className="w-2.5 h-2.5 text-white stroke-[1.5]" />
                          <span className="text-[10px] font-mono font-bold text-white">{item.vote_average.toFixed(1)}</span>
                        </div>
                      )}

                      {/* Media Type Chip */}
                      <div className="absolute top-2 left-2 z-20">
                        <span className="px-1.5 py-0.5 rounded bg-[#09090B] text-white text-[9px] font-mono uppercase font-semibold shadow-sm">
                          {itemType}
                        </span>
                      </div>

                      {/* Hover Action Overlay */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/item:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2 z-30 p-2">
                        {/* Direct Play */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (itemType === 'tv') {
                              navigate(`/watch/tv/${item.id}/1/1`);
                            } else {
                              navigate(`/watch/movie/${item.id}`);
                            }
                          }}
                          className="w-9 h-9 rounded-full bg-[#09090B] hover:bg-black text-white flex items-center justify-center transition cursor-pointer shadow-md"
                          title="Watch Now"
                        >
                          <Play className="w-3.5 h-3.5 stroke-[2] fill-white text-white" />
                        </button>

                        {/* Quick View Info */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setQuickMedia(item);
                          }}
                          className="w-8 h-8 rounded-full bg-white/90 hover:bg-white text-[#09090B] backdrop-blur-md flex items-center justify-center border border-black/10 transition cursor-pointer shadow-sm"
                          title="Quick Preview"
                        >
                          <Info className="w-3.5 h-3.5 stroke-[1.5]" />
                        </button>

                        {/* Save Bookmark */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            storageService.togglePlaylistItem({ ...item, media_type: itemType }, user?.id);
                          }}
                          className="w-8 h-8 rounded-full bg-white/90 hover:bg-white text-[#09090B] backdrop-blur-md flex items-center justify-center border border-black/10 transition cursor-pointer shadow-sm"
                          title="Save to Watchlist"
                        >
                          <Bookmark className="w-3.5 h-3.5 stroke-[1.5]" />
                        </button>
                      </div>
                    </div>

                    {/* Title & Metadata */}
                    <div className="space-y-0.5 px-0.5">
                      <h3 className="text-xs font-semibold text-[#09090B] line-clamp-1 group-hover/item:text-black transition">
                        {item.title || item.name}
                      </h3>
                      <div className="flex items-center justify-between text-[10px] text-[#52525B] font-mono">
                        <span>{releaseYear || '—'}</span>
                        <span className="uppercase font-medium">{itemType}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Load More Button */}
            <div className="flex justify-center pt-6">
              <button
                onClick={loadMoreItems}
                disabled={loadingMore}
                className="px-8 py-3 rounded-full bg-[#09090B] hover:bg-black text-white text-xs font-mono font-bold tracking-wider uppercase transition flex items-center gap-2 cursor-pointer disabled:opacity-50 shadow-md hover:scale-105"
              >
                {loadingMore ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin stroke-[1.5]" />
                    <span>Loading Titles...</span>
                  </>
                ) : (
                  <span>Load More Titles</span>
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center text-xs text-[#52525B] font-mono">
            NO TITLES FOUND IN THIS CATEGORY
          </div>
        )}

      </div>

      {quickMedia && (
        <QuickViewModal
          media={quickMedia}
          type={quickMedia.media_type || (quickMedia.first_air_date ? 'tv' : 'movie')}
          isOpen={Boolean(quickMedia)}
          onClose={() => setQuickMedia(null)}
        />
      )}
    </div>
  );
}