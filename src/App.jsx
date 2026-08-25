import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import { AuthProvider } from './context/AuthContext';
import { PlayerProvider } from './context/PlayerContext';
import FloatingMiniPlayer from './components/FloatingMiniPlayer';
import PageLoader from './components/common/PageLoader';

// Dynamic route code-splitting for massive initial bundle reduction on mobile
const Home = lazy(() => import('./pages/Home'));
const Movies = lazy(() => import('./pages/Movies'));
const TVShows = lazy(() => import('./pages/TVShows'));
const DetailPage = lazy(() => import('./pages/DetailPage'));
const WatchPage = lazy(() => import('./pages/WatchPage'));
const SearchPage = lazy(() => import('./pages/SearchPage'));
const NetworkHubPage = lazy(() => import('./pages/NetworkHubPage'));
const AnimePage = lazy(() => import('./pages/AnimePage'));
const PersonPage = lazy(() => import('./pages/PersonPage'));
const TrailersPage = lazy(() => import('./pages/TrailersPage'));
const CollectionPage = lazy(() => import('./pages/CollectionPage'));
const WatchPartyPage = lazy(() => import('./pages/WatchPartyPage'));
const WatchlistPage = lazy(() => import('./pages/WatchlistPage'));
const TimelinePage = lazy(() => import('./pages/TimelinePage'));

function Layout() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#09090B] font-sans selection:bg-[#2563EB] selection:text-white flex flex-col justify-between">
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <PlayerProvider>
          <ScrollToTop />
          <Suspense fallback={<PageLoader text="LOADING_CINEMA_STREAM..." />}>
            <Routes>
              {/* Main Application Layout with Floating Header & Footer */}
              <Route element={<Layout />}>
                <Route path="/" element={<Home />} />
                <Route path="/movies" element={<Movies />} />
                <Route path="/tv" element={<TVShows />} />
                <Route path="/watchlist" element={<WatchlistPage />} />
                <Route path="/trailers" element={<TrailersPage />} />
                <Route path="/details/:type/:id" element={<DetailPage />} />
                <Route path="/person/:id" element={<PersonPage />} />
                <Route path="/collection/:id" element={<CollectionPage />} />
                <Route path="/timeline" element={<TimelinePage />} />
                <Route path="/timeline/:sagaId" element={<TimelinePage />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/network/:networkName/:id" element={<NetworkHubPage />} />
                <Route path="/category/anime" element={<AnimePage />} />
                <Route path="/anime" element={<AnimePage />} />
              </Route>

              {/* Dedicated Immersive Fullscreen Watch Player */}
              <Route path="/watch/:type/:id" element={<WatchPage />} />
              <Route path="/watch/:type/:id/:season/:episode" element={<WatchPage />} />

              {/* P2P Synchronized Watch Party Rooms */}
              <Route path="/party/:type/:id" element={<WatchPartyPage />} />
              <Route path="/party/:type/:id/:season/:episode" element={<WatchPartyPage />} />
            </Routes>
          </Suspense>

          {/* Global Persistent Floating Picture-in-Picture Mini-Player */}
          <FloatingMiniPlayer />
        </PlayerProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}