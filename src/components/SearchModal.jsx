import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchMultiMedia, getImageUrl } from '../services/tmdb';
import { Search, X, Film, Star, TrendingUp } from 'lucide-react';

const TRENDING_TAGS = ['Inception', 'Dune', 'Stranger Things', 'Attack on Titan', 'Spider-Man', 'The Dark Knight', 'Breaking Bad'];

export default function SearchModal({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const data = await searchMultiMedia(query);
        setResults(data);
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  const filteredResults = results.filter(item => {
    if (activeTab === 'all') return true;
    if (activeTab === 'movie') return item.media_type === 'movie';
    if (activeTab === 'tv') return item.media_type === 'tv';
    return true;
  });

  const handleSelectItem = (item) => {
    const itemType = item.media_type || 'movie';
    onClose();
    navigate(`/details/${itemType}/${item.id}`);
  };

  const handleTagClick = (tag) => {
    setQuery(tag);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/80 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-2xl bg-[#0E1017] border border-white/[0.08] rounded-2xl overflow-hidden shadow-2xl animate-slide-up flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="relative flex items-center px-5 py-3.5 border-b border-white/[0.06] bg-[#11131A]">
          <Search className="w-4 h-4 text-zinc-400 stroke-[1.5] mr-3 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search movies, series, anime, directors..."
            className="w-full bg-transparent text-white text-sm sm:text-base placeholder-zinc-500 focus:outline-none font-sans"
          />
          {query && (
            <button 
              onClick={() => setQuery('')}
              className="p-1 text-zinc-400 hover:text-white mr-2"
            >
              <X className="w-4 h-4 stroke-[1.5]" />
            </button>
          )}
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-white/[0.04] border border-white/[0.08] text-[9px] font-mono text-zinc-400">
            ESC
          </kbd>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 px-5 py-2.5 border-b border-white/[0.04] bg-[#0A0C12] text-xs font-mono">
          <span className="text-zinc-500 text-[11px] mr-1">Filter:</span>
          {['all', 'movie', 'tv'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-0.5 rounded-full text-[11px] transition cursor-pointer ${
                activeTab === tab 
                  ? 'bg-white text-black font-semibold' 
                  : 'bg-white/[0.04] text-zinc-400 hover:text-white hover:bg-white/[0.08]'
              }`}
            >
              {tab === 'all' ? 'All Titles' : tab === 'movie' ? 'Movies' : 'TV Series'}
            </button>
          ))}
          {loading && (
            <span className="ml-auto text-[10px] text-zinc-500">Searching...</span>
          )}
        </div>

        {/* Results Area */}
        <div className="overflow-y-auto p-4 space-y-3">
          {!query.trim() ? (
            <div className="space-y-3 py-2">
              <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
                <TrendingUp className="w-3.5 h-3.5 stroke-[1.5]" />
                <span>Popular Searches</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {TRENDING_TAGS.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => handleTagClick(tag)}
                    className="px-3 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-xs text-zinc-300 hover:text-white font-mono transition cursor-pointer"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          ) : filteredResults.length > 0 ? (
            <div className="grid grid-cols-1 gap-1.5">
              {filteredResults.map((item) => {
                const posterUrl = getImageUrl(item.poster_path, 'thumbnail') || getImageUrl(item.backdrop_path, 'thumbnail');
                const itemType = item.media_type || 'movie';
                const year = item.release_date?.substring(0, 4) || item.first_air_date?.substring(0, 4) || '2026';

                return (
                  <div
                    key={item.id}
                    onClick={() => handleSelectItem(item)}
                    className="flex items-center gap-3 p-2 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.04] hover:border-white/10 transition cursor-pointer group"
                  >
                    <div className="w-10 h-14 rounded-lg bg-black overflow-hidden flex-shrink-0 relative">
                      {posterUrl ? (
                        <img src={posterUrl} alt="" className="w-full h-full object-cover transition" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-600">
                          <Film className="w-4 h-4 opacity-30 stroke-[1.5]" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-400 mb-0.5">
                        <span className="px-1.5 py-0.2 rounded border border-white/10 text-white uppercase text-[9px]">
                          {itemType}
                        </span>
                        <span>{year}</span>
                        {item.vote_average > 0 && (
                          <span className="flex items-center gap-0.5 text-zinc-300 font-medium">
                            <Star className="w-2.5 h-2.5 text-zinc-400 stroke-[1.5]" /> {item.vote_average.toFixed(1)}
                          </span>
                        )}
                      </div>
                      <h4 className="text-xs sm:text-sm font-semibold text-zinc-200 group-hover:text-white truncate">
                        {item.title || item.name}
                      </h4>
                      <p className="text-[11px] text-zinc-500 line-clamp-1 font-light">
                        {item.overview || "Click to view stream details."}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-12 text-center text-zinc-500 font-mono text-xs">
              NO TITLES FOUND FOR "{query}"
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
