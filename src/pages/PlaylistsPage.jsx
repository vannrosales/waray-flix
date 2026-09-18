import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ListVideo, Play, Plus, Film } from 'lucide-react';
import { useCustomPlaylists } from '../hooks/useCustomPlaylists';
import useDocumentTitle from '../hooks/useDocumentTitle';
import EmptyState from '../components/common/EmptyState';

export default function PlaylistsPage() {
  useDocumentTitle('My Playlists — WarayFlix');
  const navigate = useNavigate();
  const { playlists, createPlaylist } = useCustomPlaylists();
  const [isCreating, setIsCreating] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');

  const handleCreate = (e) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;
    createPlaylist(newPlaylistName);
    setNewPlaylistName('');
    setIsCreating(false);
  };

  return (
    <div className="min-h-screen bg-[#000000] text-[#FFFFFF] pt-24 sm:pt-28 pb-20 px-6 md:px-12 max-w-[1440px] mx-auto space-y-12 select-none">
      <div className="border-b border-white/[0.08] pb-8 space-y-2 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-zinc-400 uppercase tracking-widest font-semibold">
            <ListVideo className="w-3.5 h-3.5 stroke-[2] text-white" />
            <span>COLLECTION</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight">
            My Playlists
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 font-normal max-w-xl">
            Create custom playlists to organize your favorite titles into themes, moods, or genres.
          </p>
        </div>

        <div>
          {isCreating ? (
            <form onSubmit={handleCreate} className="flex items-center gap-2">
              <input 
                type="text" 
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                placeholder="Playlist name..."
                autoFocus
                className="bg-[#222222] border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-zinc-500 transition w-48"
              />
              <button 
                type="submit"
                disabled={!newPlaylistName.trim()}
                className="px-4 py-2.5 bg-white text-black font-semibold rounded-xl text-sm disabled:opacity-50 transition cursor-pointer"
              >
                Create
              </button>
              <button 
                type="button"
                onClick={() => setIsCreating(false)}
                className="px-4 py-2.5 bg-transparent border border-zinc-700 text-white font-semibold rounded-xl text-sm hover:bg-white/[0.05] transition cursor-pointer"
              >
                Cancel
              </button>
            </form>
          ) : (
            <button 
              onClick={() => setIsCreating(true)}
              className="px-5 py-2.5 bg-white text-black font-semibold rounded-xl text-sm flex items-center gap-2 hover:bg-zinc-200 transition shadow-md cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>New Playlist</span>
            </button>
          )}
        </div>
      </div>

      <section>
        {playlists.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {playlists.map(playlist => {
              const previewItems = playlist.items.slice(0, 4);
              const hasItems = previewItems.length > 0;
              
              return (
                <div 
                  key={playlist.id} 
                  onClick={() => navigate(`/playlist/${playlist.id}`)}
                  className="bg-[#121212] border border-white/[0.08] hover:border-white/20 rounded-2xl p-4 transition cursor-pointer group flex flex-col gap-4 shadow-sm hover:shadow-xl hover:-translate-y-1"
                >
                  {/* Image Grid Preview */}
                  <div className="w-full aspect-[16/9] rounded-xl overflow-hidden bg-[#18181C] grid grid-cols-2 grid-rows-2 gap-0.5 relative">
                    {hasItems ? (
                      previewItems.map((item, idx) => (
                        <div key={item.id} className="relative w-full h-full bg-[#252528]">
                          <img 
                            src={item.backdrop_path || item.poster_path ? `https://image.tmdb.org/t/p/w300${item.backdrop_path || item.poster_path}` : ''}
                            alt="" 
                            className="w-full h-full object-cover" 
                          />
                          <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition" />
                        </div>
                      ))
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-zinc-700">
                        <Film className="w-8 h-8 stroke-[1.5]" />
                      </div>
                    )}
                    
                    {/* Play Overlay */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                      <div className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center transform scale-75 group-hover:scale-100 transition shadow-2xl">
                        <Play className="w-5 h-5 ml-1 stroke-[2.5]" />
                      </div>
                    </div>
                  </div>

                  {/* Info */}
                  <div>
                    <h3 className="text-lg font-bold text-white group-hover:text-cyan-400 transition truncate">{playlist.name}</h3>
                    <p className="text-sm text-zinc-500 font-medium mt-0.5">{playlist.items.length} titles</p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="border border-white/[0.06] rounded-xl bg-[#121212] shadow-sm overflow-hidden">
            <EmptyState
              icon={ListVideo}
              title="No Playlists Yet"
              description="Create a playlist and save movies or shows you want to group together."
              actionText="Explore Titles"
              onAction={() => navigate('/movies')}
            />
          </div>
        )}
      </section>
    </div>
  );
}

