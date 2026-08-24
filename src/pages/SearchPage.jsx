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
    <div className="min-h-screen bg-[#090A0F] text-[#EDEDED] pt-24 sm:pt-28 px-6 md:px-12 pb-24">
      <div className="max-w-[1440px] mx-auto space-y-6">
        
        {/* Header */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
            <Search className="w-3.5 h-3.5 stroke-[1.5]" />
            <span>Search</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-bold text-white font-['Outfit']">
            {query ? `Results for "${query}"` : "Search Library"}
          </h1>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1.5 pt-1">
            {[
              { id: 'all', label: `All (${results.length})` },
              { id: 'movie', label: `Movies (${results.filter(r => r.media_type === 'movie').length})` },
              { id: 'tv', label: `Series (${results.filter(r => r.media_type === 'tv').length})` },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id)}
                className={`px-3.5 py-1 rounded-full text-xs font-medium transition cursor-pointer ${
                  activeFilter === tab.id 
                    ? 'bg-white text-black font-semibold' 
                    : 'bg-white/[0.04] text-zinc-400 hover:text-white hover:bg-white/[0.08]'
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
              <div key={i} className="aspect-[2/3] rounded-xl shimmer-skeleton" />
            ))}
          </div>
        ) : filteredResults.length === 0 ? (
          <div className="py-20 text-center text-zinc-500 font-mono text-xs space-y-2">
            <Film className="w-8 h-8 mx-auto opacity-30 stroke-[1.5]" />
            <p>No matching titles found for "{query}".</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-4">
            {filteredResults.map(item => {
              const itemType = item.media_type || 'movie';
              const poster = getImageUrl(item.poster_path, 'posterSmall') || getImageUrl(item.backdrop_path, 'backdropSmall');
              const year = item.release_date?.substring(0, 4) || item.first_air_date?.substring(0, 4) || '2026';

              return (
                <div 
                  key={item.id} 
                  onClick={() => navigate(`/details/${itemType}/${item.id}`)}
                  className="cursor-pointer group/item flex flex-col gap-2 flex-shrink-0 transition-all duration-200"
                >
                  <div className="relative aspect-[2/3] w-full rounded-xl overflow-hidden bg-[#11131A] border border-white/[0.06] group-hover/item:border-white/20 transition-all duration-200 group-hover/item:scale-[1.02] shadow-sm">
                    {poster ? (
                      <img 
                        src={poster} 
                        alt={item.title || item.name} 
                        loading="lazy"
                        className="w-full h-full object-cover transition duration-300 group-hover/item:brightness-105"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center p-4 text-center text-zinc-400 h-full">
                        <Film className="w-6 h-6 mb-1 opacity-30 stroke-[1.5]" />
                        <span className="text-xs font-mono">{item.title || item.name}</span>
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
                      <span>{year}</span>
                      <span>·</span>
                      <span className="uppercase">{itemType}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {quickMedia && (
        <QuickViewModal
          media={quickMedia}
          type={quickMedia.media_type || 'movie'}
          isOpen={Boolean(quickMedia)}
          onClose={() => setQuickMedia(null)}
        />
      )}
    </div>
  );
}