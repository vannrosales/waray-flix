import React, { useState } from 'react';
import { X, Plus, Check, Bookmark, ListVideo } from 'lucide-react';
import { usePlaylist } from '../../hooks/usePlaylist';
import { useCustomPlaylists } from '../../hooks/useCustomPlaylists';

export default function SaveToPlaylistModal({ isOpen, onClose, media, type }) {
  const { isAdded, toggle: toggleWatchlist } = usePlaylist(media?.id);
  const { playlists, createPlaylist, toggleMedia, isInPlaylist } = useCustomPlaylists();
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  if (!isOpen || !media) return null;

  const normalizedMedia = { ...media, media_type: type };

  const handleCreatePlaylist = (e) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;
    createPlaylist(newPlaylistName);
    setNewPlaylistName('');
    setIsCreating(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 text-white font-sans">
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-md" 
        onClick={onClose} 
      />
      <div className="relative w-full max-w-md bg-[#121212] border border-white/[0.08] rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.06]">
          <h2 className="text-xl font-bold tracking-tight">Save to...</h2>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/[0.08] transition cursor-pointer text-zinc-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Playlists */}
        <div className="overflow-y-auto flex-1 p-4 space-y-2">
          {/* Default Watchlist */}
          <button 
            onClick={() => toggleWatchlist(normalizedMedia)}
            className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-white/[0.06] transition cursor-pointer border border-transparent hover:border-white/[0.04] group"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-white group-hover:bg-zinc-700 transition">
                <Bookmark className="w-5 h-5" />
              </div>
              <span className="font-semibold text-[15px]">Watchlist</span>
            </div>
            <div className={`w-6 h-6 rounded-md border flex items-center justify-center transition-colors ${
              isAdded ? 'bg-white border-white' : 'border-zinc-600'
            }`}>
              {isAdded && <Check className="w-4 h-4 text-black stroke-[3]" />}
            </div>
          </button>

          {/* Custom Playlists */}
          {playlists.map(playlist => {
            const inList = isInPlaylist(playlist.id, media.id);
            return (
              <button 
                key={playlist.id}
                onClick={() => toggleMedia(playlist.id, normalizedMedia)}
                className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-white/[0.06] transition cursor-pointer border border-transparent hover:border-white/[0.04] group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-white group-hover:bg-zinc-700 transition">
                    <ListVideo className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <span className="font-semibold text-[15px] block">{playlist.name}</span>
                    <span className="text-xs text-zinc-500 font-medium">{playlist.items.length} item{playlist.items.length !== 1 ? 's' : ''}</span>
                  </div>
                </div>
                <div className={`w-6 h-6 rounded-md border flex items-center justify-center transition-colors ${
                  inList ? 'bg-white border-white' : 'border-zinc-600'
                }`}>
                  {inList && <Check className="w-4 h-4 text-black stroke-[3]" />}
                </div>
              </button>
            );
          })}
        </div>

        {/* Create New Playlist */}
        <div className="p-4 border-t border-white/[0.06] bg-[#181818]">
          {isCreating ? (
            <form onSubmit={handleCreatePlaylist} className="flex items-center gap-2">
              <input 
                type="text" 
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                placeholder="Playlist name..."
                autoFocus
                maxLength={50}
                className="flex-1 bg-[#222222] border border-zinc-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-zinc-500 transition"
              />
              <button 
                type="submit"
                disabled={!newPlaylistName.trim()}
                className="px-5 py-3 bg-white text-black font-semibold rounded-xl text-sm disabled:opacity-50 transition"
              >
                Create
              </button>
            </form>
          ) : (
            <button 
              onClick={() => setIsCreating(true)}
              className="w-full flex items-center justify-center gap-2 p-3.5 rounded-xl border border-dashed border-zinc-700 hover:border-zinc-500 hover:bg-white/[0.04] transition text-zinc-400 hover:text-white font-medium text-sm"
            >
              <Plus className="w-5 h-5" />
              <span>Create New Playlist</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

