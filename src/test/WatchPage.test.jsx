/**
 * WatchPage.test.jsx
 * Integration tests for WatchPage signed-in priority features:
 *   - Watchlist quick-toggle (signed-in vs guest)
 *   - Guest sign-in nudge banner
 *   - Auth-gated Watch Party button
 *   - HUD renders title + episode info
 *   - Server switcher pills render
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

// ── Mocks ─────────────────────────────────────────────────────────────────────

vi.mock('../services/supabase', () => ({
  isSupabaseConfigured: false,
  supabase: null,
}));

vi.mock('../services/storageService', () => ({
  storageService: {
    getHistory:          vi.fn(() => []),
    getPlaylist:         vi.fn(() => []),
    saveHistoryProgress: vi.fn(() => Promise.resolve()),
    togglePlaylistItem:  vi.fn(() => Promise.resolve([])),
  },
}));

vi.mock('../services/tmdb', () => ({
  fetchMediaDetails:  vi.fn(() => Promise.resolve({ seasons: [] })),
  fetchSeasonDetails: vi.fn(() => Promise.resolve({ episodes: [] })),
  getImageUrl:        vi.fn(p => `https://image.tmdb.org/t/p/w500${p}`),
}));

vi.mock('../context/PlayerContext', () => ({
  usePlayer: () => ({ enterPiP: vi.fn() }),
}));

vi.mock('../config/siteConfig', () => ({
  CONFIG: {
    tmdbApiKey: 'TEST_API_KEY',
    players: [
      {
        id: 'server1',
        name: 'Server 1',
        getMovieUrl: (id) => `https://embed.test/movie/${id}`,
        getTvUrl:    (id, s, e) => `https://embed.test/tv/${id}/${s}/${e}`,
      },
      {
        id: 'server2',
        name: 'Server 2',
        getMovieUrl: (id) => `https://embed2.test/movie/${id}`,
        getTvUrl:    (id, s, e) => `https://embed2.test/tv/${id}/${s}/${e}`,
      },
    ],
  },
}));

// Mock fetch (TMDB metadata call)
global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({
      id: 999,
      title: 'Inception',
      poster_path: '/poster.jpg',
      backdrop_path: '/backdrop.jpg',
      overview: 'A mind-bending thriller.',
      vote_average: 8.8,
      release_date: '2010-07-16',
    }),
  })
);

// ── Auth Context Factories ────────────────────────────────────────────────────

const mockOpenAuthModal = vi.fn();

vi.mock('../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

import { useAuth } from '../context/AuthContext';

function renderWatchPage(authValue, route = '/watch/movie/999') {
  useAuth.mockReturnValue(authValue);
  return render(
    <MemoryRouter initialEntries={[route]}>
      <Routes>
        <Route path="/watch/:type/:id" element={<WatchPageLazy />} />
        <Route path="/watch/:type/:id/:season/:episode" element={<WatchPageLazy />} />
      </Routes>
    </MemoryRouter>
  );
}

// Lazy import after mocks are set up
import WatchPage from '../pages/WatchPage';
const WatchPageLazy = WatchPage;

// ── Test Suites ───────────────────────────────────────────────────────────────

describe('WatchPage — Guest (not signed in)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the video iframe', async () => {
    renderWatchPage({ user: null, openAuthModal: mockOpenAuthModal });
    const iframe = await waitFor(() => document.querySelector('iframe'));
    expect(iframe).toBeTruthy();
  });

  it('shows Sign In nudge banner for guests', async () => {
    renderWatchPage({ user: null, openAuthModal: mockOpenAuthModal });
    const nudge = await waitFor(() =>
      screen.getByText(/sync your watchlist/i)
    );
    expect(nudge).toBeInTheDocument();
  });

  it('shows "Watchlist" button that opens auth modal when guest clicks it', async () => {
    renderWatchPage({ user: null, openAuthModal: mockOpenAuthModal });
    const watchlistBtn = await waitFor(() =>
      screen.getByTitle(/sign in to save to watchlist/i)
    );
    fireEvent.click(watchlistBtn);
    expect(mockOpenAuthModal).toHaveBeenCalledOnce();
  });

  it('Watch Party button requires sign-in for guests', async () => {
    renderWatchPage({ user: null, openAuthModal: mockOpenAuthModal });
    const partyBtn = await waitFor(() =>
      screen.getByTitle(/sign in to start a watch party/i)
    );
    fireEvent.click(partyBtn);
    expect(mockOpenAuthModal).toHaveBeenCalledOnce();
  });

  it('renders both server switcher options', async () => {
    renderWatchPage({ user: null, openAuthModal: mockOpenAuthModal });
    await waitFor(() => {
      // Desktop pills — at least one "Server 1" text present
      const pills = screen.getAllByText('Server 1');
      expect(pills.length).toBeGreaterThan(0);
    });
  });
});

describe('WatchPage — Signed-In User', () => {
  const signedInUser = { id: 'user-001', email: 'test@example.com' };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does NOT show the guest sign-in nudge banner', async () => {
    renderWatchPage({ user: signedInUser, openAuthModal: mockOpenAuthModal });
    await waitFor(() => {
      // Wait for fetch to resolve (title appears)
      screen.queryByText('Inception');
    });
    // Nudge should not be present
    expect(screen.queryByText(/sync your watchlist/i)).not.toBeInTheDocument();
  });

  it('shows media title in HUD after fetch', async () => {
    renderWatchPage({ user: signedInUser, openAuthModal: mockOpenAuthModal });
    await waitFor(() => {
      expect(screen.getByText('Inception')).toBeInTheDocument();
    });
  });

  it('Watchlist button adds to list (calls togglePlaylistItem)', async () => {
    const { storageService } = await import('../services/storageService');
    storageService.togglePlaylistItem.mockResolvedValueOnce([{ id: 999, title: 'Inception' }]);

    renderWatchPage({ user: signedInUser, openAuthModal: mockOpenAuthModal });

    const watchlistBtn = await waitFor(() =>
      screen.getByTitle(/add to watchlist/i)
    );
    fireEvent.click(watchlistBtn);
    await waitFor(() => {
      expect(storageService.togglePlaylistItem).toHaveBeenCalledOnce();
    });
  });

  it('Watch Party button navigates (does NOT open auth modal)', async () => {
    renderWatchPage({ user: signedInUser, openAuthModal: mockOpenAuthModal });
    const partyBtn = await waitFor(() =>
      screen.getByTitle('Watch Party')
    );
    fireEvent.click(partyBtn);
    expect(mockOpenAuthModal).not.toHaveBeenCalled();
  });

  it('renders Back button in HUD', async () => {
    renderWatchPage({ user: signedInUser, openAuthModal: mockOpenAuthModal });
    const backBtn = await waitFor(() => screen.getByRole('button', { name: /go back/i }));
    expect(backBtn).toBeInTheDocument();
  });

  it('renders Phone Sync (QR) button', async () => {
    renderWatchPage({ user: signedInUser, openAuthModal: mockOpenAuthModal });
    const qrBtn = await waitFor(() => screen.getByTitle('Phone Sync (QR)'));
    expect(qrBtn).toBeInTheDocument();
  });

  it('renders Mini Player (PiP) button', async () => {
    renderWatchPage({ user: signedInUser, openAuthModal: mockOpenAuthModal });
    const pipBtn = await waitFor(() => screen.getByTitle('Mini Player'));
    expect(pipBtn).toBeInTheDocument();
  });
});

describe('WatchPage — TV Episode Mode', () => {
  const signedInUser = { id: 'user-001', email: 'test@example.com' };

  beforeEach(() => {
    vi.clearAllMocks();
    // Return a TV show response
    global.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        id: 456,
        name: 'Breaking Bad',
        poster_path: '/bb.jpg',
        first_air_date: '2008-01-20',
        vote_average: 9.5,
      }),
    });
  });

  it('renders Episodes button for TV type', async () => {
    renderWatchPage(
      { user: signedInUser, openAuthModal: mockOpenAuthModal },
      '/watch/tv/456/2/5'
    );
    const epBtn = await waitFor(() => screen.getByTitle('Browse Episodes'));
    expect(epBtn).toBeInTheDocument();
  });

  it('shows S2·E5 episode badge in HUD title', async () => {
    renderWatchPage(
      { user: signedInUser, openAuthModal: mockOpenAuthModal },
      '/watch/tv/456/2/5'
    );
    await waitFor(() => {
      expect(screen.getByText('S2·E5')).toBeInTheDocument();
    });
  });

  it('opens episode drawer when Episodes button is clicked', async () => {
    renderWatchPage(
      { user: signedInUser, openAuthModal: mockOpenAuthModal },
      '/watch/tv/456/2/5'
    );
    const epBtn = await waitFor(() => screen.getByTitle('Browse Episodes'));
    fireEvent.click(epBtn);
    await waitFor(() => {
      // "BINGE DRAWER" is split across child spans, match via textContent
      const el = document.querySelector('span.tracking-widest');
      expect(el?.textContent?.trim()).toBe('Binge Drawer');
    });
  });

  it('closes episode drawer when X button is clicked', async () => {
    renderWatchPage(
      { user: signedInUser, openAuthModal: mockOpenAuthModal },
      '/watch/tv/456/2/5'
    );
    const epBtn = await waitFor(() => screen.getByTitle('Browse Episodes'));
    fireEvent.click(epBtn);

    // Wait for drawer to be open
    await waitFor(() => {
      const el = document.querySelector('span.tracking-widest');
      expect(el?.textContent?.trim()).toBe('Binge Drawer');
    });

    // Close the drawer
    const closeBtn = screen.getByLabelText('Close episode drawer');
    fireEvent.click(closeBtn);

    await waitFor(() => {
      expect(document.querySelector('span.tracking-widest')).not.toBeInTheDocument();
    });
  });
});
