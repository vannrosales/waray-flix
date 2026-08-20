import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { searchMultiMedia, IMAGE_BASE_URL } from '../services/tmdb';
import { Film } from 'lucide-react';

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    async function performSearch() {
      if (!query.trim()) return;
      try {
        const data = await searchMultiMedia(query);
        setResults(data);
      } catch (err) {
        console.error("Search failure:", err);
      }
    }
    performSearch();
  }, [query]);

  return (
    <div className="min-h-screen bg-[#09090b] text-[#F3F4F4] pt-28 px-6 md:px-12 pb-16">
      <h1 className="text-2xl font-bold mb-6">Search Results for "{query}"</h1>
      {results.length === 0 ? (
        <p className="text-zinc-500">No matching videos found.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
          {results.map(item => {
            const itemType = item.media_type || 'movie';
            return (
              <div 
                key={item.id} 
                onClick={() => navigate(`/details/${itemType}/${item.id}`)}
                className="group relative cursor-pointer overflow-hidden rounded-lg bg-[#2C2C2C] transition transform hover:scale-105 shadow-md border border-zinc-800 aspect-[2/3] flex items-center justify-center"
              >
                {item.poster_path ? (
                  <img 
                    src={`${IMAGE_BASE_URL}${item.poster_path}`} 
                    alt={item.title || item.name} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center p-4 text-center text-zinc-400">
                    <Film className="w-8 h-8 mb-2 opacity-50" />
                    <span className="text-xs font-semibold">{item.title || item.name}</span>
                  </div>
                )}
                
                <div className="absolute inset-0 bg-black/75 opacity-0 group-hover:opacity-100 transition flex items-center justify-center p-3 text-center font-bold text-sm">
                  {item.title || item.name}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}