import React, { useState, useEffect } from 'react';
import { fetchTrendingMovies, fetchPopularShows, fetchMediaByProvider, fetchMediaByCompany } from '../services/tmdb';
import Hero from '../components/Hero';
import MediaRow from '../components/MediaRow';
import NetworkSelector from '../components/NetworkSelector';
import ContinueWatchingRow from '../components/ContinueWatchingRow';
import MyListRow from '../components/MyListRow';

export default function Home() {
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [popularShows, setPopularShows] = useState([]);
  const [heroContent, setHeroContent] = useState(null);
  const [selectedNetwork, setSelectedNetwork] = useState(null);
  
  const [continueWatchingList, setContinueWatchingList] = useState([]);

  // Load user watch history strictly from localStorage (on your end only)
  useEffect(() => {
    try {
      const savedHistory = JSON.parse(localStorage.getItem('warayflix_watch_history') || '[]');
      setContinueWatchingList(savedHistory);
    } catch (e) {
      console.error('Failed to load watch history:', e);
    }
  }, []);

  // Handle removing a single item from local continue watching history
  const handleRemoveHistory = (id) => {
    const updated = continueWatchingList.filter(item => item.id !== id);
    setContinueWatchingList(updated);
    try {
      localStorage.setItem('warayflix_watch_history', JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to update watch history:', e);
    }
  };

  useEffect(() => {
    async function load() {
      try {
        if (!selectedNetwork) {
          const movies = await fetchTrendingMovies();
          const shows = await fetchPopularShows();
          setTrendingMovies(movies);
          setPopularShows(shows);
          if (movies.length > 0) setHeroContent(movies[0]);
        } else {
          const results = selectedNetwork.type === 'provider'
            ? await fetchMediaByProvider(selectedNetwork.code, 'movie')
            : await fetchMediaByCompany(selectedNetwork.code);
          
          setTrendingMovies(results);
          setPopularShows(results);
          if (results.length > 0) setHeroContent(results[0]);
        }
      } catch (err) {
        console.error(err);
      }
    }
    load();
  }, [selectedNetwork]);

  return (
    <div className="min-h-screen bg-[#0B0D10] text-[#F3F4F4]">
      <Hero content={heroContent} />
      
      {/* Network / Studio Selector Pill Hub */}
      <NetworkSelector 
        selectedId={selectedNetwork?.code || null} 
        onSelect={(net) => setSelectedNetwork(net)} 
      />

      <div className="space-y-4 pb-12">
        {continueWatchingList.length > 0 && !selectedNetwork && (
          <ContinueWatchingRow 
            items={continueWatchingList} 
            onRemove={handleRemoveHistory} 
          />
        )}

        {/* My Saved List Row */}
        {!selectedNetwork && <MyListRow />}

        <MediaRow title={selectedNetwork ? `${selectedNetwork.name} Selection` : "Trending Movies"} items={trendingMovies} type="movie" />
        <MediaRow title={selectedNetwork ? `${selectedNetwork.name} Series` : "Popular TV Shows"} items={popularShows} type="tv" />
      </div>
    </div>
  );
}