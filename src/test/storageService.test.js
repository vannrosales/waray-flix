/**
 * storageService.test.js
 * Tests for watchlist toggle, watch history progress saving, and resume logic.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { storageService } from '../services/storageService';

// ── Mock Supabase so tests don't hit the network ──────────────────────────────
vi.mock('../services/supabase', () => ({
  isSupabaseConfigured: false,
  supabase: null,
}));

// ── Helpers ───────────────────────────────────────────────────────────────────
const PLAYLIST_KEY = 'warayflix_my_list';
const HISTORY_KEY  = 'warayflix_watch_history';

const mockMovie = {
  id: 123,
  media_id: '123',
  title: 'Test Movie',
  name: 'Test Movie',
  poster_path: '/poster.jpg',
  backdrop_path: '/backdrop.jpg',
  media_type: 'movie',
  vote_average: 7.5,
  release_date: '2024-01-01',
  overview: 'A test movie.',
};

const mockTV = {
  id: 456,
  media_id: '456',
  title: 'Test Show',
  name: 'Test Show',
  poster_path: '/poster2.jpg',
  media_type: 'tv',
  vote_average: 8.0,
  first_air_date: '2023-05-10',
};

beforeEach(() => {
  localStorage.clear();
  // Supress window event dispatch noise in tests
  vi.spyOn(window, 'dispatchEvent').mockImplementation(() => true);
});

// ─────────────────────────────────────────────────────────────────────────────
// WATCHLIST TESTS
// ─────────────────────────────────────────────────────────────────────────────

describe('storageService — Watchlist', () => {
  it('getPlaylist() returns empty array when localStorage is empty', () => {
    const list = storageService.getPlaylist();
    expect(list).toEqual([]);
  });

  it('togglePlaylistItem() adds a movie to the watchlist', async () => {
    const updated = await storageService.togglePlaylistItem(mockMovie, null);
    expect(updated).toHaveLength(1);
    expect(updated[0].id).toBe(123);
    expect(updated[0].title).toBe('Test Movie');
  });

  it('togglePlaylistItem() removes an already-saved movie from the watchlist', async () => {
    // Add first
    await storageService.togglePlaylistItem(mockMovie, null);
    // Remove (toggle again)
    const updated = await storageService.togglePlaylistItem(mockMovie, null);
    expect(updated).toHaveLength(0);
  });

  it('togglePlaylistItem() can add multiple different titles', async () => {
    await storageService.togglePlaylistItem(mockMovie, null);
    const updated = await storageService.togglePlaylistItem(mockTV, null);
    expect(updated).toHaveLength(2);
  });

  it('getPlaylist() reflects items saved to localStorage', async () => {
    await storageService.togglePlaylistItem(mockMovie, null);
    const list = storageService.getPlaylist();
    expect(list.some(item => String(item.id) === '123')).toBe(true);
  });

  it('togglePlaylistItem() ignores items without an id', async () => {
    const updated = await storageService.togglePlaylistItem({ title: 'No ID' }, null);
    // Returns existing list unchanged
    expect(updated).toEqual([]);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// WATCH HISTORY / RESUME TESTS
// ─────────────────────────────────────────────────────────────────────────────

describe('storageService — Watch History & Resume', () => {
  it('getHistory() returns empty array when localStorage is empty', () => {
    const history = storageService.getHistory();
    expect(history).toEqual([]);
  });

  it('saveHistoryProgress() saves a new history item', async () => {
    await storageService.saveHistoryProgress(null, {
      id: 123,
      title: 'Test Movie',
      media_type: 'movie',
      lastWatchedSeconds: 300,
      totalSeconds: 7200,
    });

    const history = storageService.getHistory();
    expect(history).toHaveLength(1);
    expect(history[0].lastWatchedSeconds).toBe(300);
  });

  it('saveHistoryProgress() updates lastWatchedSeconds for an existing item', async () => {
    // First save at 300s
    await storageService.saveHistoryProgress(null, {
      id: 123, title: 'Test Movie', media_type: 'movie',
      lastWatchedSeconds: 300, totalSeconds: 7200,
    });

    // Update to 900s (simulating scrubber advance)
    await storageService.saveHistoryProgress(null, {
      id: 123, title: 'Test Movie', media_type: 'movie',
      lastWatchedSeconds: 900, totalSeconds: 7200,
    });

    const history = storageService.getHistory();
    expect(history).toHaveLength(1); // Still only 1 entry
    expect(history[0].lastWatchedSeconds).toBe(900);
  });

  it('saveHistoryProgress() does NOT overwrite a positive lastWatchedSeconds with 0', async () => {
    // Save real progress first
    await storageService.saveHistoryProgress(null, {
      id: 123, title: 'Test Movie', media_type: 'movie',
      lastWatchedSeconds: 600, totalSeconds: 7200,
    });

    // Attempt to save with 0 (e.g., accidental reset)
    await storageService.saveHistoryProgress(null, {
      id: 123, title: 'Test Movie', media_type: 'movie',
      lastWatchedSeconds: 0, totalSeconds: 7200,
    });

    const history = storageService.getHistory();
    expect(history[0].lastWatchedSeconds).toBe(600); // Preserved
  });

  it('saveHistoryProgress() tracks TV season and episode', async () => {
    await storageService.saveHistoryProgress(null, {
      id: 456, title: 'Test Show', media_type: 'tv',
      season: 2, episode: 5,
      lastWatchedSeconds: 120, totalSeconds: 2700,
    });

    const history = storageService.getHistory();
    expect(history[0].season).toBe(2);
    expect(history[0].episode).toBe(5);
  });

  it('getHistory() returns all saved history items sorted by most recent', async () => {
    await storageService.saveHistoryProgress(null, {
      id: 1, title: 'Movie A', media_type: 'movie',
      lastWatchedSeconds: 100, totalSeconds: 7200,
    });
    await storageService.saveHistoryProgress(null, {
      id: 2, title: 'Movie B', media_type: 'movie',
      lastWatchedSeconds: 200, totalSeconds: 7200,
    });

    const history = storageService.getHistory();
    expect(history).toHaveLength(2);
  });
});

