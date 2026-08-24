import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchMediaDetails, fetchSeasonDetails, fetchMediaVideos, getImageUrl } from '../services/tmdb';
import { Play, ArrowLeft, Star, Clock, Layers, VolumeX, Volume2, Bookmark, Film, Users } from 'lucide-react';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { usePlaylist } from '../hooks/usePlaylist';
import MediaRow from '../components/MediaRow';

export default function DetailPage() {
  const { type, id } = useParams();
  const navigate = useNavigate();
  const [media, setMedia] = useState(null);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [seasonData, setSeasonData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [trailerKey, setTrailerKey] = useState(null);
  const [isMuted, setIsMuted] = useState(true);
  const [showVideo, setShowVideo] = useState(false);
  const [watchProgress, setWatchProgress] = useState(null);

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
        const trailer = (videos || []).find(v => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser'));
        if (trailer) {
          setTrailerKey(trailer.key);
          setTimeout(() => setShowVideo(true), 1200);
        } else {
          setTrailerKey(null);
          setShowVideo(false);
        }

        const savedHistory = JSON.parse(localStorage.getItem('warayflix_watch_history') || '[]');
        const existingProgress = savedHistory.find(item => item.id.toString() === id.toString());
        if (existingProgress) {
          setWatchProgress(existingProgress);
        } else {
          setWatchProgress(null);
        }
      } catch (err) {
        console.error("Detail load error:", err);
      } finally {
        setLoading(false);
      }
    }

    loadDetails();
  }, [id, type]);

  useEffect(() => {
    if (type === 'tv' && id) {
      async function loadSeason() {
        try {
          const data = await fetchSeasonDetails(id, selectedSeason);
          setSeasonData(data);
        } catch (err) {
          console.error("Season load error:", err);
          setSeasonData(null);
        }
      }
      loadSeason();
    }
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
    return (
      <div className="min-h-screen bg-[#090A0F] flex items-center justify-center text-zinc-600 font-mono text-xs">
        LOADING_STREAM_DETAILS...
      </div>
    );
  }

  if (!media) return null;

  const castList = media?.credits?.cast?.slice(0, 10) || [];
  const recommendations = media?.recommendations?.results || media?.similar?.results || [];

  return (
    <div className="min-h-screen bg-[#090A0F] text-[#EDEDED] pb-24">
      
      {/* Return Back Button */}
      <div className="fixed top-20 sm:top-24 left-6 z-40">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/60 hover:bg-black text-xs font-mono text-zinc-400 hover:text-white border border-white/10 backdrop-blur-xl transition cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5 stroke-[1.5]" />
          <span>BACK</span>
        </button>
      </div>

      {/* Hero Visual Area with Trailer / Backdrop */}
      <div className="relative h-[50vh] sm:h-[60vh] lg:h-[70vh] w-full overflow-hidden flex items-end">
        {backdrop && (
          <img 
            src={backdrop} 
            alt="" 
            fetchPriority="high"
            className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-1000 ${
              showVideo && trailerKey ? 'opacity-0' : 'opacity-35'
            }`}
          />
        )}

        {trailerKey && (
          <div className={`absolute inset-0 w-full h-full pointer-events-none overflow-hidden flex items-center justify-center transition-opacity duration-1000 ${
            showVideo ? 'opacity-70' : 'opacity-0'
          }`}>
            <div className="absolute w-[300%] h-[300%] md:w-[170%] md:h-[170%]">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${trailerKey}?autoplay=1&mute=${isMuted ? 1 : 0}&controls=0&loop=1&playlist=${trailerKey}&rel=0&iv_load_policy=3&disablekb=1&modestbranding=1`}
                title="Detail Trailer"
                className="w-full h-full object-cover border-0"
                allow="autoplay"
              />
            </div>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-[#090A0F] via-[#090A0F]/50 to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#090A0F]/90 via-[#090A0F]/30 to-transparent pointer-events-none" />

        {/* Sound toggle button */}
        {showVideo && trailerKey && (
          <div className="absolute bottom-8 right-8 z-30">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="w-9 h-9 rounded-full bg-black/60 hover:bg-black text-zinc-300 hover:text-white border border-white/10 backdrop-blur-xl flex items-center justify-center transition cursor-pointer"
              title={isMuted ? "Unmute Trailer" : "Mute Trailer"}
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5 stroke-[1.5]" /> : <Volume2 className="w-3.5 h-3.5 stroke-[1.5]" />}
            </button>
          </div>
        )}
      </div>

      {/* Main Content Info Container */}
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 -mt-20 sm:-mt-32 relative z-30 space-y-12">
        
        {/* Top Info Deck with Floating Poster */}
        <div className="flex flex-col md:flex-row gap-8 items-start">
          
          {/* Floating Poster Card */}
          <div className="w-44 sm:w-56 md:w-60 flex-shrink-0 aspect-[2/3] rounded-2xl overflow-hidden bg-[#11131A] border border-white/10 shadow-2xl relative hidden sm:block">
            {poster ? (
              <img src={poster} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-zinc-600">
                <Film className="w-8 h-8 opacity-30 stroke-[1.5]" />
              </div>
            )}
          </div>

          {/* Metadata & Actions */}
          <div className="flex-1 space-y-5">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-400 font-mono">
                <span className="px-2 py-0.5 rounded border border-white/10 text-white uppercase text-[10px]">
                  {type}
                </span>
                <span className="text-zinc-200">{releaseYear}</span>
                <span>·</span>
                {media.vote_average > 0 && (
                  <>
                    <span className="flex items-center gap-1 text-zinc-200">
                      <Star className="w-3 h-3 text-zinc-400 stroke-[1.5]" /> {media.vote_average.toFixed(1)}
                    </span>
                    <span>·</span>
                  </>
                )}
                {runtime && (
                  <span className="flex items-center gap-1 text-zinc-400">
                    <Clock className="w-3 h-3 stroke-[1.5]" /> {runtime}m
                  </span>
                )}
                <span className="text-zinc-500 text-[11px]">4K ULTRA HD</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white font-['Outfit'] leading-[1.05]">
                {media.title || media.name}
              </h1>

              {/* Genres */}
              {media.genres && media.genres.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {media.genres.map((g) => (
                    <span key={g.id} className="px-2.5 py-0.5 rounded border border-white/[0.08] text-[11px] text-zinc-400 font-mono">
                      {g.name}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Saved Progress Bar if applicable */}
            {watchProgress && totalSeconds > 0 && (
              <div className="space-y-1.5 max-w-md p-3 rounded-xl bg-white/[0.03] border border-white/[0.08]">
                <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400">
                  <span>RESUME PROGRESS</span>
                  <span className="text-zinc-200">{progressPercent}%</span>
                </div>
                <div className="w-full bg-zinc-800/80 h-1 rounded-full overflow-hidden">
                  <div 
                    className="bg-white h-full rounded-full transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button 
                onClick={handlePlayClick}
                className="px-7 py-2.5 rounded-full bg-white hover:bg-zinc-200 text-black font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 stroke-[2] text-black" />
                <span>{watchProgress && totalSeconds > 0 ? 'Resume Watching' : 'Start Watching'}</span>
              </button>

              <button 
                onClick={() => toggle({ ...media, media_type: type })}
                className={`px-5 py-2.5 rounded-full border text-xs font-medium uppercase tracking-wider flex items-center gap-2 transition cursor-pointer backdrop-blur-md ${
                  isAdded 
                    ? 'bg-white/10 border-white/30 text-white' 
                    : 'bg-white/[0.04] border-white/10 text-zinc-400 hover:border-white/30 hover:text-white'
                }`}
              >
                <Bookmark className="w-3.5 h-3.5 stroke-[1.5]" />
                <span>{isAdded ? 'In Watchlist' : 'Add to Watchlist'}</span>
              </button>
            </div>

            {/* Synopsis */}
            <div className="space-y-1.5 pt-3 border-t border-white/[0.06]">
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">SYNOPSIS</span>
              <p className="text-zinc-300 text-sm leading-relaxed font-light max-w-3xl">
                {media.overview || "No synopsis available for this selection."}
              </p>
            </div>

          </div>
        </div>

        {/* Cast Section */}
        {castList.length > 0 && (
          <div className="space-y-3 pt-4 border-t border-white/[0.06]">
            <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 uppercase tracking-wider">
              <Users className="w-3.5 h-3.5 stroke-[1.5]" />
              <span>Cast & Crew</span>
            </div>
            
            <div className="flex gap-4 overflow-x-auto scrollbar-none pb-2 pt-1">
              {castList.map((actor) => {
                const profileImg = getImageUrl(actor.profile_path, 'thumbnail');
                return (
                  <div 
                    key={actor.id} 
                    onClick={() => navigate(`/person/${actor.id}`)}
                    className="w-20 sm:w-24 flex-shrink-0 space-y-1.5 text-center group cursor-pointer"
                  >
                    <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-full overflow-hidden bg-[#11131A] border border-white/10 group-hover:border-white/30 transition shadow-sm relative flex items-center justify-center">
                      {profileImg ? (
                        <img 
                          src={profileImg} 
                          alt={actor.name} 
                          loading="lazy"
                          onError={(e) => { e.target.style.display = 'none'; }}
                          className="w-full h-full object-cover group-hover:scale-105 transition" 
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-600 font-mono text-[9px]">
                          CAST
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="text-[11px] font-medium text-zinc-200 group-hover:text-white truncate transition-colors">
                        {actor.name}
                      </h4>
                      <p className="text-[9px] text-zinc-500 font-mono truncate">
                        {actor.character}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TV Series Seasons & Episodes Browser */}
        {type === 'tv' && media.seasons && media.seasons.length > 0 && (
          <div className="border-t border-white/[0.06] pt-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-zinc-400 stroke-[1.5]" />
                <h3 className="text-lg font-bold text-white font-['Outfit']">Episodes</h3>
              </div>

              {/* Season Select */}
              <div className="relative">
                <select
                  value={selectedSeason}
                  onChange={(e) => setSelectedSeason(Number(e.target.value))}
                  className="appearance-none bg-[#11131A] hover:bg-[#161922] border border-white/10 text-zinc-300 text-xs font-mono py-2 pl-3.5 pr-8 rounded-xl focus:outline-none transition cursor-pointer"
                >
                  {media.seasons.map((season) => (
                    <option key={season.id} value={season.season_number} className="bg-[#090A0F] text-zinc-300">
                      {season.name} {season.episode_count ? `(${season.episode_count} Ep)` : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Episodes Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {seasonData?.episodes && seasonData.episodes.length > 0 ? (
                seasonData.episodes.map((ep) => {
                  const epStill = getImageUrl(ep.still_path, 'backdropSmall') || backdrop;
                  return (
                    <div 
                      key={ep.id}
                      onClick={() => navigate(`/watch/tv/${media.id}/${selectedSeason}/${ep.episode_number}`)}
                      className="group flex gap-3 p-2.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.04] hover:border-white/10 cursor-pointer transition-all duration-200"
                    >
                      <div className="w-28 sm:w-36 aspect-video rounded-lg bg-black overflow-hidden flex-shrink-0 relative">
                        {epStill ? (
                          <img src={epStill} alt="" className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-zinc-700 text-[9px] font-mono">NO IMAGE</div>
                        )}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                          <Play className="w-5 h-5 text-white stroke-[2]" />
                        </div>
                      </div>

                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500">
                          <span>EP {ep.episode_number}</span>
                          {ep.runtime && <span>{ep.runtime}m</span>}
                        </div>
                        <h4 className="text-xs font-medium text-zinc-200 group-hover:text-white truncate">
                          {ep.name}
                        </h4>
                        <p className="text-[11px] text-zinc-500 line-clamp-1 font-light">
                          {ep.overview || "Stream this episode now."}
                        </p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="col-span-2 text-xs text-zinc-600 font-mono py-8 text-center">
                  Loading season episodes...
                </div>
              )}
            </div>
          </div>
        )}

        {/* Similar & Recommendations Row */}
        {recommendations.length > 0 && (
          <div className="border-t border-white/[0.06] pt-8">
            <MediaRow 
              title="Similar Titles" 
              items={recommendations} 
              type={type} 
            />
          </div>
        )}

      </div>

    </div>
  );
}