import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CONFIG } from '../config/siteConfig';
import { getImageUrl } from '../services/tmdb';
import Hero from '../components/Hero';
import QuickViewModal from '../components/QuickViewModal';
import { Star, Film, ChevronDown, SlidersHorizontal } from 'lucide-react';
import useDocumentTitle from '../hooks/useDocumentTitle';

const BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY = CONFIG.tmdbApiKey;

const MOVIE_GENRES = [
  { id: 'all', name: 'All' },
  { id: 28, name: 'Action' },
  { id: 12, name: 'Adventure' },
  { id: 16, name: 'Animation' },
  { id: 35, name: 'Comedy' },
  { id: 80, name: 'Crime' },
  { id: 18, name: 'Drama' },
  { id: 27, name: 'Horror' },
  { id: 878, name: 'Sci-Fi' },
  { id: 53, name: 'Thriller' },
];

const SORT_OPTIONS = [
  { id: 'popularity.desc', label: 'Most Popular' },
  { id: 'vote_average.desc&vote_count.gte=300', label: 'Top Rated' },
  { id: 'primary_release_date.desc', label: 'Newest Releases' },
];

export default function Movies() {
  useDocumentTitle('Movies — WarayFlix');
  const navigate = useNavigate();
  const [heroContent, setHeroContent] = useState(null);
  const [movies, setMovies] = useState([]);
  const [activeGenre, setActiveGenre] = useState('all');
  const [sortBy, setSortBy] = useState('popularity.desc');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [quickMedia, setQuickMedia] = useState(null);

  useEffect(() => {
    async function loadMovies() {
      try {
        setLoading(true);
        const genreQuery = activeGenre === 'all' ? '' : `&with_genres=${activeGenre}`;
        const res = await fetch(`${BASE_URL}/discover/movie?api_key=${API_KEY}&sort_by=${sortBy}${genreQuery}&page=1`);
        const data = await res.json();
        const results = data.results || [];

        setTotalPages(data.total_pages || 1);
        if (results.length > 0) {
          setHeroContent(results[0]);
          setMovies(results);
        } else {
          setMovies([]);
        }
      } catch (err) {
        console.error("Error fetching movies:", err);
      } finally {
        setLoading(false);
      }
    }
    loadMovies();
  }, [activeGenre, sortBy]);

  const loadMoreMovies = async () => {
    if (page >= totalPages) return;
    try {
      setLoadingMore(true);
      const nextPage = page + 1;
      const genreQuery = activeGenre === 'all' ? '' : `&with_genres=${activeGenre}`;
      const res = await fetch(`${BASE_URL}/discover/movie?api_key=${API_KEY}&sort_by=${sortBy}${genreQuery}&page=${nextPage}`);
      const data = await res.json();

      setMovies((prev) => [...prev, ...(data.results || [])]);
      setPage(nextPage);
    } catch (err) {
      console.error("Error loading more movies:", err);
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090A0F] text-[#EDEDED] font-sans pb-24">
      
      {/* Dynamic Hero Showcase */}
      {heroContent && <Hero content={heroContent} items={movies.slice(0, 5)} />}

      {/* Main Grid & Filters Section */}
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-10 space-y-6">
        
        {/* Filter Controls Bar */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-[#11131A] border border-white/[0.06] space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
              <Film className="w-3.5 h-3.5 stroke-[1.5]" />
              <span>Movies Catalog</span>
            </div>

            {/* Sort Selector */}
            <div className="flex items-center gap-2 text-xs font-mono">
              <SlidersHorizontal className="w-3 h-3 stroke-[1.5] text-zinc-500" />
              <span className="text-zinc-500 hidden sm:inline">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
                className="bg-[#090A0F] border border-white/10 text-zinc-300 text-xs py-1 px-2.5 rounded-lg focus:outline-none transition cursor-pointer"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.id} value={opt.id} className="bg-[#090A0F] text-zinc-300">
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Genre Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
            {MOVIE_GENRES.map((g) => {
              const isSelected = activeGenre === g.id;
              return (
                <button
                  key={g.id}
                  onClick={() => { setActiveGenre(g.id); setPage(1); }}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all flex-shrink-0 cursor-pointer ${
                    isSelected 
                      ? 'bg-white text-black font-semibold' 
                      : 'bg-white/[0.04] text-zinc-400 hover:text-white hover:bg-white/[0.08]'
                  }`}
                >
                  {g.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Movies Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {[...Array(15)].map((_, i) => (
              <div key={i} className="aspect-[2/3] rounded-xl shimmer-skeleton" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-4">
            {movies.map((item) => {
              const poster = getImageUrl(item.poster_path, 'posterSmall') || getImageUrl(item.backdrop_path, 'backdropSmall');
              const year = item.release_date?.substring(0, 4) || '2026';
              
              return (
                <div
                  key={item.id}
                  onClick={() => navigate(`/details/movie/${item.id}`)}
                  className="cursor-pointer group/item flex flex-col gap-2 flex-shrink-0 transition-all duration-200"
                >
                  {/* Poster Card */}
                  <div className="relative aspect-[2/3] w-full rounded-xl overflow-hidden bg-[#11131A] border border-white/[0.06] group-hover/item:border-white/20 transition-all duration-200 group-hover/item:scale-[1.02] shadow-sm">
                    {poster ? (
                      <img 
                        src={poster} 
                        alt={item.title} 
                        loading="lazy"
                        className="absolute inset-0 w-full h-full object-cover transition duration-300 group-hover/item:brightness-105"
                      />
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-3 text-center text-zinc-600 bg-[#0E1017]">
                        <Film className="w-6 h-6 mb-1 opacity-30 stroke-[1.5]" />
                        <span className="text-[9px] font-mono">{item.title}</span>
                      </div>
                    )}
                    
                    {/* Rating Badge */}
                    {item.vote_average > 0 && (
                      <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-md px-2 py-0.5 rounded-md flex items-center gap-1 border border-white/10 z-20">
                        <Star className="w-2.5 h-2.5 text-zinc-400 stroke-[1.5]" />
                        <span className="text-[10px] font-mono text-zinc-300">{item.vote_average.toFixed(1)}</span>
                      </div>
                    )}
                  </div>

                  {/* Title & Metadata */}
                  <div className="space-y-0.5 px-0.5">
                    <h3 className="text-xs font-semibold text-zinc-200 line-clamp-1 group-hover/item:text-white transition">
                      {item.title}
                    </h3>
                    <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-mono">
                      <span>{year}</span>
                      <span>·</span>
                      <span className="uppercase">Movie</span>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}

        {/* Load More Button */}
        {page < totalPages && (
          <div className="flex justify-center pt-6">
            <button
              onClick={loadMoreMovies}
              disabled={loadingMore}
              className="px-6 py-2.5 rounded-full bg-[#11131A] hover:bg-[#161922] border border-white/10 text-zinc-300 hover:text-white text-xs font-mono tracking-wider uppercase transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <span>{loadingMore ? 'LOADING...' : 'LOAD MORE'}</span>
              {!loadingMore && <ChevronDown className="w-3.5 h-3.5 stroke-[1.5]" />}
            </button>
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