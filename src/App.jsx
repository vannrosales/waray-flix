import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import { AuthProvider } from './context/AuthContext';
import { PlayerProvider } from './context/PlayerContext';
import FloatingMiniPlayer from './components/FloatingMiniPlayer';
import AnnouncementBanner from './components/common/AnnouncementBanner';
import PageLoader from './components/common/PageLoader';
import { Analytics } from "@vercel/analytics/react";
import CastRemoteBar from './components/cast/CastRemoteBar';

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
const HowItWorksPage = lazy(() => import('./pages/HowItWorksPage'));
const AdminPage = lazy(() => import('./pages/AdminPage'));
const TvReceiverPage = lazy(() => import('./pages/TvReceiverPage'));
const WindowsAppPage = lazy(() => import('./pages/WindowsAppPage'));

function Layout() {
  return (
    <div className="min-h-screen bg-[#000000] text-[#FFFFFF] font-sans selection:bg-white selection:text-black flex flex-col justify-between">
      <Sidebar />
      <div className="md:pl-64 flex flex-col flex-grow w-full min-w-0 transition-all duration-300">
        <AnnouncementBanner />
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
                <Route path="/how-it-works" element={<HowItWorksPage />} />
                <Route path="/guide" element={<HowItWorksPage />} />
                <Route path="/windows" element={<WindowsAppPage />} />
                <Route path="/desktop" element={<WindowsAppPage />} />
                <Route path="/download" element={<WindowsAppPage />} />
                <Route path="/legal" element={<LegalPage />} />
                <Route path="/dmca" element={<LegalPage />} />
                <Route path="/admin" element={<AdminPage />} />
              </Route>

              {/* Dedicated Immersive Fullscreen Watch Player */}
              <Route path="/watch/:type/:id" element={<WatchPage />} />
              <Route path="/watch/:type/:id/:season/:episode" element={<WatchPage />} />

              {/* P2P Synchronized Watch Party Rooms */}
              <Route path="/party/:type/:id" element={<WatchPartyPage />} />
              <Route path="/party/:type/:id/:season/:episode" element={<WatchPartyPage />} />

              {/* 📺 Smart TV & Chromecast Receiver Mode */}
              <Route path="/tv" element={<TvReceiverPage />} />
              <Route path="/cast" element={<TvReceiverPage />} />
            </Routes>
          </Suspense>

          {/* Global Analytics & Floating Picture-in-Picture Mini-Player (CastRemoteBar commented out) */}
          <Analytics />
          <FloatingMiniPlayer />
          {/* <CastRemoteBar /> */}
        </PlayerProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
