import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchPersonDetails, getImageUrl } from '../services/tmdb';
import { ArrowLeft, Film, Star, Calendar, MapPin, SlidersHorizontal, Tv } from 'lucide-react';
import useDocumentTitle from '../hooks/useDocumentTitle';
import QuickViewModal from '../components/QuickViewModal';

export default function PersonPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [person, setPerson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [sortBy, setSortBy] = useState('popularity');
  const [quickMedia, setQuickMedia] = useState(null);

  useDocumentTitle(person ? `${person.name} — WarayFlix` : 'Actor Filmography');

  useEffect(() => {
    async function loadPerson() {
      try {
        setLoading(true);
        const data = await fetchPersonDetails(id);
        setPerson(data);
      } catch (err) {
        console.error("Failed to load person details:", err);
      } finally {
        setLoading(false);
      }
    }
    loadPerson();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#090A0F] flex items-center justify-center text-zinc-600 font-mono text-xs">
        LOADING_CREATIVE_PROFILE...
      </div>
    );
  }

  if (!person) return null;

  const profileImg = getImageUrl(person.profile_path, 'profileLarge') || getImageUrl(person.profile_path, 'profile');
  const rawCredits = person.combined_credits?.cast || [];

  // Filter out duplicates and items without poster
  const uniqueCreditsMap = new Map();
  rawCredits.forEach(c => {
    if (!uniqueCreditsMap.has(c.id) && (c.poster_path || c.backdrop_path)) {
      uniqueCreditsMap.set(c.id, c);
    }
  });
  const allCredits = Array.from(uniqueCreditsMap.values());

  // Filter by Type
  const filteredCredits = allCredits.filter(item => {
    if (activeFilter === 'movie') return item.media_type === 'movie';
    if (activeFilter === 'tv') return item.media_type === 'tv';
    return true;
  });

  // Sort
  filteredCredits.sort((a, b) => {
    if (sortBy === 'rating') {
      return (b.vote_average || 0) - (a.vote_average || 0);
    }
    if (sortBy === 'date') {
      const dateA = a.release_date || a.first_air_date || '';
      const dateB = b.release_date || b.first_air_date || '';
      return dateB.localeCompare(dateA);
    }
    return (b.popularity || 0) - (a.popularity || 0);
  });

  const age = person.birthday ? new Date().getFullYear() - new Date(person.birthday).getFullYear() : null;

  return (
    <div className="min-h-screen bg-[#090A0F] text-[#EDEDED] pt-24 sm:pt-28 px-6 md:px-12 pb-24 selection:bg-white selection:text-black">
      <div className="max-w-[1440px] mx-auto space-y-12">
        
        {/* Back Button */}
        <div>
          <button 
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-xs text-zinc-400 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] px-3.5 py-1.5 rounded-full border border-white/[0.08] transition cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 stroke-[1.5]" /> Back
          </button>
        </div>

        {/* Profile Header Deck */}
        <div className="flex flex-col md:flex-row gap-8 items-start pb-10 border-b border-white/[0.06]">
          
          {/* Avatar Photo */}
          <div className="w-40 sm:w-52 md:w-60 flex-shrink-0 aspect-[3/4] rounded-2xl overflow-hidden bg-[#11131A] border border-white/10 shadow-2xl relative flex items-center justify-center">
            {profileImg ? (
              <img 
                src={profileImg} 
                alt={person.name} 
                fetchPriority="high"
                onError={(e) => { e.target.style.display = 'none'; }}
                className="w-full h-full object-cover" 
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-zinc-600 font-mono text-xs">
                NO PHOTO
              </div>
            )}
          </div>

          {/* Bio & Details */}
          <div className="flex-1 space-y-4">
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
                {person.known_for_department || "Artist"} • {allCredits.length} Credits
              </span>
              <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white font-['Outfit']">
                {person.name}
              </h1>
            </div>

            {/* Quick Facts */}
            <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-zinc-400 pt-1">
              {person.birthday && (
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 stroke-[1.5] text-zinc-500" />
                  <span>Born {person.birthday} {age ? `(Age ${age})` : ''}</span>
                </div>
              )}
              {person.place_of_birth && (
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 stroke-[1.5] text-zinc-500" />
                  <span>{person.place_of_birth}</span>
                </div>
              )}
            </div>

            {/* Biography */}
            {person.biography && (
              <div className="space-y-1.5 pt-2">
                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">BIOGRAPHY</span>
                <p className="text-zinc-300 text-xs sm:text-sm leading-relaxed font-light line-clamp-6 max-w-4xl">
                  {person.biography}
                </p>
              </div>
            )}
          </div>

        </div>

        {/* Filmography Section */}
        <div className="space-y-6">
          
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-3.5 rounded-2xl bg-[#11131A] border border-white/[0.06]">
            
            {/* Filter Pills */}
            <div className="flex items-center gap-1.5">
              {[
                { id: 'all', label: `All (${allCredits.length})` },
                { id: 'movie', label: `Movies (${allCredits.filter(c => c.media_type === 'movie').length})` },
                { id: 'tv', label: `Series (${allCredits.filter(c => c.media_type === 'tv').length})` },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveFilter(tab.id)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition cursor-pointer ${
                    activeFilter === tab.id 
                      ? 'bg-white text-black font-semibold' 
                      : 'bg-white/[0.04] text-zinc-400 hover:text-white hover:bg-white/[0.08]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Sort Selector */}
            <div className="flex items-center gap-2 text-xs font-mono">
              <SlidersHorizontal className="w-3 h-3 stroke-[1.5] text-zinc-500" />
              <span className="text-zinc-500 hidden sm:inline">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-[#090A0F] border border-white/10 text-zinc-300 text-xs py-1 px-2.5 rounded-lg focus:outline-none transition cursor-pointer"
              >
                <option value="popularity">Most Popular</option>
                <option value="rating">Top Rated</option>
                <option value="date">Release Date</option>
              </select>
            </div>

          </div>

          {/* Filmography Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-4">
            {filteredCredits.map(item => {
              const itemType = item.media_type || (item.title ? 'movie' : 'tv');
              const poster = getImageUrl(item.poster_path, 'posterSmall') || getImageUrl(item.backdrop_path, 'backdropSmall');
              const year = item.release_date?.substring(0, 4) || item.first_air_date?.substring(0, 4) || '—';

              return (
                <div
                  key={`${item.id}-${item.credit_id || item.character}`}
                  onClick={() => navigate(`/details/${itemType}/${item.id}`)}
                  className="cursor-pointer group/item flex flex-col gap-2 flex-shrink-0 transition-all duration-200"
                >
                  <div className="relative aspect-[2/3] w-full rounded-xl overflow-hidden bg-[#11131A] border border-white/[0.06] group-hover/item:border-white/20 transition-all duration-200 group-hover/item:scale-[1.02] shadow-sm">
                    {poster ? (
                      <img 
                        src={poster} 
                        alt={item.title || item.name} 
                        loading="lazy"
                        className="w-full h-full object-cover transition duration-300 group-hover/item:brightness-105" 
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-600">
                        {itemType === 'tv' ? <Tv className="w-6 h-6 stroke-[1.5]" /> : <Film className="w-6 h-6 stroke-[1.5]" />}
                      </div>
                    )}

                    {item.vote_average > 0 && (
                      <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-md px-2 py-0.5 rounded-md flex items-center gap-1 border border-white/10 z-20">
                        <Star className="w-2.5 h-2.5 text-zinc-400 stroke-[1.5]" />
                        <span className="text-[10px] font-mono text-zinc-300">{item.vote_average.toFixed(1)}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-0.5 px-0.5">
                    <h3 className="text-xs font-semibold text-zinc-200 line-clamp-1 group-hover/item:text-white transition">
                      {item.title || item.name}
                    </h3>
                    <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono">
                      <span>{year}</span>
                      {item.character && (
                        <span className="truncate max-w-[100px] text-zinc-400">as {item.character}</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>

      </div>

      {quickMedia && (
        <QuickViewModal
          media={quickMedia}
          type={quickMedia.media_type || 'movie'}
          isOpen={Boolean(quickMedia)}
          onClose={() => setQuickMedia(null)}
        />
      )}
    </div>
  );
}

