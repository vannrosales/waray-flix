import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CONFIG } from '../config/siteConfig';
import { IMAGE_BASE_URL } from '../services/tmdb';
import Hero from '../components/Hero';
import { Star, Play, Layers, ChevronDown } from 'lucide-react';
import useDocumentTitle from '../hooks/useDocumentTitle';

const BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY = CONFIG.tmdbApiKey;

const TV_GENRES = [
  { id: 'all', name: 'All' },
  { id: 10759, name: 'Action & Adventure' },
  { id: 35, name: 'Comedy' },
  { id: 18, name: 'Drama' },
  { id: 9648, name: 'Mystery' },
];

export default function TVShows() {
  useDocumentTitle('WarayFlix — TV Shows');
  const navigate = useNavigate();
  const [heroContent, setHeroContent] = useState(null);
  const [shows, setShows] = useState([]);
  const [activeGenre, setActiveGenre] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    async function loadInitialShows() {
      try {
        setLoading(true);
        const genreQuery = activeGenre === 'all' ? '' : `&with_genres=${activeGenre}`;
        const res = await fetch(`${BASE_URL}/discover/tv?api_key=${API_KEY}&sort_by=popularity.desc${genreQuery}&page=1`);
        const data = await res.json();
        const results = data.results || [];

        setTotalPages(data.total_pages || 1);
        if (results.length > 0) {
          setHeroContent(results[0]);
          setShows(results.slice(1));
        }
      } catch (err) {
        console.error("Error fetching shows:", err);
      } finally {
        setLoading(false);
      }
    }
    loadInitialShows();
  }, [activeGenre]);

  const loadMoreShows = async () => {
    if (page >= totalPages) return;
    try {
      setLoadingMore(true);
      const nextPage = page + 1;
      const genreQuery = activeGenre === 'all' ? '' : `&with_genres=${activeGenre}`;
      const res = await fetch(`${BASE_URL}/discover/tv?api_key=${API_KEY}&sort_by=popularity.desc${genreQuery}&page=${nextPage}`);
      const data = await res.json();

      setShows((prev) => [...prev, ...(data.results || [])]);
      setPage(nextPage);
    } catch (err) {
      console.error("Error loading more shows:", err);
    } finally {
      setLoadingMore(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0D10] flex items-center justify-center text-zinc-600 font-mono text-xs">
        INITIALIZING_SERIES_NODE_
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0D10] text-white selection:bg-white selection:text-black">
      
      {/* Cinematic Hero Section */}
      {heroContent && <Hero content={heroContent} />}

      {/* Main Grid Section */}
      <div className="max-w-[1400px] mx-auto px-6 md:px-16 py-16 space-y-12">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 uppercase tracking-widest">
            <Layers className="w-4 h-4 text-white" />
            <span>Curated Series Stream</span>
          </div>

          {/* Minimalist Genre Selector */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-2 sm:pb-0">
            {TV_GENRES.map((g) => {
              const isSelected = activeGenre === g.id;
              return (
                <button
                  key={g.id}
                  onClick={() => { setActiveGenre(g.id); setPage(1); }}
                  className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all flex-shrink-0 cursor-pointer ${
                    isSelected 
                      ? 'bg-white text-black font-bold' 
                      : 'bg-[#1D2128]/50 text-zinc-400 hover:text-white hover:bg-[#1D2128]'
                  }`}
                >
                  {g.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* TV Shows Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {shows.map((item) => {
            const poster = item.poster_path ? `${IMAGE_BASE_URL}${item.poster_path}` : null;
            const year = item.first_air_date?.substring(0, 4) || '2026';
            
            return (
              <div
                key={item.id}
                onClick={() => navigate(`/details/tv/${item.id}`)}
                className="group relative bg-[#1D2128]/20 hover:bg-[#1D2128]/60 rounded-2xl p-3 border border-white/5 cursor-pointer transition-all duration-300 space-y-3"
              >
                <div className="aspect-[2/3] w-full rounded-xl bg-[#0B0D10] overflow-hidden relative">
                  {poster ? (
                    <img src={poster} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-700 text-xs font-mono">NO_POSTER</div>
                  )}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition">
                      <Play className="w-4 h-4 fill-current ml-0.5" />
                    </div>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500">
                    <span>{year}</span>
                    {item.vote_average > 0 && (
                      <span className="flex items-center gap-1 text-amber-400 font-bold">
                        <Star className="w-3 h-3 fill-current" /> {item.vote_average.toFixed(1)}
                      </span>
                    )}
                  </div>
                  <h3 className="text-xs font-medium text-zinc-200 group-hover:text-white transition-colors truncate">
                    {item.name}
                  </h3>
                </div>
              </div>
            );
          })}
        </div>

        {/* Load More Button */}
        {page < totalPages && (
          <div className="flex justify-center pt-8">
            <button
              onClick={loadMoreShows}
              disabled={loadingMore}
              className="px-8 py-3 rounded-full bg-[#1D2128]/60 hover:bg-[#1D2128] border border-white/10 hover:border-white/20 text-zinc-300 hover:text-white text-xs font-mono tracking-widest uppercase transition-all duration-300 flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <span>{loadingMore ? 'LOADING_MORE...' : 'LOAD MORE SERIES'}</span>
              {!loadingMore && <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}