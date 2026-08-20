import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchMediaDetails, fetchSeasonDetails, IMAGE_BASE_URL } from '../services/tmdb';
import { Play, ArrowLeft, Star, Clock, Layers, Film } from 'lucide-react';
import useDocumentTitle from '../hooks/useDocumentTitle';

export default function DetailPage() {
  useDocumentTitle(media ? media.title || media.name : 'Loading Details');
  const { type, id } = useParams();
  const navigate = useNavigate();
  const [media, setMedia] = useState(null);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [seasonData, setSeasonData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDetails() {
      try {
        setLoading(true);
        const data = await fetchMediaDetails(id, type);
        setMedia(data);
        if (type === 'tv' && data.seasons && data.seasons.length > 0) {
          const firstSeason = data.seasons.find(s => s.season_number > 0) || data.seasons[0];
          setSelectedSeason(firstSeason.season_number);
        }
      } catch (err) {
        console.error(err);
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
          console.error(err);
          setSeasonData(null);
        }
      }
      loadSeason();
    }
  }, [id, type, selectedSeason]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0D10] flex items-center justify-center text-zinc-600 font-mono text-xs">
        INITIALIZING_VIEWPORT_
      </div>
    );
  }

  if (!media) return null;

  const backdrop = media.backdrop_path ? `${IMAGE_BASE_URL}${media.backdrop_path}` : null;
  const poster = media.poster_path ? `${IMAGE_BASE_URL}${media.poster_path}` : null;
  const releaseYear = media.release_date?.substring(0, 4) || media.first_air_date?.substring(0, 4) || '2026';
  const runtime = media.runtime || media.episode_run_time?.[0] || 120;

  return (
    <div className="min-h-screen bg-[#0B0D10] text-white selection:bg-white selection:text-black">
      
      {/* Top Floating Return Navigation */}
      <div className="fixed top-24 left-6 md:left-16 z-40">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#1D2128]/60 hover:bg-[#1D2128] text-xs font-mono text-zinc-400 hover:text-white border border-white/5 backdrop-blur-md transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>BACK</span>
        </button>
      </div>

      {/* Split-Screen Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-screen">
        
        {/* Left Fixed Architectural Visual Panel */}
        <div className="lg:col-span-5 relative h-[50vh] lg:h-screen w-full bg-[#0B0D10] border-r border-white/5 overflow-hidden sticky top-0">
          {backdrop ? (
            <img src={backdrop} alt="" className="absolute inset-0 w-full h-full object-cover brightness-[0.35]" />
          ) : poster ? (
            <img src={poster} alt="" className="absolute inset-0 w-full h-full object-cover brightness-[0.35]" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-zinc-700">
              <Film className="w-12 h-12 opacity-30" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0D10] via-transparent to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-[#0B0D10]" />
          
          <div className="absolute bottom-8 left-8 hidden lg:block">
            <span className="text-[10px] font-mono text-zinc-500 tracking-[0.3em] uppercase">
              WARAYFLIX ARCHITECTURAL FEED
            </span>
          </div>
        </div>

        {/* Right Scrollable Content Stream */}
        <div className="lg:col-span-7 px-6 md:px-20 py-32 space-y-16">
          
          {/* Title & Metadata Header */}
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-500 font-mono tracking-wider">
              <span className="text-white font-medium">{releaseYear}</span>
              <span>•</span>
              <span className="uppercase">{type}</span>
              {media.vote_average > 0 && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-amber-400 font-bold">
                    <Star className="w-3.5 h-3.5 fill-current" /> {media.vote_average.toFixed(1)}
                  </span>
                </>
              )}
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> {runtime}m
              </span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white font-['Outfit'] leading-tight">
              {media.title || media.name}
            </h1>

            {media.genres && (
              <div className="flex flex-wrap gap-2 pt-2">
                {media.genres.map((g) => (
                  <span key={g.id} className="px-3 py-1 rounded-lg bg-[#1D2128]/50 border border-white/5 text-[11px] text-zinc-400 font-mono">
                    {g.name}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Action Deck & Synopsis Block */}
          <div className="space-y-8 border-t border-white/5 pt-8">
            <div className="space-y-3">
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Synopsis</span>
              <p className="text-zinc-300 text-sm sm:text-base leading-relaxed font-light">
                {media.overview || "No synopsis available for this selection."}
              </p>
            </div>

            <div className="pt-2">
              <button 
                onClick={() => navigate(`/watch/${type}/${media.id}`)}
                className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-transparent hover:bg-white text-zinc-300 hover:text-black font-semibold text-xs tracking-widest uppercase flex items-center justify-center gap-2.5 transition-all duration-300 border border-white/20 hover:border-white"
              >
                <Play className="w-3 h-3 fill-current" />
                <span>Play</span>
              </button>
            </div>
          </div>

          {/* TV Series Minimalist Chapter List with Stills */}
          {type === 'tv' && media.seasons && media.seasons.length > 0 && (
            <div className="border-t border-white/5 pt-12 space-y-8">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2.5">
                  <Layers className="w-4 h-4 text-zinc-400" />
                  <h3 className="text-base font-bold text-white">Season Modules</h3>
                </div>

                {/* Season Selectors */}
                <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-2">
                  {media.seasons.map((season) => (
                    <button
                      key={season.id}
                      onClick={() => setSelectedSeason(season.season_number)}
                      className={`px-4 py-1.5 rounded-xl text-xs font-mono transition-all flex-shrink-0 ${
                        selectedSeason === season.season_number 
                          ? 'bg-white text-black font-bold' 
                          : 'bg-[#1D2128]/40 text-zinc-400 hover:text-white border border-white/5'
                      }`}
                    >
                      {season.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Episode Sequence with Pictures */}
              <div className="space-y-4">
                {seasonData && seasonData.episodes && seasonData.episodes.length > 0 ? (
                  seasonData.episodes.map((ep) => {
                    const epStill = ep.still_path ? `${IMAGE_BASE_URL}${ep.still_path}` : backdrop;
                    return (
                      <div 
                        key={ep.id}
                        onClick={() => navigate(`/watch/tv/${media.id}/${selectedSeason}/${ep.episode_number}`)}
                        className="group flex flex-col sm:flex-row items-start sm:items-center gap-4 p-3 rounded-2xl bg-[#1D2128]/20 hover:bg-[#1D2128]/60 border border-white/5 cursor-pointer transition-all"
                      >
                        {/* Episode Still Picture Thumbnail */}
                        <div className="w-full sm:w-36 h-20 rounded-xl bg-[#0B0D10] overflow-hidden flex-shrink-0 relative">
                          {epStill ? (
                            <img src={epStill} alt="" className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-zinc-700 text-[10px] font-mono">NO IMAGE</div>
                          )}
                          <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent transition flex items-center justify-center">
                            <Play className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition fill-current" />
                          </div>
                        </div>

                        {/* Episode Metadata */}
                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500">
                            <span>EPISODE {ep.episode_number}</span>
                            {ep.runtime && <span>{ep.runtime}m</span>}
                          </div>
                          <h4 className="text-xs sm:text-sm font-medium text-zinc-200 group-hover:text-white transition-colors truncate">
                            {ep.name}
                          </h4>
                          <p className="text-[11px] text-zinc-500 line-clamp-1 font-light">
                            {ep.overview || "No description provided."}
                          </p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-xs text-zinc-600 font-mono py-8 text-center">
                    Loading season episodes...
                  </div>
                )}
              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
}