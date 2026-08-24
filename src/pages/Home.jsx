import React, { useState, useEffect } from 'react';
import { 
  fetchTrendingMovies, 
  fetchPopularShows, 
  fetchMediaByProvider, 
  fetchMediaByCompany,
  fetchNowPlayingMovies,
  fetchUpcomingMovies,
  fetchTopRatedMovies,
  fetchAiringTodayShows,
  fetchTop10MoviesToday,
  fetchTop10ShowsToday
} from '../services/tmdb';
import Hero from '../components/Hero';
import MediaRow from '../components/MediaRow';
import NetworkSelector from '../components/NetworkSelector';
import ContinueWatchingRow from '../components/ContinueWatchingRow';
import MyListRow from '../components/MyListRow';
import RecommendedRow from '../components/RecommendedRow';

export default function Home() {
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [popularShows, setPopularShows] = useState([]);
  const [nowPlayingMovies, setNowPlayingMovies] = useState([]);
  const [upcomingMovies, setUpcomingMovies] = useState([]);
  const [topRatedMovies, setTopRatedMovies] = useState([]);
  const [airingTodayShows, setAiringTodayShows] = useState([]);
  const [top10Movies, setTop10Movies] = useState([]);
  const [top10Shows, setTop10Shows] = useState([]);

  const [heroContent, setHeroContent] = useState(null);
  const [selectedNetwork, setSelectedNetwork] = useState(null);
  const [continueWatchingList, setContinueWatchingList] = useState([]);
  
  useEffect(() => {
    try {
      const savedHistory = JSON.parse(localStorage.getItem('warayflix_watch_history') || '[]');
      setContinueWatchingList(savedHistory);
    } catch (e) {
      console.error('Failed to load watch history:', e);
    }
  }, []);

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
    async function loadAllContent() {
      try {
        if (!selectedNetwork) {
          const [
            movies, 
            shows, 
            nowPlaying, 
            upcoming, 
            topRated, 
            airingToday,
            top10Mov,
            top10Shw
          ] = await Promise.all([
            fetchTrendingMovies(),
            fetchPopularShows(),
            fetchNowPlayingMovies(),
            fetchUpcomingMovies(),
            fetchTopRatedMovies(),
            fetchAiringTodayShows(),
            fetchTop10MoviesToday(),
            fetchTop10ShowsToday()
          ]);

          setTrendingMovies(movies || []);
          setPopularShows(shows || []);
          setNowPlayingMovies(nowPlaying || []);
          setUpcomingMovies(upcoming || []);
          setTopRatedMovies(topRated || []);
          setAiringTodayShows(airingToday || []);
          setTop10Movies(top10Mov || []);
          setTop10Shows(top10Shw || []);

          if (movies && movies.length > 0) {
            setHeroContent(movies[0]);
          }
        } else {
          const results = selectedNetwork.type === 'provider'
            ? await fetchMediaByProvider(selectedNetwork.code, 'movie')
            : await fetchMediaByCompany(selectedNetwork.code);
          
          const list = results || [];
          setTrendingMovies(list);
          setPopularShows(list);
          if (list.length > 0) setHeroContent(list[0]);
        }
      } catch (err) {
        console.error("Home loading error:", err);
      }
    }

    loadAllContent();
  }, [selectedNetwork]);

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#09090B] pb-16 select-none">
      
      {/* Featured Dynamic Carousel Hero */}
      <Hero 
        content={heroContent} 
        items={trendingMovies.slice(0, 5)} 
      />
      
      {/* Network / Studio Selector Pill Hub */}
      <NetworkSelector 
        selectedId={selectedNetwork?.code || null} 
        onSelect={(net) => setSelectedNetwork(net)} 
      />

      {/* Main Content Rows */}
      <div className="space-y-2">
        {/* Continue Watching Row */}
        {continueWatchingList.length > 0 && !selectedNetwork && (
          <ContinueWatchingRow 
            items={continueWatchingList} 
            onRemove={handleRemoveHistory} 
          />
        )}

        {/* My Saved Watchlist */}
        {!selectedNetwork && <MyListRow />}

        {/* Personalized AI Taste Match Recommendations */}
        {!selectedNetwork && <RecommendedRow />}

        {/* Top 10 Today Rows */}
        <MediaRow 
          title="Top 10 Movies Today" 
          subtitle="The most streamed feature films today"
          items={top10Movies} 
          type="movie" 
        />

        <MediaRow 
          title="Top 10 Series Today" 
          subtitle="Top trending television shows & seasons"
          items={top10Shows} 
          type="tv" 
        />

        {/* Catalog Categories */}
        <MediaRow 
          title="Trending Movies" 
          subtitle="Global audience picks this week"
          items={trendingMovies} 
          type="movie" 
        />

        <MediaRow 
          title="Popular Series" 
          subtitle="Critically acclaimed television shows"
          items={popularShows} 
          type="tv" 
        />

        <MediaRow 
          title="In Theaters" 
          subtitle="Current theatrical releases"
          items={nowPlayingMovies} 
          type="movie" 
        />

        <MediaRow 
          title="Upcoming Releases" 
          subtitle="Anticipated films coming soon"
          items={upcomingMovies} 
          type="movie" 
        />

        <MediaRow 
          title="Top Rated Classics" 
          subtitle="All-time highest rated films"
          items={topRatedMovies} 
          type="movie" 
        />

        <MediaRow 
          title="Airing Today" 
          subtitle="New episodes broadcasting today"
          items={airingTodayShows} 
          type="tv" 
        />
      </div>

    </div>
  );
}