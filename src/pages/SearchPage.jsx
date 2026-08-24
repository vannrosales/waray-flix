import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { searchMultiMedia, getImageUrl } from '../services/tmdb';
import { Film, Star, Search } from 'lucide-react';
import QuickViewModal from '../components/QuickViewModal';
import useDocumentTitle from '../hooks/useDocumentTitle';

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [quickMedia, setQuickMedia] = useState(null);
  const navigate = useNavigate();

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
    <div className="min-h-screen bg-[#FAFAFA] text-[#09090B] pt-24 sm:pt-28 px-6 md:px-12 pb-24 select-none">
      <div className="max-w-[1440px] mx-auto space-y-6">
        
        {/* Header */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-mono text-[#52525B] font-semibold">
            <Search className="w-3.5 h-3.5 stroke-[1.5] text-[#2563EB]" />
            <span>Search</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-bold text-[#09090B] font-['Outfit']">
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
                    ? 'bg-[#09090B] text-white font-bold shadow-sm'
                    : 'bg-black/[0.04] text-[#52525B] hover:text-[#09090B] hover:bg-black/[0.08]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Results Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="aspect-[2/3] rounded-2xl shimmer-skeleton-light" />
            ))}
          </div>
        ) : filteredResults.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-4">
            {filteredResults.map((item) => {
              const poster = getImageUrl(item.poster_path, 'posterSmall') || getImageUrl(item.backdrop_path, 'backdropSmall');
              const itemType = item.media_type || 'movie';
              const year = item.release_date?.substring(0, 4) || item.first_air_date?.substring(0, 4) || '2026';

              return (
                <div
                  key={item.id}
                  onClick={() => navigate(`/details/${itemType}/${item.id}`)}
                  className="cursor-pointer group/item flex flex-col gap-2 flex-shrink-0 transition-all duration-200"
                >
                  <div className="relative aspect-[2/3] w-full rounded-2xl overflow-hidden bg-white border border-black/[0.06] group-hover/item:border-[#2563EB]/40 transition-all duration-200 group-hover/item:scale-[1.02] shadow-sm hover:shadow-md">
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
                      </div>
                    )}

                    {item.vote_average > 0 && (
                      <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-md px-2 py-0.5 rounded-md flex items-center gap-1 border border-black/10 z-20 shadow-sm">
                        <Star className="w-2.5 h-2.5 text-[#2563EB] fill-[#2563EB] stroke-[1.5]" />
                        <span className="text-[10px] font-mono font-bold text-[#09090B]">{item.vote_average.toFixed(1)}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-0.5 px-0.5">
                    <h3 className="text-xs font-semibold text-[#09090B] line-clamp-1 group-hover/item:text-[#2563EB] transition">
                      {item.title || item.name}
                    </h3>
                    <div className="flex items-center gap-2 text-[10px] text-[#52525B] font-mono">
                      <span>{year}</span>
                      <span>·</span>
                      <span className="uppercase font-medium">{itemType}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-20 text-center text-xs font-mono text-[#52525B]">
            {query ? `No results found for "${query}"` : 'Enter a search term to find cinema titles'}
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