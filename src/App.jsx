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

function Layout() {
  return (
    <div className="min-h-screen bg-[#09090b] text-[#F3F4F4] font-sans selection:bg-[#F3F4F4] selection:text-[#2C2C2C]">
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
    <ScrollToTop />
      <Routes>
        {/* Pages containing regular Navbar and Footer layout */}
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/movies" element={<Movies />} />
          <Route path="/tv" element={<TVShows />} />
          <Route path="/details/:type/:id" element={<DetailPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/network/:networkName/:id" element={<NetworkHubPage />} />
          <Route path="/category/anime" element={<AnimePage />} />
        </Route>

        {/* Fullscreen clean layout for the dedicated iframe Watch Player */}
        <Route path="/watch/:type/:id" element={<WatchPage />} />
        <Route path="/watch/:type/:id/:season/:episode" element={<WatchPage />} />
      </Routes>
    </BrowserRouter>
  );
}