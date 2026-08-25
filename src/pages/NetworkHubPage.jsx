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
    <div className="min-h-screen bg-[#000000] text-[#FFFFFF] pb-24 pt-24 sm:pt-28 px-6 md:px-12 select-none">
      <div className="max-w-[1440px] mx-auto space-y-6">
        
        {/* Back Button */}
        <div>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#18181C] hover:bg-[#222228] text-xs text-white border border-white/10 transition cursor-pointer shadow-sm"
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
                    ? 'bg-white text-black border-transparent shadow-md scale-[1.02]'
                    : 'bg-[#18181C] hover:bg-[#222228] text-white border-white/[0.08] shadow-sm hover:border-white/20'
                }`}
                title={studio.name}
              >
                <StudioLogo name={studio.name} active={isActive} />
              </button>
            );
          })}
        </div>

        {/* Studio Banner Header */}
        <div className="relative rounded-3xl overflow-hidden p-8 sm:p-10 border border-white/[0.08] shadow-md bg-[#18181C] flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-3 text-center md:text-left z-10">
            <span className="text-[10px] text-zinc-400 uppercase tracking-widest font-semibold block">
              OFFICIAL HUB & ARCHIVES
            </span>
            <div className="flex items-center justify-center md:justify-start gap-3">
              <StudioLogo name={displayName} active={false} />
            </div>
            <p className="text-xs sm:text-sm text-zinc-400 font-normal max-w-xl leading-relaxed">
              Explore the complete catalog of premier cinema productions, series releases, and original broadcasts from {displayName}.
            </p>
          </div>

          <div className="flex items-center gap-3 z-10">
            <div className="px-4 py-2 rounded-2xl bg-white/[0.06] border border-white/10 text-xs text-zinc-300">
              {items.length}+ Titles Available
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 border-b border-white/[0.08] pb-4 overflow-x-auto scrollbar-none">
          {[
            { id: 'all', label: `All Releases (${items.length})` },
            { id: 'movie', label: 'Feature Films' },
            { id: 'tv', label: 'TV & Series' },
            { id: 'top_rated', label: 'Top Rated ★' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition cursor-pointer flex-shrink-0 ${
                activeTab === tab.id
                  ? 'bg-white text-black font-bold shadow-sm'
                  : 'bg-white/[0.06] text-zinc-400 hover:text-white hover:bg-white/[0.12] border border-white/[0.08]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Media Grid */}
        {filteredItems.length > 0 || loading ? (
          <MediaGrid
            items={filteredItems}
            loading={loading}
            onQuickView={setQuickMedia}
            skeletonCount={12}
            emptyMessage={`No titles available for this filter.`}
          />
        ) : (
          <EmptyState
            title="No Titles Found"
            description={`No media found in the ${displayName} catalog for this filter.`}
          />
        )}

        {/* Load More Button */}
        {items.length > 0 && (
          <div className="flex justify-center pt-8">
            <button
              onClick={loadMoreItems}
              disabled={loadingMore}
              className="px-6 py-2.5 rounded-full bg-white hover:bg-zinc-200 text-black text-xs tracking-wider uppercase transition flex items-center gap-2 cursor-pointer disabled:opacity-50 shadow-md hover:scale-105"
            >
              {loadingMore ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin stroke-[2]" />
                  <span>LOADING...</span>
                </>
              ) : (
                <span>LOAD MORE TITLES</span>
              )}
            </button>
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
