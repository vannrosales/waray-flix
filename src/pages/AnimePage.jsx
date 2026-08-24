import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CONFIG } from '../config/siteConfig';
import { getImageUrl } from '../services/tmdb';
import Hero from '../components/Hero';
import QuickViewModal from '../components/QuickViewModal';
import { Star, Sparkles, ChevronDown, SlidersHorizontal, Film } from 'lucide-react';
import useDocumentTitle from '../hooks/useDocumentTitle';

const BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY = CONFIG.tmdbApiKey;

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
  const navigate = useNavigate();
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
        const res = await fetch(`${BASE_URL}/discover/tv?api_key=${API_KEY}&with_keywords=210024|287501|284000${genreQuery}&sort_by=${sortBy}&page=1`);
        const data = await res.json();
        const results = data.results || [];
        
        setTotalPages(data.total_pages || 1);
        if (results.length > 0) {
          setHeroContent(results[0]);
          setAnimeList(results);
        } else {
          const fallbackRes = await fetch(`${BASE_URL}/discover/tv?api_key=${API_KEY}&with_genres=16${activeGenre !== 'all' ? `,${activeGenre}` : ''}&with_original_language=ja&sort_by=${sortBy}&page=1`);
          const fallbackData = await fallbackRes.json();
          const fallbackResults = fallbackData.results || [];
          if (fallbackResults.length > 0) {
            setHeroContent(fallbackResults[0]);
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
      const res = await fetch(`${BASE_URL}/discover/tv?api_key=${API_KEY}&with_keywords=210024|287501|284000${genreQuery}&sort_by=${sortBy}&page=${nextPage}`);
      const data = await res.json();
      
      setAnimeList(prev => [...prev, ...(data.results || [])]);
      setPage(nextPage);
    } catch (err) {
      console.error("Load more anime error:", err);
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#09090B] pb-24 select-none">
      
      {/* Featured Header Hero */}
      {heroContent && <Hero content={heroContent} />}

      {/* Main Container */}
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 mt-8 space-y-6">
        
        {/* Filter & Sort Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-black/[0.08] pb-4">
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#2563EB] stroke-[2]" />
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#09090B] font-['Outfit']">
                Anime Central
              </h1>
            </div>

            {/* Sort Dropdown */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
                className="appearance-none bg-white hover:bg-zinc-50 border border-black/10 text-[#09090B] text-xs font-mono py-1.5 pl-3 pr-8 rounded-full focus:outline-none focus:border-[#2563EB] transition cursor-pointer shadow-sm"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.id} value={opt.id} className="bg-white text-[#09090B]">
                    {opt.label}
                  </option>
                ))}
              </select>
              <SlidersHorizontal className="w-3 h-3 text-[#52525B] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Genre Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
            {ANIME_GENRES.map((g) => {
              const isSelected = activeGenre === g.id;
              return (
                <button
                  key={g.id}
                  onClick={() => { setActiveGenre(g.id); setPage(1); }}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all flex-shrink-0 cursor-pointer ${
                    isSelected 
                      ? 'bg-[#09090B] text-white font-bold shadow-sm' 
                      : 'bg-black/[0.04] text-[#52525B] hover:text-[#09090B] hover:bg-black/[0.08]'
                  }`}
                >
                  {g.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Anime Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {[...Array(15)].map((_, i) => (
              <div key={i} className="aspect-[2/3] rounded-2xl shimmer-skeleton-light" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-4">
            {animeList.map((item) => {
              const poster = getImageUrl(item.poster_path, 'posterSmall') || getImageUrl(item.backdrop_path, 'backdropSmall');
              const year = item.first_air_date?.substring(0, 4) || '2026';

              return (
                <div
                  key={item.id}
                  onClick={() => navigate(`/details/tv/${item.id}`)}
                  className="cursor-pointer group/item flex flex-col gap-2 flex-shrink-0 transition-all duration-200"
                >
                  {/* Poster Card */}
                  <div className="relative aspect-[2/3] w-full rounded-2xl overflow-hidden bg-white border border-black/[0.06] group-hover/item:border-[#2563EB]/40 transition-all duration-200 group-hover/item:scale-[1.02] shadow-sm hover:shadow-md">
                    {poster ? (
                      <img 
                        src={poster} 
                        alt={item.name} 
                        loading="lazy"
                        className="absolute inset-0 w-full h-full object-cover transition duration-300 group-hover/item:brightness-105"
                      />
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-3 text-center text-zinc-400 bg-zinc-100">
                        <Film className="w-6 h-6 mb-1 opacity-30 stroke-[1.5]" />
                        <span className="text-[9px] font-mono text-[#52525B]">{item.name}</span>
                      </div>
                    )}
                    
                    {/* Rating Badge */}
                    {item.vote_average > 0 && (
                      <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-md px-2 py-0.5 rounded-md flex items-center gap-1 border border-black/10 z-20 shadow-sm">
                        <Star className="w-2.5 h-2.5 text-[#2563EB] fill-[#2563EB] stroke-[1.5]" />
                        <span className="text-[10px] font-mono font-bold text-[#09090B]">{item.vote_average.toFixed(1)}</span>
                      </div>
                    )}
                  </div>

                  {/* Title & Metadata */}
                  <div className="space-y-0.5 px-0.5">
                    <h3 className="text-xs font-semibold text-[#09090B] line-clamp-1 group-hover/item:text-[#2563EB] transition">
                      {item.name}
                    </h3>
                    <div className="flex items-center gap-2 text-[10px] text-[#52525B] font-mono">
                      <span>{year}</span>
                      <span>·</span>
                      <span className="uppercase font-medium text-[#2563EB]">Anime</span>
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
              onClick={loadMoreAnime}
              disabled={loadingMore}
              className="px-6 py-2.5 rounded-full bg-[#09090B] hover:bg-black text-white text-xs font-mono tracking-wider uppercase transition flex items-center gap-2 cursor-pointer disabled:opacity-50 shadow-md"
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