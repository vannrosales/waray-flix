import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight } from 'lucide-react';
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
    let isMounted = true;

    async function loadContent() {
      try {
        if (!selectedNetwork) {
          // Phase 1: Critical Above-the-Fold (Immediate Hero & Primary Rows)
          const [movies, shows] = await Promise.all([
            fetchTrendingMovies(),
            fetchPopularShows(),
          ]);

          if (!isMounted) return;
          setTrendingMovies(movies || []);
          setPopularShows(shows || []);
          if (movies && movies.length > 0) {
            setHeroContent(movies[0]);
          }

          // Phase 2: Secondary Below-the-Fold Rows (Non-blocking background loading)
          Promise.all([
            fetchNowPlayingMovies(),
            fetchUpcomingMovies(),
            fetchTopRatedMovies(),
            fetchAiringTodayShows(),
            fetchTop10MoviesToday(),
            fetchTop10ShowsToday(),
          ]).then(([nowPlaying, upcoming, topRated, airingToday, top10Mov, top10Shw]) => {
            if (!isMounted) return;
            setNowPlayingMovies(nowPlaying || []);
            setUpcomingMovies(upcoming || []);
            setTopRatedMovies(topRated || []);
            setAiringTodayShows(airingToday || []);
            setTop10Movies(top10Mov || []);
            setTop10Shows(top10Shw || []);
          }).catch(err => console.error("Secondary row fetch error:", err));

        } else {
          const results = selectedNetwork.type === 'provider'
            ? await fetchMediaByProvider(selectedNetwork.code, 'movie')
            : await fetchMediaByCompany(selectedNetwork.code);
          
          if (!isMounted) return;
          const list = results || [];
          setTrendingMovies(list);
          setPopularShows(list);
          if (list.length > 0) setHeroContent(list[0]);
        }
      } catch (err) {
        console.error("Home loading error:", err);
      }
    }

    loadContent();
    return () => {
      isMounted = false;
    };
  }, [selectedNetwork]);

  return (
    <div className="min-h-screen bg-[#0F0F12] text-[#F4F4F5] pb-16 select-none">
      
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

      {/* ─── Road to Avengers: Doomsday Interactive Roadmap Banner ─── */}
      {!selectedNetwork && (
        <div className="px-6 md:px-12 my-6 max-w-[1440px] mx-auto">
          <Link
            to="/timeline/mcu-doomsday"
            className="group block relative rounded-3xl overflow-hidden p-6 sm:p-8 border border-white/[0.08] bg-[#18181C] hover:border-white/30 shadow-sm hover:shadow-md transition-all duration-300"
          >
            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white text-[10px] font-mono uppercase tracking-widest font-bold border border-white/15">
                  <Sparkles className="w-3.5 h-3.5 stroke-[2]" />
                  <span>CHRONOLOGICAL STORYLINE ROADMAP</span>
                </div>

                <h3 className="text-xl sm:text-2xl md:text-3xl font-bold font-['Outfit'] tracking-tight text-white group-hover:text-zinc-200 transition">
                  Road to Avengers: Doomsday
                </h3>

                <p className="text-xs sm:text-sm text-zinc-400 font-normal leading-relaxed">
                  The complete 15-chapter prep guide from Mutant Genesis to Multiversal Incursions. Check off watched titles, stream trailers, and prepare for the main event.
                </p>
              </div>

              <div className="flex items-center gap-3 flex-shrink-0 self-start md:self-center">
                <div className="px-6 py-3 rounded-full bg-white group-hover:bg-zinc-200 text-black text-xs font-semibold uppercase tracking-wider transition flex items-center gap-2 shadow-sm group-hover:scale-105">
                  <span>Open Roadmap</span>
                  <ArrowRight className="w-3.5 h-3.5 stroke-[2]" />
                </div>
              </div>
            </div>
          </Link>
        </div>
      )}

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