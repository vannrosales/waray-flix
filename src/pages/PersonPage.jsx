import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchPersonDetails, getImageUrl } from '../services/tmdb';
import { ArrowLeft, Film, Star, Calendar, MapPin, SlidersHorizontal } from 'lucide-react';
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
      <div className="min-h-screen bg-[#0F0F12] flex items-center justify-center text-zinc-400 font-mono text-xs">
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

  return (
    <div className="min-h-screen bg-[#0F0F12] text-[#F4F4F5] pb-24 pt-24 sm:pt-28 px-6 md:px-12 select-none">
      <div className="max-w-[1440px] mx-auto space-y-10">
        
        {/* Back Button */}
        <div>
          <button 
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-xs font-mono text-zinc-400 hover:text-white bg-[#18181C] hover:bg-[#222228] px-3.5 py-1.5 rounded-full border border-white/10 transition cursor-pointer shadow-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5 stroke-[1.5]" /> Back
          </button>
        </div>

        {/* Profile Header Hero */}
        <div className="flex flex-col md:flex-row gap-8 items-start pb-8 border-b border-white/[0.08]">
          {/* Avatar Photo */}
          <div className="w-36 sm:w-48 aspect-[2/3] rounded-3xl overflow-hidden bg-[#18181C] border border-white/10 flex-shrink-0 shadow-xl relative">
            {profileImg ? (
              <img src={profileImg} alt={person.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-zinc-500 bg-[#18181C] font-mono text-xs">
                NO PHOTO
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex-1 space-y-4">
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-white font-bold uppercase tracking-widest block">
                {person.known_for_department || 'Acting & Directing'}
              </span>
              <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white font-['Outfit']">
                {person.name}
              </h1>
            </div>

            {/* Quick Metadata Chips */}
            <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-zinc-400">
              {person.birthday && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 stroke-[1.5]" />
                  <span>Born: {person.birthday}</span>
                </span>
              )}
              {person.place_of_birth && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 stroke-[1.5]" />
                  <span>{person.place_of_birth}</span>
                </span>
              )}
            </div>

            {/* Biography */}
            {person.biography && (
              <div className="space-y-1 pt-1">
                <span className="text-[10px] font-mono text-zinc-400 uppercase font-bold tracking-wider block">Biography</span>
                <p className="text-zinc-300 text-xs sm:text-sm leading-relaxed max-w-3xl line-clamp-4 font-normal">
                  {person.biography}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Filmography Section */}
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Film className="w-4 h-4 text-white stroke-[1.5]" />
              <h2 className="text-lg sm:text-xl font-bold text-white font-['Outfit']">
                Filmography ({filteredCredits.length})
              </h2>
            </div>

            <div className="flex items-center gap-3">
              {/* Filter Tabs */}
              <div className="flex items-center gap-1 bg-[#18181C] p-1 rounded-full border border-white/[0.06] text-xs font-mono">
                {['all', 'movie', 'tv'].map((t) => (
                  <button
                    key={t}
                    onClick={() => setActiveFilter(t)}
                    className={`px-3 py-1 rounded-full transition cursor-pointer capitalize ${
                      activeFilter === t
                        ? 'bg-white text-black font-bold shadow-sm'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    {t === 'all' ? 'All' : t === 'movie' ? 'Movies' : 'Series'}
                  </button>
                ))}
              </div>

              {/* Sort Select */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none bg-[#18181C] hover:bg-[#222228] border border-white/10 text-white text-xs font-mono py-1.5 pl-3 pr-8 rounded-full focus:outline-none focus:border-white/40 transition cursor-pointer shadow-sm"
                >
                  <option value="popularity" className="bg-[#18181C] text-white">Most Popular</option>
                  <option value="rating" className="bg-[#18181C] text-white">Top Rated</option>
                  <option value="date" className="bg-[#18181C] text-white">Release Date</option>
                </select>
                <SlidersHorizontal className="w-3 h-3 text-zinc-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Filmography Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5 sm:gap-4">
            {filteredCredits.map((item) => {
              const poster = getImageUrl(item.poster_path, 'posterSmall') || getImageUrl(item.backdrop_path, 'backdropSmall');
              const itemType = item.media_type || 'movie';
              const releaseYear = (item.release_date || item.first_air_date || '').substring(0, 4);

              return (
                <div
                  key={`${item.id}-${itemType}`}
                  onClick={() => navigate(`/details/${itemType}/${item.id}`)}
                  className="cursor-pointer group/item flex flex-col gap-2 flex-shrink-0 transition-all duration-200"
                >
                  {/* Poster Card */}
                  <div className="relative aspect-[2/3] w-full rounded-2xl overflow-hidden bg-[#18181C] border border-white/[0.06] group-hover/item:border-white/40 transition-all duration-200 group-hover/item:scale-[1.02] shadow-sm hover:shadow-md">
                    {poster ? (
                      <img 
                        src={poster} 
                        alt={item.title || item.name} 
                        loading="lazy"
                        className="w-full h-full object-cover transition duration-300 group-hover/item:brightness-105" 
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-3 text-center text-zinc-500 bg-[#18181C] text-xs">
                        <Film className="w-6 h-6 opacity-30 stroke-[1.5]" />
                      </div>
                    )}

                    {/* Rating Badge */}
                    {item.vote_average > 0 && (
                      <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-md px-2 py-0.5 rounded-md flex items-center gap-1 border border-white/20 z-20 shadow-sm text-white">
                        <Star className="w-2.5 h-2.5 text-white fill-white stroke-[1.5]" />
                        <span className="text-[10px] font-mono font-bold text-white">{item.vote_average.toFixed(1)}</span>
                      </div>
                    )}
                  </div>

                  {/* Title & Role */}
                  <div className="space-y-0.5 px-0.5">
                    <h3 className="text-xs font-semibold text-white line-clamp-1 group-hover/item:text-zinc-300 transition">
                      {item.title || item.name}
                    </h3>
                    <div className="flex items-center justify-between text-[10px] text-zinc-400 font-mono">
                      <span>{releaseYear || '—'}</span>
                      {item.character && (
                        <span className="text-zinc-400 truncate max-w-[90px]" title={item.character}>
                          as {item.character}
                        </span>
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
          type="movie"
          isOpen={Boolean(quickMedia)}
          onClose={() => setQuickMedia(null)}
        />
      )}
    </div>
  );
}
