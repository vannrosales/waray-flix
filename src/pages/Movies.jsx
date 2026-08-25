import React, { useState, useEffect } from 'react';
import { CONFIG } from '../config/siteConfig';
import Hero from '../components/Hero';
import QuickViewModal from '../components/QuickViewModal';
import GenreFilterPills from '../components/common/GenreFilterPills';
import SortDropdown from '../components/common/SortDropdown';
import MediaGrid from '../components/common/MediaGrid';
import { ChevronDown } from 'lucide-react';
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
        console.error("Movie catalog error:", err);
      } finally {
        setLoading(false);
      }
    }

    loadMovies();
  }, [activeGenre, sortBy]);

  const loadMoreMovies = async () => {
    if (page >= totalPages || loadingMore) return;
    try {
      setLoadingMore(true);
      const nextPage = page + 1;
      const genreQuery = activeGenre === 'all' ? '' : `&with_genres=${activeGenre}`;
      const res = await fetch(`${BASE_URL}/discover/movie?api_key=${API_KEY}&sort_by=${sortBy}${genreQuery}&page=${nextPage}`);
      const data = await res.json();
      
      setMovies(prev => [...prev, ...(data.results || [])]);
      setPage(nextPage);
    } catch (err) {
      console.error("Load more movies error:", err);
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#000000] text-[#FFFFFF] pb-24 select-none">
      
      {/* Featured Header Hero */}
      {heroContent && <Hero content={heroContent} />}

      {/* Catalog Main Container */}
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 mt-8 space-y-6">
        
        {/* Filter & Sort Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
          <div className="flex items-center gap-4">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Feature Films
            </h1>
            <SortDropdown
              options={SORT_OPTIONS}
              value={sortBy}
              onChange={(newSort) => { setSortBy(newSort); setPage(1); }}
            />
          </div>

          <GenreFilterPills
            genres={MOVIE_GENRES}
            activeGenre={activeGenre}
            onSelect={(newGenre) => { setActiveGenre(newGenre); setPage(1); }}
          />
        </div>

        {/* Movies Grid */}
        <MediaGrid
          items={movies}
          loading={loading}
          mediaType="movie"
          onQuickView={setQuickMedia}
          skeletonCount={15}
          emptyMessage="No feature films found for this category."
        />

        {/* Load More Button */}
        {page < totalPages && (
          <div className="flex justify-center pt-6">
            <button
              onClick={loadMoreMovies}
              disabled={loadingMore}
              className="px-6 py-2.5 rounded-full bg-white hover:bg-zinc-200 text-black text-xs font-mono tracking-wider uppercase transition flex items-center gap-2 cursor-pointer disabled:opacity-50 shadow-md hover:scale-105"
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
