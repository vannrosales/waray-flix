import { CONFIG } from '../config/siteConfig';
import { botShield } from '../utils/botShield';

const BASE_URL = "https://api.themoviedb.org/3";
export const IMAGE_BASE_URL = "https://image.tmdb.org/t/p";

// Optimized Image sizing helper for massive bandwidth & rendering speedup
export const IMAGE_SIZES = {
  poster: 'w500',
  posterSmall: 'w342',
  backdrop: 'w1280',
  backdropSmall: 'w780',
  thumbnail: 'w185',
  profile: 'w185',
  profileLarge: 'h632',
  original: 'original'
};

export function getImageUrl(path, size = 'w500') {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  const targetSize = IMAGE_SIZES[size] || size;
  return `${IMAGE_BASE_URL}/${targetSize}${path}`;
}

// In-Memory & Session Storage Cache to eliminate redundant network requests
const memoryCache = new Map();
const CACHE_TTL_MS = 1000 * 60 * 10; // 10 minutes cache

export async function fetchFromTMDB(endpoint, params = {}) {
  const urlParams = new URLSearchParams({
    api_key: CONFIG.tmdbApiKey,
    include_adult: 'false',
    ...params
  });
  const fullUrl = `${BASE_URL}${endpoint}?${urlParams.toString()}`;
  const cacheKey = `tmdb_cache_${fullUrl}`;

  // 1. Check in-memory cache
  const cached = memoryCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  // 2. Anti-Bot / Rate-limiting Guard
  if (!botShield.shouldAllowRequest()) {
    if (cached) return cached.data;
    console.warn(`[BotShield] Throttled rapid automated request to ${endpoint}`);
    return [];
  }

  // 2. Fetch from network with deduping
  try {
    const res = await fetch(fullUrl);
    if (!res.ok) throw new Error(`TMDB HTTP error: ${res.status}`);
    const data = await res.json();
    let result = data.results !== undefined ? data.results : data;

    if (Array.isArray(result)) {
      result = result.filter(item => item && !item.adult);
    }

    // Save to memory cache
    memoryCache.set(cacheKey, {
      data: result,
      timestamp: Date.now()
    });

    return result;
  } catch (error) {
    console.error(`Fetch failed for ${endpoint}:`, error);
    throw error;
  }
}

export async function fetchTrendingMovies() {
  return fetchFromTMDB('/trending/movie/day');
}

export async function fetchTrendingShows() {
  return fetchFromTMDB('/trending/tv/day');
}

export async function fetchPopularMovies(page = 1) {
  return fetchFromTMDB('/movie/popular', { page });
}

export async function fetchTopRatedMovies(page = 1) {
  return fetchFromTMDB('/movie/top_rated', { page });
}

export async function fetchPopularShows(page = 1) {
  return fetchFromTMDB('/tv/popular', { page });
}

export async function fetchTopRatedShows(page = 1) {
  return fetchFromTMDB('/tv/top_rated', { page });
}

export async function fetchUpcomingMovies(page = 1) {
  return fetchFromTMDB('/movie/upcoming', { page });
}

export async function fetchNowPlayingMovies(page = 1) {
  return fetchFromTMDB('/movie/now_playing', { page });
}

export async function fetchAiringTodayShows(page = 1) {
  return fetchFromTMDB('/tv/airing_today', { page });
}

export async function fetchOnTheAirShows(page = 1) {
  return fetchFromTMDB('/tv/on_the_air', { page });
}

export async function fetchMoviesByGenre(genreId, page = 1) {
  return fetchFromTMDB('/discover/movie', { with_genres: genreId, page });
}

export async function fetchShowsByGenre(genreId, page = 1) {
  return fetchFromTMDB('/discover/tv', { with_genres: genreId, page });
}

export async function fetchMediaDetails(id, type = 'movie') {
  return fetchFromTMDB(`/${type}/${id}`, {
    append_to_response: 'credits,recommendations,similar,videos'
  });
}

export async function searchMultiMedia(query) {
  if (!query || !query.trim()) return [];
  const data = await fetchFromTMDB('/search/multi', { query: query.trim(), include_adult: 'false' });
  return (data || []).filter(
    item =>
      (item.media_type === 'movie' || item.media_type === 'tv') &&
      (item.poster_path || item.backdrop_path) &&
      !item.adult
  );
}

export async function fetchSeasonDetails(seriesId, seasonNumber) {
  return fetchFromTMDB(`/tv/${seriesId}/season/${seasonNumber}`);
}

export async function fetchMediaByProvider(providerId, type = 'movie', page = 1) {
  const endpoint = type === 'movie' ? '/discover/movie' : '/discover/tv';
  return fetchFromTMDB(endpoint, {
    with_watch_providers: providerId,
    watch_region: 'US',
    page: page,
    sort_by: 'popularity.desc'
  });
}

export async function fetchMediaByCompany(companyId, page = 1) {
  return fetchFromTMDB('/discover/movie', {
    with_companies: companyId,
    page: page,
    sort_by: 'popularity.desc'
  });
}

export async function fetchMediaVideos(id, type) {
  try {
    const data = await fetchFromTMDB(`/${type}/${id}/videos`);
    return data || [];
  } catch (err) {
    console.error("Error fetching media videos:", err);
    return [];
  }
}

export async function fetchTop10MoviesToday() {
  const data = await fetchFromTMDB('/trending/movie/day');
  return (data || []).slice(0, 10);
}

export async function fetchTop10ShowsToday() {
  const data = await fetchFromTMDB('/trending/tv/day');
  return (data || []).slice(0, 10);
}

// Actor / Person details with filmography combined credits
export async function fetchPersonDetails(personId) {
  return fetchFromTMDB(`/person/${personId}`, {
    append_to_response: 'combined_credits,external_ids,images'
  });
}

// Random media picker by genre/mood
export async function fetchRandomMediaByGenre(genreIds, type = 'movie') {
  const page = Math.floor(Math.random() * 3) + 1;
  const endpoint = type === 'movie' ? '/discover/movie' : '/discover/tv';
  const params = {
    sort_by: 'popularity.desc',
    'vote_count.gte': '150',
    'vote_average.gte': '6.5',
    page
  };
  if (genreIds && genreIds !== 'all') {
    params.with_genres = genreIds;
  }
  const results = await fetchFromTMDB(endpoint, params);
  const valid = (results || []).filter(item => item.poster_path && item.backdrop_path);
  if (valid.length === 0) return null;
  const randomIndex = Math.floor(Math.random() * valid.length);
  return { ...valid[randomIndex], media_type: type };
}

// Fetch a curated list of trending movies with verified YouTube trailer keys
export async function fetchTrailersFeed() {
  const [upcoming, trending] = await Promise.all([
    fetchUpcomingMovies(1),
    fetchTrendingMovies()
  ]);

  const candidates = [...(upcoming || []), ...(trending || [])].slice(0, 15);
  
  const itemsWithTrailers = await Promise.all(
    candidates.map(async (item) => {
      try {
        const itemType = item.media_type || (item.title ? 'movie' : 'tv');
        const videos = await fetchMediaVideos(item.id, itemType);
        const trailer = (videos || []).find(
          v => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser')
        );
        if (trailer) {
          return { ...item, media_type: itemType, trailerKey: trailer.key };
        }
        return null;
      } catch {
        return null;
      }
    })
  );

  return itemsWithTrailers.filter(Boolean);
}

// Fetch complete collection / franchise details
export async function fetchCollectionDetails(collectionId) {
  return fetchFromTMDB(`/collection/${collectionId}`);
}
