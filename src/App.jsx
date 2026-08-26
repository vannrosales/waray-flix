import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import { AuthProvider } from './context/AuthContext';
import { PlayerProvider } from './context/PlayerContext';
import FloatingMiniPlayer from './components/FloatingMiniPlayer';
import PageLoader from './components/common/PageLoader';
import { Analytics } from "@vercel/analytics/react";

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
const CollectionPage = lazy(() => import('./pages/CollectionPage'));
const WatchPartyPage = lazy(() => import('./pages/WatchPartyPage'));
const WatchlistPage = lazy(() => import('./pages/WatchlistPage'));
const TimelinePage = lazy(() => import('./pages/TimelinePage'));
const LegalPage = lazy(() => import('./pages/LegalPage'));

function Layout() {
  return (
    <div className="min-h-screen bg-[#000000] text-[#FFFFFF] font-sans selection:bg-white selection:text-black flex flex-col justify-between">
      <Sidebar />
      <div className="md:pl-64 flex flex-col flex-grow w-full min-w-0 transition-all duration-300">
        <main className="flex-grow">
          <Outlet />
        </main>
        <Footer />
      </div>
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
                <Route path="/details/:type/:id" element={<DetailPage />} />
                <Route path="/person/:id" element={<PersonPage />} />
                <Route path="/collection/:id" element={<CollectionPage />} />
                <Route path="/timeline" element={<TimelinePage />} />
                <Route path="/timeline/:sagaId" element={<TimelinePage />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/network/:networkName/:id" element={<NetworkHubPage />} />
                <Route path="/category/anime" element={<AnimePage />} />
                <Route path="/anime" element={<AnimePage />} />
                <Route path="/legal" element={<LegalPage />} />
                <Route path="/dmca" element={<LegalPage />} />
              </Route>

              {/* Dedicated Immersive Fullscreen Watch Player */}
              <Route path="/watch/:type/:id" element={<WatchPage />} />
              <Route path="/watch/:type/:id/:season/:episode" element={<WatchPage />} />

              {/* P2P Synchronized Watch Party Rooms */}
              <Route path="/party/:type/:id" element={<WatchPartyPage />} />
              <Route path="/party/:type/:id/:season/:episode" element={<WatchPartyPage />} />
            </Routes>
          </Suspense>

          {/* Global Analytics and Floating Picture-in-Picture Mini-Player */}
          <Analytics />
          <FloatingMiniPlayer />
        </PlayerProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
