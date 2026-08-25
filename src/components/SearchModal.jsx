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
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/80 backdrop-blur-md animate-fade-in select-none"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-2xl bg-[#18181C] border border-white/[0.12] rounded-3xl overflow-hidden shadow-2xl animate-slide-up flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="relative flex items-center px-5 py-4 border-b border-white/[0.08] bg-[#18181C]">
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
              className="p-1 text-zinc-400 hover:text-white mr-2 cursor-pointer"
            >
              <X className="w-4 h-4 stroke-[1.5]" />
            </button>
          )}
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/[0.08] text-[9px] text-zinc-400">
            ESC
          </kbd>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 px-5 py-2.5 border-b border-white/[0.06] bg-[#141416] text-xs">
          <span className="text-zinc-400 text-[11px] mr-1 font-medium">Filter:</span>
          {['all', 'movie', 'tv'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1 rounded-full text-[11px] transition cursor-pointer ${
                activeTab === tab 
                  ? 'bg-white text-black font-bold shadow-sm' 
                  : 'bg-white/[0.06] text-zinc-400 hover:text-white hover:bg-white/[0.12] border border-white/[0.08]'
              }`}
            >
              {tab === 'all' ? 'All Titles' : tab === 'movie' ? 'Movies' : 'TV Series'}
            </button>
          ))}
          {loading && (
            <span className="ml-auto text-[10px] text-white font-medium animate-pulse">Searching...</span>
          )}
        </div>

        {/* Results Area */}
        <div className="overflow-y-auto p-4 space-y-3">
          {!query.trim() ? (
            <div className="space-y-3 py-2">
              <div className="flex items-center gap-2 text-xs text-zinc-400 font-medium">
                <TrendingUp className="w-3.5 h-3.5 stroke-[1.5] text-white" />
                <span>Popular Searches</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {TRENDING_TAGS.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => handleTagClick(tag)}
                    className="px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.08] text-xs text-zinc-300 transition cursor-pointer"
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
                    className="flex items-center gap-3 p-2.5 rounded-2xl bg-[#18181C] hover:bg-[#222228] border border-white/[0.04] hover:border-white/[0.15] transition cursor-pointer group shadow-sm hover:shadow"
                  >
                    <div className="w-10 h-14 rounded-lg bg-zinc-800 flex-shrink-0 overflow-hidden border border-white/10">
                      {posterUrl ? (
                        <img src={posterUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-500">
                          <Film className="w-4 h-4" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs sm:text-sm font-semibold text-white truncate group-hover:text-zinc-300 transition">
                        {item.title || item.name}
                      </h4>
                      <div className="flex items-center gap-2 text-[10px] text-zinc-400 mt-0.5">
                        <span className="uppercase font-medium text-white">{itemType}</span>
                        <span>·</span>
                        <span>{year}</span>
                        {item.vote_average > 0 && (
                          <>
                            <span>·</span>
                            <span className="flex items-center gap-0.5 text-white font-bold">
                              <Star className="w-2.5 h-2.5 text-white fill-white" />
                              {item.vote_average.toFixed(1)}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-12 text-center text-xs text-zinc-400">
              No cinema titles found matching "{query}"
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
