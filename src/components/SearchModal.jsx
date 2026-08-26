import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchMultiMedia, getImageUrl } from '../services/tmdb';
import { Search, X, Film, Star, TrendingUp, Tv, Sparkles, ArrowRight } from 'lucide-react';

const TRENDING_TAGS = ['Avengers', 'Inception', 'Dune', 'Stranger Things', 'Attack on Titan', 'Spider-Man', 'Breaking Bad'];

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
        setResults(data || []);
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

  const handleFullSearch = (e) => {
    e?.preventDefault();
    if (!query.trim()) return;
    onClose();
    navigate(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-start justify-center pt-12 sm:pt-20 px-4 bg-black/85 backdrop-blur-md animate-fade-in select-none"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-2xl bg-[#121212] border border-white/15 rounded-3xl overflow-hidden shadow-2xl animate-slide-up flex flex-col max-h-[82vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <form onSubmit={handleFullSearch} className="relative flex items-center px-5 py-4 border-b border-white/10 bg-[#121212]">
          <Search className="w-5 h-5 text-zinc-400 stroke-[2] mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search movies, series, anime, cast..."
            className="w-full bg-transparent text-white text-sm sm:text-base placeholder-zinc-500 focus:outline-none font-bold tracking-tight"
          />
          {query && (
            <button 
              type="button"
              onClick={() => setQuery('')}
              className="p-1 rounded-full text-zinc-400 hover:text-white mr-2 transition cursor-pointer"
            >
              <X className="w-4 h-4 stroke-[2]" />
            </button>
          )}
          <kbd className="hidden sm:inline-block px-2 py-0.5 rounded-lg bg-[#252525] border border-white/10 text-[10px] font-bold text-zinc-400">
            ESC
          </kbd>
        </form>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 px-5 py-2.5 border-b border-white/[0.08] bg-[#18181C] text-xs">
          <span className="text-zinc-500 text-[10px] uppercase font-bold tracking-wider mr-1">Filter:</span>
          {[
            { id: 'all', label: 'All Titles' },
            { id: 'movie', label: 'Movies' },
            { id: 'tv', label: 'Series' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1 rounded-full text-xs font-bold transition cursor-pointer ${
                activeTab === tab.id 
                  ? 'bg-white text-black shadow-sm' 
                  : 'bg-[#252525] text-zinc-400 hover:text-white hover:bg-[#333333] border border-white/10'
              }`}
            >
              {tab.label}
            </button>
          ))}
          {loading && (
            <span className="ml-auto text-[10px] text-white font-bold animate-pulse">Searching...</span>
          )}
        </div>

        {/* Results Area */}
        <div className="overflow-y-auto p-4 space-y-2 flex-1">
          {!query.trim() ? (
            <div className="space-y-4 py-3 px-2">
              <div className="flex items-center gap-2 text-xs text-zinc-400 font-bold uppercase tracking-wider">
                <TrendingUp className="w-4 h-4 text-white stroke-[2]" />
                <span>Trending Searches</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {TRENDING_TAGS.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setQuery(tag)}
                    className="px-3.5 py-1.5 rounded-xl bg-[#1A1A1E] hover:bg-[#252525] border border-white/10 hover:border-white/30 text-xs font-bold text-zinc-300 hover:text-white transition cursor-pointer active:scale-95 shadow-sm"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          ) : filteredResults.length > 0 ? (
            <div className="space-y-2">
              {filteredResults.slice(0, 8).map((item) => {
                const title = item.title || item.name || 'Untitled';
                const year = (item.release_date || item.first_air_date || '').slice(0, 4);
                const rating = item.vote_average ? item.vote_average.toFixed(1) : null;
                const isTv = item.media_type === 'tv';

                return (
                  <div
                    key={`${item.media_type}-${item.id}`}
                    onClick={() => handleSelectItem(item)}
                    className="flex items-center gap-3.5 p-2.5 rounded-2xl bg-[#18181C] hover:bg-[#252525] border border-white/[0.06] hover:border-white/30 transition cursor-pointer group shadow-sm hover:shadow-md"
                  >
                    {/* Poster Thumbnail */}
                    <div className="w-12 h-16 rounded-xl overflow-hidden bg-[#121212] shrink-0 border border-white/10">
                      {item.poster_path ? (
                        <img
                          src={getImageUrl(item.poster_path, 'posterSmall')}
                          alt={title}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-200"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-600">
                          <Film className="w-5 h-5 stroke-[1.5]" />
                        </div>
                      )}
                    </div>

                    {/* Metadata */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <h4 className="text-sm font-bold text-white group-hover:text-zinc-200 truncate leading-tight">
                        {title}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-zinc-400 font-bold">
                        <span className="px-1.5 py-0.5 rounded-md bg-[#121212] border border-white/10 text-[10px] text-zinc-300">
                          {isTv ? 'SERIES' : 'MOVIE'}
                        </span>
                        {year && <span>{year}</span>}
                        {rating && (
                          <div className="flex items-center gap-1 text-amber-400 font-bold text-xs">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            <span>{rating}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Arrow */}
                    <div className="w-8 h-8 rounded-xl bg-white/5 group-hover:bg-white text-zinc-400 group-hover:text-black flex items-center justify-center transition shrink-0 mr-1">
                      <ArrowRight className="w-3.5 h-3.5 stroke-[2]" />
                    </div>
                  </div>
                );
              })}

              {/* View all results button */}
              <button
                onClick={handleFullSearch}
                className="w-full py-2.5 mt-2 rounded-xl bg-[#1A1A1E] hover:bg-[#252525] border border-white/10 text-xs font-bold text-white text-center transition cursor-pointer flex items-center justify-center gap-2"
              >
                <span>View all results for &ldquo;{query}&rdquo;</span>
                <ArrowRight className="w-3.5 h-3.5 stroke-[2]" />
              </button>
            </div>
          ) : (
            <div className="py-10 text-center space-y-2">
              <Film className="w-8 h-8 stroke-[1.5] text-zinc-600 mx-auto" />
              <p className="text-xs text-zinc-400 font-bold">No matching titles found for &ldquo;{query}&rdquo;</p>
              <p className="text-[11px] text-zinc-500 font-normal">Try checking for typos or searching a different term.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
