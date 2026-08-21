import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchMediaByProvider, fetchMediaByCompany, IMAGE_BASE_URL } from '../services/tmdb';
import { ArrowLeft, Film, Star, ChevronDown, Play, Sparkles } from 'lucide-react';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { STUDIOS_LIST } from '../constants/studios';

export default function NetworkHubPage() {
  const { networkName, id } = useParams();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const formattedName = networkName ? networkName.toUpperCase() : 'STUDIO HUB';
  useDocumentTitle(`${formattedName} // Hub`);

  useEffect(() => {
    async function loadInitialNetworkMedia() {
      try {
        setLoading(true);
        setPage(1);
        let data = { results: [], total_pages: 1 };
        
        try {
          const res = await fetchMediaByProvider(id, 'movie', 1);
          data = { results: res || [], total_pages: 5 };
        } catch {
          const res = await fetchMediaByCompany(id, 1);
          data = { results: res || [], total_pages: 5 };
        }

        setItems(data.results || []);
        setTotalPages(data.total_pages || 1);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadInitialNetworkMedia();
  }, [id]);

  const loadMoreItems = async () => {
    if (page >= totalPages) return;
    try {
      setLoadingMore(true);
      const nextPage = page + 1;
      const currentStudio = STUDIOS_LIST.find(s => String(s.code) === String(id));
      let moreData = [];

      if (currentStudio?.type === 'company') {
        moreData = await fetchMediaByCompany(id, nextPage);
      } else {
        moreData = await fetchMediaByProvider(id, 'movie', nextPage);
      }

      setItems((prev) => [...prev, ...(moreData || [])]);
      setPage(nextPage);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMore(false);
    }
  };

  
  const leadItem = items[0];
  const remainingItems = items.slice(1);
  const leadBackdrop = leadItem?.backdrop_path ? `${IMAGE_BASE_URL}${leadItem.backdrop_path}` : null;

  return (
    <div className="min-h-screen bg-[#0B0D10] text-white pb-24 pt-28 px-6 md:px-16 selection:bg-white selection:text-black">
      <div className="max-w-[1400px] mx-auto space-y-12">
        
        {/* Navigation & Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-8">
          <div className="space-y-4">
            <button 
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 text-xs text-zinc-400 hover:text-white bg-[#1D2128]/50 hover:bg-[#1D2128] px-4 py-2 rounded-full border border-white/5 transition cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </button>

            <div>
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-zinc-400" /> Curated Studio Stream Directory
              </span>
              <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white capitalize font-['Outfit'] mt-1">
                {networkName || 'Studio Hub'}
              </h1>
            </div>
          </div>
        </div>

        {/* Content Section */}
        {loading ? (
          <div className="h-64 flex items-center justify-center text-xs font-mono text-zinc-500 tracking-widest">
            LOADING_EDITORIAL_HUB...
          </div>
        ) : items.length > 0 ? (
          <div className="space-y-16">
            
            {/* Editorial Lead Feature Showcase (Item #1) */}
            {leadItem && (
              <div 
                onClick={() => navigate(`/details/${leadItem.media_type || 'movie'}/${leadItem.id}`)}
                className="group relative rounded-3xl overflow-hidden bg-[#1D2128]/30 border border-white/10 cursor-pointer min-h-[400px] sm:min-h-[480px] flex flex-col justify-end p-6 sm:p-10 transition-all duration-500 hover:border-white/30"
              >
                {leadBackdrop && (
                  <img 
                    src={leadBackdrop} 
                    alt="" 
                    className="absolute inset-0 w-full h-full object-cover object-center brightness-[0.4] group-hover:scale-105 transition duration-700" 
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B0D10] via-[#0B0D10]/40 to-transparent" />

                <div className="relative z-10 max-w-2xl space-y-4">
                  <div className="flex items-center gap-3 text-xs font-mono">
                    <span className="px-2.5 py-1 rounded-md bg-white text-black font-bold uppercase tracking-wider text-[10px]">
                      Featured Lead
                    </span>
                    <span className="text-zinc-300">
                      {leadItem.release_date?.substring(0, 4) || leadItem.first_air_date?.substring(0, 4) || '2026'}
                    </span>
                    {leadItem.vote_average > 0 && (
                      <span className="flex items-center gap-1 text-amber-400 font-bold">
                        <Star className="w-3 h-3 fill-current" /> {leadItem.vote_average.toFixed(1)}
                      </span>
                    )}
                  </div>

                  <h2 className="text-2xl sm:text-4xl font-extrabold text-white font-['Outfit'] tracking-tight group-hover:text-zinc-200 transition-colors">
                    {leadItem.title || leadItem.name}
                  </h2>

                  <p className="text-zinc-300 text-xs sm:text-sm line-clamp-2 font-light leading-relaxed">
                    {leadItem.overview || "Explore this premier selection curated directly from the network archives."}
                  </p>

                  <div className="pt-2">
                    <span className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-white text-black text-xs font-bold uppercase tracking-wider transition hover:bg-zinc-200">
                      <Play className="w-3 h-3 fill-current" /> Watch Now
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Remaining Grid Showcase (Items #2 onwards) */}
            {remainingItems.length > 0 && (
              <div className="space-y-6">
                <h3 className="text-sm font-bold uppercase tracking-wider font-mono text-zinc-400">
                  Full Catalog Roster
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
                  {remainingItems.map((item, index) => {
                    const poster = item.poster_path ? `${IMAGE_BASE_URL}${item.poster_path}` : null;
                    const itemType = item.media_type || 'movie';

                    return (
                      <div
                        key={`${item.id}-${index}`}
                        onClick={() => navigate(`/details/${itemType}/${item.id}`)}
                        className="group cursor-pointer rounded-2xl overflow-hidden bg-[#1D2128]/20 border border-white/5 hover:border-white/15 transition-all duration-300 flex flex-col hover:-translate-y-1"
                      >
                        <div className="w-full aspect-[2/3] bg-[#0B0D10] relative overflow-hidden">
                          {poster ? (
                            <img 
                              src={poster} 
                              alt="" 
                              className="w-full h-full object-cover group-hover:scale-105 transition duration-500" 
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-zinc-600 text-xs">
                              <Film className="w-6 h-6 opacity-30" />
                            </div>
                          )}
                        </div>

                        <div className="p-3.5 space-y-1 bg-[#1D2128]/10">
                          <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono">
                            <span>{item.release_date?.substring(0, 4) || item.first_air_date?.substring(0, 4) || '2026'}</span>
                            {item.vote_average > 0 && (
                              <span className="flex items-center gap-0.5 text-amber-400">
                                <Star className="w-2.5 h-2.5 fill-current" /> {item.vote_average.toFixed(1)}
                              </span>
                            )}
                          </div>
                          <h4 className="text-xs font-bold text-zinc-200 group-hover:text-white line-clamp-1 transition-colors">
                            {item.title || item.name}
                          </h4>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Load More Button */}
            {page < totalPages && (
              <div className="flex justify-center pt-8">
                <button
                  onClick={loadMoreItems}
                  disabled={loadingMore}
                  className="px-10 py-4 rounded-full bg-[#1D2128]/60 hover:bg-[#1D2128] border border-white/10 hover:border-white/20 text-zinc-300 hover:text-white text-xs font-mono tracking-widest uppercase transition-all duration-300 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <span>{loadingMore ? 'FETCHING...' : 'LOAD MORE TITLES'}</span>
                  {!loadingMore && <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center text-xs text-zinc-500 font-mono tracking-widest">
            NO_TITLES_FOUND_FOR_THIS_STUDIO
          </div>
        )}

      </div>
    </div>
  );
}