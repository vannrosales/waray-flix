import React, { useState, useEffect } from 'react';
import { fetchTrendingShows, fetchPopularShows, fetchTopRatedShows } from '../services/tmdb';
import Hero from '../components/Hero';
import MediaRow from '../components/MediaRow';
import useDocumentTitle from '../hooks/useDocumentTitle';

const TV_GENRES = [
  { id: 'all', name: 'All' },
  { id: 10759, name: 'Action' },
  { id: 35, name: 'Comedy' },
  { id: 18, name: 'Drama' },
  { id: 9648, name: 'Mystery' },
];

export default function TVShows() {
  useDocumentTitle('TV Shows');
  const [heroContent, setHeroContent] = useState(null);
  const [shows, setShows] = useState([]);
  const [topRatedShows, setTopRatedShows] = useState([]);
  const [activeGenre, setActiveGenre] = useState('all');

  useEffect(() => {
    async function loadData() {
      try {
        const trending = await fetchTrendingShows();
        const popular = await fetchPopularShows();
        const rated = await fetchTopRatedShows();

        if (trending && trending.length > 0) setHeroContent(trending[0]);
        setShows(popular || []);
        setTopRatedShows(rated || []);
      } catch (err) {
        console.error(err);
      }
    }
    loadData();
  }, []);

  const filteredShows = activeGenre === 'all'
    ? shows
    : shows.filter(s => s.genre_ids && s.genre_ids.includes(Number(activeGenre)));

  return (
    <div className="min-h-screen bg-[#0B0D10] text-white">
      <Hero content={heroContent} />

      {/* Minimalist Genre Selector */}
      <div className="max-w-[1400px] mx-auto px-6 md:px-16 mt-12 mb-4">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-2">
          {TV_GENRES.map((g) => {
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
          title={activeGenre === 'all' ? "Trending Series" : "Filtered Selection"} 
          items={filteredShows.length > 0 ? filteredShows : shows} 
          type="tv" 
        />
        <MediaRow title="Critically Acclaimed Series" items={topRatedShows} type="tv" />
      </div>
    </div>
  );
}