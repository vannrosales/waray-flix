import { playlistStorage } from './storage/playlistStorage';
import { historyStorage } from './storage/historyStorage';
import { watchPartyStorage } from './storage/watchPartyStorage';
import { customPlaylistStorage } from './storage/customPlaylistStorage';
import { resolveUserId } from './storage/userResolver';

/**
 * Storage Service facade
 * Provides backward-compatible, unified access to Playlist, History, and WatchParty storage.
 */
export const storageService = {
  // User Resolver
  resolveUserId,

  // Custom Playlists
  getCustomPlaylists: customPlaylistStorage.getPlaylists,
  createCustomPlaylist: customPlaylistStorage.createPlaylist,
  deleteCustomPlaylist: customPlaylistStorage.deletePlaylist,
  toggleMediaInCustomPlaylist: customPlaylistStorage.toggleMediaInPlaylist,
  isInCustomPlaylist: customPlaylistStorage.isInCustomPlaylist,

  // Playlist / Watchlist
  getPlaylist: playlistStorage.getPlaylist,
  fetchCloudPlaylist: playlistStorage.fetchCloudPlaylist,
  togglePlaylistItem: playlistStorage.togglePlaylistItem,
  isInPlaylist: playlistStorage.isInPlaylist,

  // Watch History
  getHistory: historyStorage.getHistory,
  fetchCloudHistory: historyStorage.fetchCloudHistory,
  saveHistoryProgress: historyStorage.saveHistoryProgress,
  removeFromHistory: historyStorage.removeFromHistory,
  clearHistory: historyStorage.clearHistory,

  // Watch Party
  saveWatchPartyRoom: watchPartyStorage.saveWatchPartyRoom,
  fetchWatchPartyRoom: watchPartyStorage.fetchWatchPartyRoom,
};
