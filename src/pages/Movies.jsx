import React, { useState, useEffect } from 'react';
import { fetchTrendingMovies, fetchPopularMovies, fetchTopRatedMovies } from '../services/tmdb';
import Hero from '../components/Hero';
import MediaRow from '../components/MediaRow';
import useDocumentTitle from '../hooks/useDocumentTitle';

const GENRES = [
  { id: 'all', name: 'All' },
  { id: 28, name: 'Action' },
  { id: 35, name: 'Comedy' },
  { id: 18, name: 'Drama' },
  { id: 27, name: 'Horror' },
];

export default function Movies() {
  useDocumentTitle('Movies');
  const [heroContent, setHeroContent] = useState(null);
  const [movies, setMovies] = useState([]);
  const [topRated, setTopRated] = useState([]);
  const [activeGenre, setActiveGenre] = useState('all');

  useEffect(() => {
    async function loadData() {
      try {
        const trending = await fetchTrendingMovies();
        const popular = await fetchPopularMovies();
        const rated = await fetchTopRatedMovies();

        if (trending && trending.length > 0) setHeroContent(trending[0]);
        setMovies(popular || []);
        setTopRated(rated || []);
      } catch (err) {
        console.error(err);
      }
    }
    loadData();
  }, []);

  const filteredMovies = activeGenre === 'all' 
    ? movies 
    : movies.filter(m => m.genre_ids && m.genre_ids.includes(Number(activeGenre)));

  return (
    <div className="min-h-screen bg-[#0B0D10] text-white">
      <Hero content={heroContent} />

      {/* Minimalist Genre Selector */}
      <div className="max-w-[1400px] mx-auto px-6 md:px-16 mt-12 mb-4">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-2">
          {GENRES.map((g) => {
            const isSelected = activeGenre === g.id;
            return (
              <button
                key={g.id}
                onClick={() => setActiveGenre(g.id)}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all flex-shrink-0 ${
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

      <div className="space-y-4 pb-20">
        <MediaRow 
          title={activeGenre === 'all' ? "Popular Movies" : "Filtered Selection"} 
          items={filteredMovies.length > 0 ? filteredMovies : movies} 
          type="movie" 
        />
        <MediaRow title="Top Rated Masterpieces" items={topRated} type="movie" />
      </div>
    </div>
  );
}