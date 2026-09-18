import React, { useState } from 'react';
import { Trash2, ListVideo, Film, Tv, Plus } from 'lucide-react';
import { useCustomPlaylists } from '../../hooks/useCustomPlaylists';
import WatchlistCard from '../watchlist/WatchlistCard';

export default function CustomPlaylistsSection({ searchQuery }) {
  const { playlists, deletePlaylist, toggleMedia } = useCustomPlaylists();
  
  if (playlists.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center border border-white/[0.06] rounded-xl bg-[#121212] shadow-sm">
        <ListVideo className="w-12 h-12 text-zinc-600 mb-4" />
        <h3 className="text-lg font-bold text-white mb-2">No Custom Playlists</h3>
        <p className="text-sm text-zinc-400 max-w-sm">
          Create playlists to organize your favorite movies and series. 
          You can create playlists from any title's details page.
        </p>
      </div>
    );
  }

  const filteredPlaylists = playlists.filter(p => 
    !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-12">
      {filteredPlaylists.map(playlist => (
        <div key={playlist.id} className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-white/[0.06] flex items-center justify-center text-zinc-300">
                <ListVideo className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">{playlist.name}</h3>
                <p className="text-xs text-zinc-400">{playlist.items.length} titles</p>
              </div>
            </div>
            <button 
              onClick={() => {
                if(window.confirm(`Delete playlist "${playlist.name}"?`)) {
                  deletePlaylist(playlist.id);
                }
              }}
              className="p-2 rounded-full hover:bg-white/[0.08] text-zinc-400 hover:text-red-400 transition cursor-pointer"
              title="Delete Playlist"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

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
             <div className="py-8 text-center text-sm text-zinc-500 border border-dashed border-white/[0.05] rounded-xl bg-white/[0.01]">
                This playlist is empty.
             </div>
          )}
        </div>
      ))}
      
      {filteredPlaylists.length === 0 && searchQuery && (
         <div className="text-center py-12 text-zinc-400">
           No playlists match "{searchQuery}"
         </div>
      )}
    </div>
  );
}

