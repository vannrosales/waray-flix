import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ListVideo, Trash2, ArrowLeft } from 'lucide-react';
import { useCustomPlaylists } from '../hooks/useCustomPlaylists';
import WatchlistCard from '../components/watchlist/WatchlistCard';
import useDocumentTitle from '../hooks/useDocumentTitle';
import EmptyState from '../components/common/EmptyState';

export default function PlaylistDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { playlists, deletePlaylist, toggleMedia } = useCustomPlaylists();

  const playlist = playlists.find(p => p.id === id);

  useDocumentTitle(playlist ? `${playlist.name} — Playlists` : 'Playlist Not Found');

  if (!playlist) {
    return (
      <div className="min-h-screen bg-[#000000] text-[#FFFFFF] pt-24 pb-20 px-6 flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-4">Playlist Not Found</h1>
        <button onClick={() => navigate('/watchlist')} className="px-6 py-2 bg-white text-black font-semibold rounded-xl">
          Go Back
        </button>
      </div>
    );
  }

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete "${playlist.name}"?`)) {
      deletePlaylist(playlist.id);
      navigate('/playlists');
    }
  };

  return (
    <div className="min-h-screen bg-[#000000] text-[#FFFFFF] pt-24 sm:pt-28 pb-20 px-6 md:px-12 max-w-[1440px] mx-auto space-y-12 select-none">
      {/* Header Banner */}
      <div className="border-b border-white/[0.08] pb-8 space-y-4">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-zinc-400 hover:text-white transition text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-zinc-400 uppercase tracking-widest font-semibold">
              <ListVideo className="w-3.5 h-3.5 stroke-[2] text-white" />
              <span>CUSTOM PLAYLIST</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight">
              {playlist.name}
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 font-normal">
              {playlist.items.length} {playlist.items.length === 1 ? 'item' : 'items'} saved in this playlist
            </p>
          </div>

          <button 
            onClick={handleDelete}
            className="p-3 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-xl transition cursor-pointer border border-red-500/20 flex items-center gap-2"
            title="Delete Playlist"
          >
            <Trash2 className="w-4 h-4" />
            <span className="hidden sm:inline text-sm font-semibold">Delete Playlist</span>
          </button>
        </div>
      </div>

      {/* Playlist Items */}
      <section>
        {playlist.items.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
            {playlist.items.map((item) => (
              <WatchlistCard
                key={item.id}
                item={item}
                onRemove={(e) => {
                  e.stopPropagation();
                  toggleMedia(playlist.id, item);
                }}
              />
            ))}
          </div>
        ) : (
          <div className="border border-white/[0.06] rounded-xl bg-[#121212] shadow-sm overflow-hidden">
            <EmptyState
              icon={ListVideo}
              title="This playlist is empty"
              description="Add movies and TV shows to this playlist from their details page."
              actionText="Explore Movies"
              onAction={() => navigate('/movies')}
            />
          </div>
        )}
      </section>
    </div>
  );
}

