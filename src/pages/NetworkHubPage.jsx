import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchMediaByProvider, fetchMediaByCompany, IMAGE_BASE_URL } from '../services/tmdb';
import { ArrowLeft, Film, Star } from 'lucide-react';

export default function NetworkHubPage() {
  const { networkName, id } = useParams();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadNetworkMedia() {
      try {
        setLoading(true);
        // Try fetching via provider first, fallback or combine company endpoints as needed
        let data = [];
        try {
          data = await fetchMediaByProvider(id, 'movie', 1);
        } catch {
          data = await fetchMediaByCompany(id);
        }
        setItems(data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadNetworkMedia();
  }, [id]);

  return (
    <div className="min-h-screen bg-[#0B0D10] text-white pb-20 pt-28 px-6 md:px-16">
      <div className="max-w-[1400px] mx-auto space-y-8">
        
        {/* Back Button & Title Header */}
        <div className="space-y-4">
          <button 
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-xs text-zinc-400 hover:text-white bg-[#1D2128]/50 hover:bg-[#1D2128] px-4 py-2 rounded-full border border-white/5 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </button>

          <div>
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Hub Collection</span>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white capitalize font-['Outfit'] mt-1">
              {networkName || 'Studio Hub'}
            </h1>
          </div>
        </div>

        {/* Media Grid */}
        {loading ? (
          <div className="text-xs font-mono text-zinc-500 py-20 text-center">Loading hub catalog...</div>
        ) : items.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {items.map((item) => {
              const poster = item.poster_path ? `${IMAGE_BASE_URL}${item.poster_path}` : null;
              const itemType = item.media_type || 'movie';

              return (
                <div
                  key={item.id}
                  onClick={() => navigate(`/details/${itemType}/${item.id}`)}
                  className="group cursor-pointer rounded-2xl overflow-hidden bg-[#1D2128]/40 border border-white/5 hover:border-white/10 transition-all duration-300 flex flex-col"
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

                  <div className="p-3 space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono">
                      <span>{item.release_date?.substring(0, 4) || item.first_air_date?.substring(0, 4) || '2026'}</span>
                      {item.vote_average > 0 && (
                        <span className="flex items-center gap-0.5 text-amber-400">
                          <Star className="w-2.5 h-2.5 fill-current" /> {item.vote_average.toFixed(1)}
                        </span>
                      )}
                    </div>
                    <h3 className="text-xs font-bold text-zinc-200 group-hover:text-white line-clamp-1 transition-colors">
                      {item.title || item.name}
                    </h3>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-xs text-zinc-500 py-20 text-center">No titles found for this studio hub.</div>
        )}

      </div>
    </div>
  );
}