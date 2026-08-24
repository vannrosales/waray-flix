import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, Play, Trash2, Film, Clock, Star, X, Compass, Search } from 'lucide-react';
import { storageService } from '../services/storageService';
import { getImageUrl } from '../services/tmdb';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { useAuth } from '../context/AuthContext';

export default function WatchlistPage() {
  useDocumentTitle('My Library & Watchlist — WarayFlix');
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'movie' | 'tv'
  const [searchQuery, setSearchQuery] = useState('');
  const [watchlist, setWatchlist] = useState(() => storageService.getPlaylist());
  const [history, setHistory] = useState(() => storageService.getHistory());

  // Load playlist and watch history
  const loadData = () => {
    setWatchlist(storageService.getPlaylist());
    setHistory(storageService.getHistory());
  };

  useEffect(() => {
    loadData();
    if (user?.id) {
      storageService.fetchCloudPlaylist(user.id);
      storageService.fetchCloudHistory(user.id);
    }

    window.addEventListener('playlistUpdated', loadData);
    window.addEventListener('historyUpdated', loadData);

    return () => {
      window.removeEventListener('playlistUpdated', loadData);
      window.removeEventListener('historyUpdated', loadData);
    };
  }, [user?.id]);

  const handleRemoveFromWatchlist = async (media) => {
    await storageService.togglePlaylistItem(media, user?.id);
  };

  const handleRemoveFromHistory = async (mediaId) => {
    await storageService.removeFromHistory(mediaId, user?.id);
  };

  const handleClearHistory = async () => {
    if (window.confirm('Clear all in-progress watch history?')) {
      await storageService.clearHistory(user?.id);
    }
  };

  // Filter watchlist items
  const filteredWatchlist = watchlist.filter((item) => {
    const matchesTab = 
      activeTab === 'all' 
        ? true 
        : activeTab === 'movie' 
        ? (item.media_type === 'movie' || (!item.first_air_date && !item.name)) 
        : (item.media_type === 'tv' || Boolean(item.first_air_date));

    const matchesSearch = searchQuery.trim() === '' 
      ? true 
      : (item.title || item.name || '').toLowerCase().includes(searchQuery.toLowerCase());

    return matchesTab && matchesSearch;
  });

  const movieCount = watchlist.filter(i => i.media_type === 'movie' || (!i.first_air_date && !i.name)).length;
  const tvCount = watchlist.filter(i => i.media_type === 'tv' || Boolean(i.first_air_date)).length;

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#09090B] pt-24 sm:pt-28 pb-20 px-6 md:px-12 max-w-[1440px] mx-auto space-y-12 select-none">
      
      {/* Header Banner */}
      <div className="border-b border-black/[0.08] pb-8 space-y-2">
        <div className="flex items-center gap-2 text-xs font-mono text-[#52525B] uppercase tracking-widest">
          <Bookmark className="w-3.5 h-3.5 stroke-[2] text-[#2563EB]" />
          <span>PERSONAL CINEMA LIBRARY</span>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#09090B] font-['Outfit'] tracking-tight">
          Watchlist & History
        </h1>
        <p className="text-xs sm:text-sm text-[#52525B] font-normal max-w-xl">
          Your saved titles and resume points, synchronized across your devices.
        </p>
      </div>

      {/* Section 1: Continue Watching (In-Progress Sessions) */}
      {history.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#2563EB] stroke-[2]" />
              <h2 className="text-base sm:text-lg font-bold text-[#09090B] font-['Outfit']">
                Continue Watching ({history.length})
              </h2>
            </div>
            <button
              onClick={handleClearHistory}
              className="text-[11px] font-mono text-[#52525B] hover:text-red-600 transition cursor-pointer"
            >
              Clear History
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {history.map((item) => {
              const poster = getImageUrl(item.poster_path || item.backdrop_path, 'posterSmall');
              const progressPercent = item.totalSeconds > 0 
                ? Math.min(100, Math.round((item.lastWatchedSeconds / item.totalSeconds) * 100))
                : 0;

              const watchUrl = item.type === 'tv'
                ? `/watch/tv/${item.id}/${item.season || 1}/${item.episode || 1}?startAt=${item.lastWatchedSeconds || 0}`
                : `/watch/movie/${item.id}?startAt=${item.lastWatchedSeconds || 0}`;

              return (
                <div 
                  key={item.id}
                  className="group relative rounded-2xl bg-white border border-black/[0.06] hover:border-[#2563EB]/40 p-3.5 space-y-3 transition duration-200 shadow-sm hover:shadow-md"
                >
                  <div className="flex gap-3.5">
                    {/* Thumbnail */}
                    <div className="relative w-18 sm:w-20 aspect-[2/3] rounded-xl overflow-hidden bg-zinc-100 flex-shrink-0 border border-black/10">
                      {poster ? (
                        <img src={poster} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-400">
                          <Film className="w-5 h-5 stroke-[1.5]" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                      <div className="space-y-1">
                        <span className="text-[10px] font-mono text-[#52525B] uppercase tracking-wider block font-semibold">
                          {item.type === 'tv' ? `S${item.season || 1} E${item.episode || 1}` : 'MOVIE'}
                        </span>
                        <h3 className="text-sm font-semibold text-[#09090B] truncate font-['Outfit'] leading-tight">
                          {item.title || item.name || 'Untitled Stream'}
                        </h3>
                      </div>

                      {/* Progress Bar & Actions */}
                      <div className="space-y-2">
                        {progressPercent > 0 && (
                          <div className="space-y-1">
                            <div className="w-full h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-[#2563EB] transition-all duration-300"
                                style={{ width: `${progressPercent}%` }}
                              />
                            </div>
                            <span className="text-[9px] font-mono text-[#52525B] block font-medium">
                              {progressPercent}% completed
                            </span>
                          </div>
                        )}

                        <div className="flex items-center gap-2">
                          <Link
                            to={watchUrl}
                            className="flex-1 py-1.5 px-3 rounded-xl bg-[#2563EB] text-white text-[11px] font-semibold font-mono uppercase tracking-wider flex items-center justify-center gap-1.5 transition hover:bg-[#1D4ED8] shadow-sm"
                          >
                            <Play className="w-3 h-3 stroke-[2] fill-white" />
                            <span>Resume</span>
                          </Link>

                          <button
                            onClick={() => handleRemoveFromHistory(item.id)}
                            className="p-1.5 rounded-xl bg-black/[0.04] hover:bg-red-50 text-[#52525B] hover:text-red-600 border border-black/[0.08] transition cursor-pointer"
                            title="Remove from history"
                          >
                            <X className="w-3.5 h-3.5 stroke-[1.5]" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Section 2: Saved Watchlist */}
      <section className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-black/[0.08] pb-4">
          
          {/* Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 rounded-full text-xs font-mono transition cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-[#09090B] text-white font-semibold shadow-sm'
                  : 'bg-black/[0.04] hover:bg-black/[0.08] text-[#52525B] hover:text-[#09090B] border border-black/[0.08]'
              }`}
            >
              All ({watchlist.length})
            </button>

            <button
              onClick={() => setActiveTab('movie')}
              className={`px-4 py-2 rounded-full text-xs font-mono transition cursor-pointer ${
                activeTab === 'movie'
                  ? 'bg-[#09090B] text-white font-semibold shadow-sm'
                  : 'bg-black/[0.04] hover:bg-black/[0.08] text-[#52525B] hover:text-[#09090B] border border-black/[0.08]'
              }`}
            >
              Movies ({movieCount})
            </button>

            <button
              onClick={() => setActiveTab('tv')}
              className={`px-4 py-2 rounded-full text-xs font-mono transition cursor-pointer ${
                activeTab === 'tv'
                  ? 'bg-[#09090B] text-white font-semibold shadow-sm'
                  : 'bg-black/[0.04] hover:bg-black/[0.08] text-[#52525B] hover:text-[#09090B] border border-black/[0.08]'
              }`}
            >
              Series ({tvCount})
            </button>
          </div>

          {/* Library Search */}
          {watchlist.length > 0 && (
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#52525B] stroke-[1.5]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter saved titles..."
                className="w-full bg-white border border-black/[0.08] rounded-full pl-9 pr-4 py-1.5 text-xs text-[#09090B] placeholder-[#52525B] focus:outline-none focus:border-[#2563EB] font-sans shadow-sm"
              />
            </div>
          )}
        </div>

        {/* Watchlist Grid */}
        {filteredWatchlist.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
            {filteredWatchlist.map((item) => {
              const poster = getImageUrl(item.poster_path, 'poster');
              const itemType = item.media_type || (item.first_air_date ? 'tv' : 'movie');
              const releaseYear = (item.release_date || item.first_air_date || '').substring(0, 4);

              return (
                <div 
                  key={item.id}
                  className="group relative flex flex-col space-y-2 select-none"
                >
                  {/* Poster Card */}
                  <div className="relative aspect-[2/3] w-full rounded-2xl overflow-hidden bg-white border border-black/[0.06] group-hover:border-[#2563EB]/40 transition-all duration-300 shadow-sm hover:shadow-md">
                    {poster ? (
                      <img
                        src={poster}
                        alt={item.title || item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-zinc-400 gap-2 bg-zinc-100">
                        <Film className="w-8 h-8 opacity-30 stroke-[1.5]" />
                        <span className="text-[9px] font-mono">NO POSTER</span>
                      </div>
                    )}

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-3">
                      
                      {/* Top Remove Button */}
                      <div className="flex justify-end">
                        <button
                          onClick={() => handleRemoveFromWatchlist(item)}
                          className="p-1.5 rounded-full bg-black/80 hover:bg-black text-white transition cursor-pointer backdrop-blur-md shadow-sm"
                          title="Remove from Watchlist"
                        >
                          <Trash2 className="w-3.5 h-3.5 stroke-[1.5]" />
                        </button>
                      </div>

                      {/* Play CTA */}
                      <Link
                        to={`/details/${itemType}/${item.id}`}
                        className="w-full py-2 rounded-xl bg-[#2563EB] text-white font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-lg hover:bg-[#1D4ED8] transition"
                      >
                        <Play className="w-3.5 h-3.5 stroke-[2] fill-white text-white" />
                        <span>Watch</span>
                      </Link>
                    </div>

                    {/* Media Type Chip */}
                    <div className="absolute top-2.5 left-2.5">
                      <span className="px-2 py-0.5 rounded bg-[#09090B] text-white text-[9px] font-mono uppercase tracking-wider font-semibold">
                        {itemType}
                      </span>
                    </div>
                  </div>

                  {/* Title & Metadata */}
                  <div className="space-y-0.5">
                    <h3 className="text-xs sm:text-sm font-medium text-[#09090B] truncate font-['Outfit'] group-hover:text-[#2563EB] transition">
                      {item.title || item.name}
                    </h3>
                    <div className="flex items-center gap-2 text-[10px] font-mono text-[#52525B]">
                      {releaseYear && <span>{releaseYear}</span>}
                      {item.vote_average > 0 && (
                        <>
                          <span>·</span>
                          <span className="flex items-center gap-0.5 text-[#09090B] font-bold">
                            <Star className="w-2.5 h-2.5 text-[#2563EB] fill-[#2563EB] stroke-[1.5]" />
                            {item.vote_average.toFixed(1)}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Empty State */
          <div className="py-20 flex flex-col items-center justify-center text-center space-y-4 border border-black/[0.06] rounded-3xl bg-white p-8 shadow-sm">
            <div className="w-14 h-14 rounded-2xl bg-black/[0.04] border border-black/[0.08] flex items-center justify-center">
              <Bookmark className="w-6 h-6 text-[#2563EB] stroke-[2]" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-[#09090B] font-['Outfit']">
                {searchQuery ? 'No matching titles found' : 'Your Watchlist is Empty'}
              </h3>
              <p className="text-xs text-[#52525B] font-normal max-w-sm">
                {searchQuery 
                  ? `No titles match "${searchQuery}". Try searching for another movie or show.`
                  : 'Save movies and series you want to watch later and they will appear here.'}
              </p>
            </div>
            {!searchQuery && (
              <Link
                to="/movies"
                className="px-6 py-2.5 rounded-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold text-xs uppercase tracking-wider flex items-center gap-2 transition shadow-md"
              >
                <Compass className="w-3.5 h-3.5 stroke-[2]" />
                <span>Explore Movies</span>
              </Link>
            )}
          </div>
        )}
      </section>

    </div>
  );
}
