import React from 'react';
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Movies from './pages/Movies';
import TVShows from './pages/TVShows';
import DetailPage from './pages/DetailPage';
import WatchPage from './pages/WatchPage';
import SearchPage from './pages/SearchPage';
import NetworkHubPage from './pages/NetworkHubPage';
import ScrollToTop from './components/ScrollToTop'; 
import AnimePage from './pages/AnimePage';
import PersonPage from './pages/PersonPage';
import TrailersPage from './pages/TrailersPage';
import CollectionPage from './pages/CollectionPage';
import WatchPartyPage from './pages/WatchPartyPage';
import WatchlistPage from './pages/WatchlistPage';
import { AuthProvider } from './context/AuthContext';
import { PlayerProvider } from './context/PlayerContext';
import FloatingMiniPlayer from './components/FloatingMiniPlayer';

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

          {/* Global Persistent Floating Picture-in-Picture Mini-Player */}
          <FloatingMiniPlayer />
        </PlayerProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}