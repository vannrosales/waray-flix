import React, { useState, useEffect } from 'react';
import { CONFIG } from '../config/siteConfig';
import Hero from '../components/Hero';
import QuickViewModal from '../components/QuickViewModal';
import GenreFilterPills from '../components/common/GenreFilterPills';
import SortDropdown from '../components/common/SortDropdown';
import MediaGrid from '../components/common/MediaGrid';
import { Sparkles, ChevronDown } from 'lucide-react';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { filterSafeMedia } from '../utils/formatters';

const BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY = CONFIG.tmdbApiKey;
const ADULT_EXCLUSION = '&include_adult=false&without_keywords=208298,228965,190370,180540,158718,274154,240303,9799,232598&vote_count.gte=30';

const ANIME_GENRES = [
  { id: 'all', name: 'All' },
  { id: 10759, name: 'Action & Shonen' },
  { id: 10765, name: 'Fantasy & Isekai' },
  { id: 35, name: 'Comedy' },
  { id: 18, name: 'Drama' },
  { id: 9648, name: 'Mystery' },
];

const SORT_OPTIONS = [
  { id: 'popularity.desc', label: 'Most Popular' },
  { id: 'vote_average.desc&vote_count.gte=100', label: 'Top Rated' },
  { id: 'first_air_date.desc', label: 'Newest Seasons' },
];

export default function AnimePage() {
  useDocumentTitle('Anime — WarayFlix');
  const [animeList, setAnimeList] = useState([]);
  const [heroContent, setHeroContent] = useState(null);
  const [activeGenre, setActiveGenre] = useState('all');
  const [sortBy, setSortBy] = useState('popularity.desc');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [quickMedia, setQuickMedia] = useState(null);

  useEffect(() => {
    async function fetchAnime() {
      try {
        setLoading(true);
        const genreQuery = activeGenre === 'all' ? '&with_genres=16' : `&with_genres=16,${activeGenre}`;
        const res = await fetch(`${BASE_URL}/discover/tv?api_key=${API_KEY}&with_keywords=210024|287501|284000${genreQuery}&sort_by=${sortBy}&page=1${ADULT_EXCLUSION}`);
        const data = await res.json();
        const results = filterSafeMedia(data.results || []);
        
        setTotalPages(data.total_pages || 1);
        if (results.length > 0) {
          const heroCandidate = results.find(item => item.backdrop_path && (item.vote_count >= 100 || item.vote_average >= 7.0)) || results[0];
          setHeroContent(heroCandidate);
          setAnimeList(results);
        } else {
          const fallbackRes = await fetch(`${BASE_URL}/discover/tv?api_key=${API_KEY}&with_genres=16${activeGenre !== 'all' ? `,${activeGenre}` : ''}&with_original_language=ja&sort_by=${sortBy}&page=1${ADULT_EXCLUSION}`);
          const fallbackData = await fallbackRes.json();
          const fallbackResults = filterSafeMedia(fallbackData.results || []);
          if (fallbackResults.length > 0) {
            const heroCandidate = fallbackResults.find(item => item.backdrop_path && (item.vote_count >= 100 || item.vote_average >= 7.0)) || fallbackResults[0];
            setHeroContent(heroCandidate);
            setAnimeList(fallbackResults);
          } else {
            setAnimeList([]);
          }
        }
      } catch (err) {
        console.error("Error fetching anime:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchAnime();
  }, [activeGenre, sortBy]);

  const loadMoreAnime = async () => {
    if (page >= totalPages || loadingMore) return;
    try {
      setLoadingMore(true);
      const nextPage = page + 1;
      const genreQuery = activeGenre === 'all' ? '&with_genres=16' : `&with_genres=16,${activeGenre}`;
      const res = await fetch(`${BASE_URL}/discover/tv?api_key=${API_KEY}&with_keywords=210024|287501|284000${genreQuery}&sort_by=${sortBy}&page=${nextPage}${ADULT_EXCLUSION}`);
      const data = await res.json();
      const safeNewItems = filterSafeMedia(data.results || []);
      
      setAnimeList(prev => [...prev, ...safeNewItems]);
      setPage(nextPage);
    } catch (err) {
      console.error("Load more anime error:", err);
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#000000] text-[#FFFFFF] pb-24 select-none">
      
      {/* Featured Header Hero */}
      {heroContent && <Hero content={heroContent} />}

      {/* Main Container */}
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 mt-8 space-y-6">
        
        {/* Filter & Sort Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-white stroke-[2]" />
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                Anime Central
              </h1>
            </div>

            <SortDropdown
              options={SORT_OPTIONS}
              value={sortBy}
              onChange={(newSort) => { setSortBy(newSort); setPage(1); }}
            />
          </div>

          <GenreFilterPills
            genres={ANIME_GENRES}
            activeGenre={activeGenre}
            onSelect={(newGenre) => { setActiveGenre(newGenre); setPage(1); }}
          />
        </div>

        {/* Anime Grid */}
        <MediaGrid
          items={animeList}
          loading={loading}
          mediaType="tv"
          onQuickView={setQuickMedia}
          skeletonCount={15}
          emptyMessage="No anime found for this category."
        />

        {/* Load More Button */}
        {page < totalPages && (
          <div className="flex justify-center pt-6">
            <button
              onClick={loadMoreAnime}
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
          type="tv"
          isOpen={Boolean(quickMedia)}
          onClose={() => setQuickMedia(null)}
        />
      )}
    </div>
  );
}
