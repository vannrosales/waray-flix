import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CONFIG } from '../config/siteConfig';
import { IMAGE_BASE_URL } from '../services/tmdb';
import Hero from '../components/Hero';
import { Star, Play, Film, ChevronDown } from 'lucide-react';
import useDocumentTitle from '../hooks/useDocumentTitle';

const BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY = CONFIG.tmdbApiKey;

export default function AnimePage() {
  const navigate = useNavigate();
  const [animeList, setAnimeList] = useState([]);
  const [heroContent, setHeroContent] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  useDocumentTitle('WarayFlix — Anime');

  useEffect(() => {
    async function fetchInitialAnime() {
      try {
        setLoading(true);
        const res = await fetch(`${BASE_URL}/discover/tv?api_key=${API_KEY}&with_genres=16&sort_by=popularity.desc&page=1`);
        const data = await res.json();
        const results = data.results || [];
        
        setTotalPages(data.total_pages || 1);
        if (results.length > 0) {
          setHeroContent(results[0]);
          setAnimeList(results.slice(1));
        }
      } catch (err) {
        console.error("Error fetching anime:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchInitialAnime();
  }, []);

  const loadMoreAnime = async () => {
    if (page >= totalPages) return;
    try {
      setLoadingMore(true);
      const nextPage = page + 1;
      const res = await fetch(`${BASE_URL}/discover/tv?api_key=${API_KEY}&with_genres=16&sort_by=popularity.desc&page=${nextPage}`);
      const data = await res.json();
      
      setAnimeList((prev) => [...prev, ...(data.results || [])]);
      setPage(nextPage);
    } catch (err) {
      console.error("Error loading more anime:", err);
    } finally {
      setLoadingMore(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0D10] flex items-center justify-center text-zinc-600 font-mono text-xs">
        INITIALIZING_ANIME_NODE_
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0D10] text-white selection:bg-white selection:text-black">
      
      {/* Cinematic Hero Section */}
      {heroContent && <Hero content={heroContent} />}

      {/* Main Grid Section */}
      <div className="max-w-[1400px] mx-auto px-6 md:px-16 py-16 space-y-12">
        
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 uppercase tracking-widest">
            <Film className="w-4 h-4 text-white" />
            <span>Curated Animation Stream</span>
          </div>
          <span className="text-xs font-mono text-zinc-600">GENRE // 16</span>
        </div>

        {/* Anime Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {animeList.map((item) => {
            const poster = item.poster_path ? `${IMAGE_BASE_URL}${item.poster_path}` : null;
            const year = item.first_air_date?.substring(0, 4) || '2026';
            
            return (
              <div
                key={item.id}
                onClick={() => navigate(`/details/tv/${item.id}`)}
                className="group relative bg-[#1D2128]/20 hover:bg-[#1D2128]/60 rounded-2xl p-3 border border-white/5 cursor-pointer transition-all duration-300 space-y-3"
              >
                {/* Poster Container */}
                <div className="aspect-[2/3] w-full rounded-xl bg-[#0B0D10] overflow-hidden relative">
                  {poster ? (
                    <img 
                      src={poster} 
                      alt={item.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-700 text-xs font-mono">
                      NO_POSTER
                    </div>
                  )}

                  {/* Hover Overlay Play Icon */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition">
                      <Play className="w-4 h-4 fill-current ml-0.5" />
                    </div>
                  </div>
                </div>

                {/* Metadata */}
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

        {/* Load More Action Button */}
        {page < totalPages && (
          <div className="flex justify-center pt-8">
            <button
              onClick={loadMoreAnime}
              disabled={loadingMore}
              className="px-8 py-3 rounded-full bg-[#1D2128]/60 hover:bg-[#1D2128] border border-white/10 hover:border-white/20 text-zinc-300 hover:text-white text-xs font-mono tracking-widest uppercase transition-all duration-300 flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <span>{loadingMore ? 'LOADING_MORE...' : 'LOAD MORE ANIME'}</span>
              {!loadingMore && <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        )}

      </div>

    </div>
  );
}