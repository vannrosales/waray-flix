import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchMediaDetails, fetchSeasonDetails, fetchMediaVideos, getImageUrl } from '../services/tmdb';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { usePlaylist } from '../hooks/usePlaylist';
import MediaRow from '../components/MediaRow';
import ShareModal from '../components/ShareModal';
import { useAuth } from '../context/AuthContext';
import PageLoader from '../components/common/PageLoader';
import DetailHeroVisual from '../components/detail/DetailHeroVisual';
import DetailInfoSection from '../components/detail/DetailInfoSection';
import DetailCastSection from '../components/detail/DetailCastSection';
import DetailSeasonPicker from '../components/detail/DetailSeasonPicker';

export default function DetailPage() {
  const { type, id } = useParams();
  const navigate = useNavigate();
  const { user, openAuthModal } = useAuth();
  const [media, setMedia] = useState(null);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [seasonData, setSeasonData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [trailerKey, setTrailerKey] = useState(null);
  const [isMuted, setIsMuted] = useState(true);
  const [showVideo, setShowVideo] = useState(false);
  const [watchProgress, setWatchProgress] = useState(null);
  const [shareOpen, setShareOpen] = useState(false);

  const { isAdded, toggle } = usePlaylist(id);

  useEffect(() => {
    async function loadDetails() {
      try {
        setLoading(true);
        const data = await fetchMediaDetails(id, type);
        setMedia(data);
        
        if (type === 'tv' && data?.seasons && data.seasons.length > 0) {
          const firstSeason = data.seasons.find(s => s.season_number > 0) || data.seasons[0];
          setSelectedSeason(firstSeason.season_number);
        }

        const videos = await fetchMediaVideos(id, type);
        let trailer = (videos || []).find(v => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser')) || videos?.[0];
        if (String(id) === '969681' || !trailer) {
          if (String(id) === '969681') trailer = { key: '8TZMtslA3UY' };
        }

        if (trailer?.key) {
          setTrailerKey(trailer.key);
          setTimeout(() => setShowVideo(true), 800);
        } else {
          setTrailerKey(null);
          setShowVideo(false);
        }

        const savedHistory = JSON.parse(localStorage.getItem('warayflix_watch_history') || '[]');
        const existingProgress = savedHistory.find(item => item.id.toString() === id.toString());
        setWatchProgress(existingProgress || null);
      } catch (err) {
        console.error("Detail load error:", err);
      } finally {
        setLoading(false);
      }
    }

    loadDetails();
  }, [id, type]);

  useEffect(() => {
    async function loadSeason() {
      if (type !== 'tv' || !selectedSeason) return;
      try {
        const sData = await fetchSeasonDetails(id, selectedSeason);
        setSeasonData(sData);
      } catch (err) {
        console.error("Season load error:", err);
      }
    }

    loadSeason();
  }, [id, type, selectedSeason]);

  const backdrop = getImageUrl(media?.backdrop_path, 'backdrop') || getImageUrl(media?.poster_path, 'poster');
  const poster = getImageUrl(media?.poster_path, 'poster');
  const releaseYear = media?.release_date?.substring(0, 4) || media?.first_air_date?.substring(0, 4) || '2026';
  const runtime = media?.runtime || (media?.episode_run_time ? media?.episode_run_time[0] : null);

  const totalSeconds = watchProgress?.lastWatchedSeconds || 0;
  const durationSeconds = watchProgress?.durationSeconds || (type === 'movie' ? 7200 : 2700);
  const progressPercent = durationSeconds > 0 ? Math.min(Math.round((totalSeconds / durationSeconds) * 100), 100) : 0;

  const handlePlayClick = () => {
    if (type === 'tv' && watchProgress) {
      const targetSeason = watchProgress.season || selectedSeason;
      const targetEpisode = watchProgress.episode || 1;
      navigate(`/watch/tv/${id}/${targetSeason}/${targetEpisode}${totalSeconds > 0 ? `?startAt=${totalSeconds}` : ''}`);
    } else if (type === 'tv') {
      navigate(`/watch/tv/${id}/${selectedSeason}/1`);
    } else {
      navigate(`/watch/movie/${id}${totalSeconds > 0 ? `?startAt=${totalSeconds}` : ''}`);
    }
  };

  useDocumentTitle(media ? `${media.title || media.name} — WarayFlix` : 'Loading Details');

  if (loading) {
    return <PageLoader text="LOADING_STREAM_DETAILS..." />;
  }

  if (!media) return null;

  const castList = media?.credits?.cast?.slice(0, 10) || [];
  const recommendations = media?.recommendations?.results || media?.similar?.results || [];

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#09090B] pb-24 select-none">
      <DetailHeroVisual
        backdrop={backdrop}
        trailerKey={trailerKey}
        showVideo={showVideo}
        isMuted={isMuted}
        onToggleMute={() => setIsMuted(!isMuted)}
      />

      <div className="max-w-[1440px] mx-auto px-6 md:px-12 relative z-30 space-y-12">
        <DetailInfoSection
          media={media}
          type={type}
          poster={poster}
          releaseYear={releaseYear}
          runtime={runtime}
          watchProgress={watchProgress}
          progressPercent={progressPercent}
          totalSeconds={totalSeconds}
          isAdded={isAdded}
          user={user}
          onPlayClick={handlePlayClick}
          onToggleWatchlist={() => user ? toggle({ ...media, media_type: type }, user?.id) : openAuthModal()}
          onOpenParty={() => user ? navigate(`/party/${type}/${id}`) : openAuthModal()}
          onOpenShare={() => setShareOpen(true)}
        />

        <DetailCastSection castList={castList} />

        {type === 'tv' && (
          <DetailSeasonPicker
            media={media}
            selectedSeason={selectedSeason}
            onSelectSeason={setSelectedSeason}
            seasonData={seasonData}
            backdrop={backdrop}
          />
        )}

        {recommendations.length > 0 && (
          <div className="border-t border-black/[0.08] pt-8">
            <MediaRow 
              title="Similar Titles" 
              items={recommendations} 
              type={type} 
            />
          </div>
        )}
      </div>

      <ShareModal 
        isOpen={shareOpen} 
        onClose={() => setShareOpen(false)} 
        title={media.title || media.name} 
      />
    </div>
  );
}