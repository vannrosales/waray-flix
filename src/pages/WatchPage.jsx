import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { CONFIG } from '../config/siteConfig';
import ShareModal from '../components/ShareModal';
import { usePlayer } from '../context/PlayerContext';
import { useAuth } from '../context/AuthContext';
import { storageService } from '../services/storageService';
import { fetchMediaDetails, fetchSeasonDetails } from '../services/tmdb';
import WatchTopHUD from '../components/player/WatchTopHUD';
import EpisodeDrawer from '../components/player/EpisodeDrawer';
import GuestNudgeBanner from '../components/player/GuestNudgeBanner';
import { useWatchHistoryTracker } from '../hooks/useWatchHistoryTracker';
import { useWatchHUD } from '../hooks/useWatchHUD';

export default function WatchPage() {
  const { type, id, season, episode } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, openAuthModal } = useAuth();
  const { enterPiP } = usePlayer();

  const startParam = searchParams.get('startAt') || searchParams.get('t') || searchParams.get('time');
  const currentSeason = season ? parseInt(season) : 1;
  const currentEpisode = episode ? parseInt(episode) : 1;

  const parsedSeconds = useMemo(() => {
    if (startParam) {
      return startParam.endsWith('m') ? parseInt(startParam) * 60 : parseInt(startParam);
    }
    const saved = storageService.getHistory().find(item => String(item.id || item.media_id) === String(id));
    return saved?.lastWatchedSeconds || 0;
  }, [id, startParam]);

  const [mediaTitle, setMediaTitle] = useState('');
  const [selectedPlayerId, setSelectedPlayerId] = useState(CONFIG.players[0].id);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [epDrawerOpen, setEpDrawerOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  const [tvShowDetails, setTvShowDetails] = useState(null);
  const [currentSeasonData, setCurrentSeasonData] = useState(null);
  const [selectedDrawerSeason, setSelectedDrawerSeason] = useState(currentSeason);
  const [inWatchlist, setInWatchlist] = useState(false);
  const mediaDataRef = useRef(null);

  // Scrubber & History tracking hook
  const { lastScrubSecondsRef } = useWatchHistoryTracker({
    id,
    type,
    currentSeason,
    currentEpisode,
    userId: user?.id,
    mediaTitle,
    initialSeconds: parsedSeconds,
  });

  const activePlayer = useMemo(() => {
    return CONFIG.players.find(p => p.id === selectedPlayerId) || CONFIG.players[0];
  }, [selectedPlayerId]);

  const embedUrl = useMemo(() => {
    return type === 'movie'
      ? activePlayer.getMovieUrl(id, parsedSeconds)
      : activePlayer.getTvUrl(id, currentSeason, currentEpisode, parsedSeconds);
  }, [activePlayer, type, id, currentSeason, currentEpisode, parsedSeconds]);

  // Load TV structure
  useEffect(() => {
    if (type === 'tv') {
      fetchMediaDetails(id, 'tv').then(setTvShowDetails).catch(err => console.error('Failed to load show:', err));
    }
  }, [id, type]);

  // Load TV Season
  useEffect(() => {
    if (type === 'tv') {
      fetchSeasonDetails(id, selectedDrawerSeason).then(setCurrentSeasonData).catch(err => console.error('Failed to load season:', err));
    }
  }, [id, type, selectedDrawerSeason]);

  const getNextEpisodeInfo = useCallback(() => {
    if (type !== 'tv') return null;
    const episodes = currentSeasonData?.episodes || [];
    if (episodes.some(ep => ep.episode_number === currentEpisode + 1)) {
      return { season: currentSeason, episode: currentEpisode + 1 };
    }
    const nextSeason = (tvShowDetails?.seasons || []).find(s => s.season_number === currentSeason + 1 && s.episode_count > 0);
    return nextSeason ? { season: currentSeason + 1, episode: 1 } : null;
  }, [type, currentSeasonData, currentEpisode, currentSeason, tvShowDetails]);

  const nextEpisodeInfo = getNextEpisodeInfo();

  const handleNextEpisode = useCallback(() => {
    if (!nextEpisodeInfo) return;
    navigate(`/watch/tv/${id}/${nextEpisodeInfo.season}/${nextEpisodeInfo.episode}`);
  }, [nextEpisodeInfo, id, navigate]);

  // HUD & Shortcuts hook
  const { hudVisible, menuRef } = useWatchHUD({
    mobileMenuOpen,
    epDrawerOpen,
    type,
    nextEpisodeInfo,
    onNextEpisode: handleNextEpisode,
    selectedPlayerId,
    onSelectPlayerId: setSelectedPlayerId,
  });

  // Load initial media metadata & initial progress record
  useEffect(() => {
    let isMounted = true;
    async function updateWatchHistory() {
      try {
        const res = await fetch(`https://api.themoviedb.org/3/${type}/${id}?api_key=${CONFIG.tmdbApiKey}`);
        if (!res.ok || !isMounted) return;
        const data = await res.json();
        const title = data.title || data.name;
        setMediaTitle(title);

        const normalized = {
          id: data.id,
          media_id: String(data.id),
          title,
          name: title,
          poster_path: data.poster_path,
          backdrop_path: data.backdrop_path,
          overview: data.overview,
          vote_average: data.vote_average,
          release_date: data.release_date,
          first_air_date: data.first_air_date,
          media_type: type,
        };
        mediaDataRef.current = normalized;

        const playlist = storageService.getPlaylist();
        setInWatchlist(playlist.some(item => String(item.id || item.media_id) === String(data.id)));

        const estimatedDuration = type === 'movie' ? 7200 : 2700;
        await storageService.saveHistoryProgress(user?.id, {
          id: data.id,
          title,
          poster_path: data.poster_path,
          backdrop_path: data.backdrop_path,
          overview: data.overview,
          vote_average: data.vote_average,
          release_date: data.release_date,
          first_air_date: data.first_air_date,
          media_type: type,
          season: type === 'tv' ? currentSeason : 1,
          episode: type === 'tv' ? currentEpisode : 1,
          lastWatchedSeconds: parsedSeconds,
          totalSeconds: estimatedDuration,
          durationSeconds: estimatedDuration,
          updatedAt: Date.now(),
        });
      } catch (err) {
        console.error('Failed to update watch history:', err);
      }
    }
    updateWatchHistory();
    return () => {
      isMounted = false;
    };
  }, [type, id, currentSeason, currentEpisode, user?.id, parsedSeconds]);

  const handleToggleWatchlist = useCallback(async () => {
    if (!user) {
      openAuthModal();
      return;
    }
    if (!mediaDataRef.current) return;
    const updated = await storageService.togglePlaylistItem(mediaDataRef.current, user.id);
    setInWatchlist(Array.isArray(updated) && updated.some(item => String(item.id || item.media_id) === String(id)));
  }, [user, id, openAuthModal]);

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col font-sans overflow-hidden select-none">
      {/* ─── Fullscreen Video Layer ─── */}
      <div className="absolute inset-0 z-0 bg-black">
        <iframe
          src={embedUrl}
          key={`${selectedPlayerId}-${type}-${id}-${currentSeason}-${currentEpisode}`}
          title={`${activePlayer.name} Video Player`}
          className="w-full h-full border-0 pointer-events-auto"
          allowFullScreen
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        />
      </div>

      {/* ─── TOP HUD ─── */}
      <WatchTopHUD
        hudVisible={hudVisible}
        mediaTitle={mediaTitle}
        type={type}
        currentSeason={currentSeason}
        currentEpisode={currentEpisode}
        onBack={() => navigate(-1)}
        nextEpisodeInfo={nextEpisodeInfo}
        onNextEpisode={handleNextEpisode}
        epDrawerOpen={epDrawerOpen}
        setEpDrawerOpen={setEpDrawerOpen}
        inWatchlist={inWatchlist}
        onToggleWatchlist={handleToggleWatchlist}
        user={user}
        onOpenParty={() => (user ? navigate(`/party/${type}/${id}`) : openAuthModal())}
        onOpenShare={() => setShareOpen(true)}
        onEnterPiP={() => {
          enterPiP({
            type,
            id,
            season: currentSeason,
            episode: currentEpisode,
            title: mediaTitle,
            selectedPlayerId,
            currentTime: lastScrubSecondsRef.current,
          });
          navigate(`/details/${type}/${id}`);
        }}
        players={CONFIG.players}
        selectedPlayerId={selectedPlayerId}
        onSelectPlayer={setSelectedPlayerId}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        menuRef={menuRef}
      />

      {/* ─── Episode Drawer (TV Only) ─── */}
      {type === 'tv' && (
        <EpisodeDrawer
          isOpen={epDrawerOpen}
          onClose={() => setEpDrawerOpen(false)}
          mediaTitle={mediaTitle}
          tvShowDetails={tvShowDetails}
          selectedSeason={selectedDrawerSeason}
          onSelectSeason={setSelectedDrawerSeason}
          episodes={currentSeasonData?.episodes || []}
          currentSeason={currentSeason}
          currentEpisode={currentEpisode}
          onSelectEpisode={(s, ep) => {
            navigate(`/watch/tv/${id}/${s}/${ep}`);
            setEpDrawerOpen(false);
          }}
        />
      )}

      {/* ─── Share Modal ─── */}
      {shareOpen && (
        <ShareModal
          isOpen={shareOpen}
          onClose={() => setShareOpen(false)}
          title={mediaTitle}
          type={type}
          id={id}
          season={currentSeason}
          episode={currentEpisode}
        />
      )}

      {/* ─── Guest Banner ─── */}
      {!user && (
        <GuestNudgeBanner
          visible={hudVisible}
          onSignIn={openAuthModal}
        />
      )}
    </div>
  );
}