import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { searchMultiMedia } from '../services/tmdb';
import { Search } from 'lucide-react';
import QuickViewModal from '../components/QuickViewModal';
import MediaGrid from '../components/common/MediaGrid';
import EmptyState from '../components/common/EmptyState';
import useDocumentTitle from '../hooks/useDocumentTitle';

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [quickMedia, setQuickMedia] = useState(null);

  useDocumentTitle(query ? `Search: "${query}" — WarayFlix` : 'Search — WarayFlix');

  useEffect(() => {
    async function performSearch() {
      if (!query.trim()) return;
      try {
        setLoading(true);
        const data = await searchMultiMedia(query);
        setResults(data || []);
      } catch (err) {
        console.error("Search failure:", err);
      } finally {
        setLoading(false);
      }
    }
    performSearch();
  }, [query]);

  const filteredResults = results.filter(item => {
    if (activeFilter === 'movie') return item.media_type === 'movie';
    if (activeFilter === 'tv') return item.media_type === 'tv';
    return true;
  });

  return (
    <div className="min-h-screen bg-[#000000] text-[#FFFFFF] pt-24 sm:pt-28 px-6 md:px-12 pb-24 select-none">
      <div className="max-w-[1440px] mx-auto space-y-6">
        
        {/* Header */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 font-semibold">
            <Search className="w-3.5 h-3.5 stroke-[1.5] text-white" />
            <span>Search</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-bold text-white">
            {query ? `Results for "${query}"` : "Search Library"}
          </h1>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1.5 pt-1">
            {[
              { id: 'all', label: `All (${results.length})` },
              { id: 'movie', label: `Movies (${results.filter(r => r.media_type === 'movie').length})` },
              { id: 'tv', label: `Series (${results.filter(r => r.media_type === 'tv').length})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id)}
                className={`px-3.5 py-1 rounded-full text-xs font-medium transition cursor-pointer ${
                  activeFilter === tab.id
                    ? 'bg-white text-black font-bold shadow-sm'
                    : 'bg-white/[0.06] text-zinc-400 hover:text-white hover:bg-white/[0.12] border border-white/[0.08]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Results Grid */}
        {filteredResults.length > 0 || loading ? (
          <MediaGrid
            items={filteredResults}
            loading={loading}
            onQuickView={setQuickMedia}
            skeletonCount={10}
            emptyMessage={query ? `No results found for "${query}"` : 'Enter a search term to find cinema titles'}
          />
        ) : (
          <EmptyState
            icon={Search}
            title={query ? 'No matching titles found' : 'Explore the Library'}
            description={
              query
                ? `No movies or TV shows matched "${query}". Try checking for typos or searching a different title.`
                : 'Type a title, actor, or genre above to discover movies and series.'
            }
          />
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
