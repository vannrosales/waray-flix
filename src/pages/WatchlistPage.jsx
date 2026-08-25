import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bookmark } from 'lucide-react';
import { storageService } from '../services/storageService';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { useAuth } from '../context/AuthContext';
import EmptyState from '../components/common/EmptyState';
import WatchlistHistorySection from '../components/watchlist/WatchlistHistorySection';
import WatchlistFilterBar from '../components/watchlist/WatchlistFilterBar';
import WatchlistCard from '../components/watchlist/WatchlistCard';

export default function WatchlistPage() {
  useDocumentTitle('My Library & Watchlist — WarayFlix');
  const navigate = useNavigate();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'movie' | 'tv'
  const [searchQuery, setSearchQuery] = useState('');
  const [watchlist, setWatchlist] = useState(() => storageService.getPlaylist());
  const [history, setHistory] = useState(() => storageService.getHistory());

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

  const handleRemoveFromWatchlist = async (e, media) => {
    e.stopPropagation();
    await storageService.togglePlaylistItem(media, user?.id);
    loadData();
  };

  const handleRemoveFromHistory = async (e, mediaId) => {
    e.stopPropagation();
    await storageService.removeFromHistory(mediaId, user?.id);
    loadData();
  };

  const handleClearHistory = async () => {
    if (window.confirm('Clear all in-progress watch history?')) {
      await storageService.clearHistory(user?.id);
      loadData();
    }
  };

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
    <div className="min-h-screen bg-[#0F0F12] text-[#F4F4F5] pt-24 sm:pt-28 pb-20 px-6 md:px-12 max-w-[1440px] mx-auto space-y-12 select-none">
      {/* Header Banner */}
      <div className="border-b border-white/[0.08] pb-8 space-y-2">
        <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 uppercase tracking-widest font-semibold">
          <Bookmark className="w-3.5 h-3.5 stroke-[2] text-white" />
          <span>PERSONAL CINEMA LIBRARY</span>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white font-['Outfit'] tracking-tight">
          Watchlist & History
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 font-normal max-w-xl">
          Your saved titles and resume points, synchronized across your devices. Click any title to view details or resume.
        </p>
      </div>

      {/* Section 1: Continue Watching (In-Progress Sessions) */}
      <WatchlistHistorySection
        history={history}
        onClearHistory={handleClearHistory}
        onRemoveHistoryItem={handleRemoveFromHistory}
      />

      {/* Section 2: Saved Watchlist */}
      <section className="space-y-6">
        <WatchlistFilterBar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          totalCount={watchlist.length}
          movieCount={movieCount}
          tvCount={tvCount}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {filteredWatchlist.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
            {filteredWatchlist.map((item) => (
              <WatchlistCard
                key={item.id}
                item={item}
                onRemove={handleRemoveFromWatchlist}
              />
            ))}
          </div>
        ) : (
          <div className="border border-white/[0.06] rounded-3xl bg-[#18181C] shadow-sm overflow-hidden">
            <EmptyState
              icon={Bookmark}
              title={searchQuery ? 'No matching titles found' : 'Your Watchlist is Empty'}
              description={
                searchQuery
                  ? `No titles match "${searchQuery}". Try searching for another movie or show.`
                  : 'Save movies and series you want to watch later and they will appear here.'
              }
              actionText={!searchQuery ? 'Explore Movies' : null}
              onAction={!searchQuery ? () => navigate('/movies') : null}
            />
          </div>
        )}
      </section>
    </div>
  );
}
