import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchMediaByProvider, fetchMediaByCompany } from '../services/tmdb';
import { ArrowLeft, Loader2 } from 'lucide-react';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { STUDIOS_LIST } from '../constants/studios';
import StudioLogo from '../components/StudioLogo';
import QuickViewModal from '../components/QuickViewModal';
import MediaGrid from '../components/common/MediaGrid';
import EmptyState from '../components/common/EmptyState';

export default function NetworkHubPage() {
  const { networkName, id } = useParams();
  const navigate = useNavigate();

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
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white hover:bg-zinc-50 text-xs font-mono text-[#09090B] border border-black/10 transition cursor-pointer shadow-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5 stroke-[1.5]" />
            <span>BACK</span>
          </button>
        </div>

        {/* Studio Switcher Ribbon */}
        <div className="flex gap-2.5 overflow-x-auto scrollbar-none py-1 -mx-6 px-6 md:-mx-12 md:px-12 items-center">
          {STUDIOS_LIST.map((studio) => {
            const isActive = String(studio.code) === String(id) || studio.name.toLowerCase().replace(/[^a-z0-9]/g, '') === networkName?.toLowerCase();
            const studioSlug = studio.name.toLowerCase().replace(/[^a-z0-9]/g, '');

            return (
              <button
                key={studio.id}
                onClick={() => navigate(`/network/${studioSlug}/${studio.code}`)}
                className={`h-10 px-4 rounded-full whitespace-nowrap transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 border flex-shrink-0 ${
                  isActive
                    ? 'bg-[#09090B] text-white border-transparent shadow-md scale-[1.02]'
                    : 'bg-white hover:bg-zinc-50 text-[#09090B] border-black/[0.08] shadow-sm hover:border-black/20'
                }`}
                title={studio.name}
              >
                <StudioLogo name={studio.name} active={isActive} />
              </button>
            );
          })}
        </div>

        {/* Studio Banner Header */}
        <div className="relative rounded-3xl overflow-hidden p-8 sm:p-10 border border-black/[0.08] shadow-md bg-white flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-3 text-center md:text-left z-10">
            <span className="text-[10px] font-mono text-[#52525B] uppercase tracking-widest font-semibold block">
              OFFICIAL HUB & ARCHIVES
            </span>
            <div className="flex items-center justify-center md:justify-start gap-3">
              <StudioLogo name={displayName} />
              <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-[#09090B] font-['Outfit']">
                {displayName}
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-[#52525B] max-w-xl font-normal">
              {currentStudio?.description || `Explore movies and television series distributed by ${displayName}.`}
            </p>
          </div>

          <div className="flex-shrink-0 z-10">
            <div className="px-5 py-3 rounded-2xl bg-black/[0.04] border border-black/[0.08] text-center font-mono">
              <span className="text-xl sm:text-3xl font-bold text-[#09090B] block">{items.length}+</span>
              <span className="text-[10px] text-[#52525B] uppercase font-semibold">Streamable Titles</span>
            </div>
          </div>
        </div>

        {/* Filter Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-black/[0.08] pb-4 overflow-x-auto">
          {[
            { id: 'all', label: `All Titles (${items.length})` },
            { id: 'movie', label: 'Feature Films' },
            { id: 'tv', label: 'Series & Shows' },
            { id: 'top_rated', label: '★ Highly Rated' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition cursor-pointer flex-shrink-0 ${
                activeTab === tab.id
                  ? 'bg-[#09090B] text-white font-bold shadow-sm'
                  : 'bg-black/[0.04] text-[#52525B] hover:text-[#09090B] hover:bg-black/[0.08]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Studio Catalog Grid */}
        {loading || filteredItems.length > 0 ? (
          <div className="space-y-6">
            <MediaGrid
              items={filteredItems}
              loading={loading}
              skeletonCount={15}
              onQuickView={setQuickMedia}
              emptyMessage="No titles found for this category."
            />

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
          <EmptyState
            title="No Titles Found"
            description="No movies or series currently matched this studio filter."
          />
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