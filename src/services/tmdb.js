import { CONFIG } from '../config/siteConfig';

const BASE_URL = "https://api.themoviedb.org/3";
export const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/original";

export async function fetchFromTMDB(endpoint, params = {}) {
  const urlParams = new URLSearchParams({
    api_key: CONFIG.tmdbApiKey,
    ...params
  });
  const res = await fetch(`${BASE_URL}${endpoint}?${urlParams.toString()}`);
  if (!res.ok) throw new Error("Failed to fetch data from TMDB");
  const data = await res.json();
  return data.results || data;
}

export async function fetchTrendingMovies() {
  return fetchFromTMDB('/trending/movie/day');
}

export async function fetchTrendingShows() {
  return fetchFromTMDB('/trending/tv/day');
}

export async function fetchPopularMovies() {
  return fetchFromTMDB('/movie/popular');
}

export async function fetchTopRatedMovies() {
  return fetchFromTMDB('/movie/top_rated');
}

export async function fetchPopularShows() {
  return fetchFromTMDB('/tv/popular');
}

export async function fetchTopRatedShows() {
  return fetchFromTMDB('/tv/top_rated');
}

export async function fetchMoviesByGenre(genreId) {
  const data = await fetchFromTMDB('/discover/movie', { with_genres: genreId });
  return data;
}

export async function fetchShowsByGenre(genreId) {
  const data = await fetchFromTMDB('/discover/tv', { with_genres: genreId });
  return data;
}

export async function fetchMediaDetails(id, type = 'movie') {
  return fetchFromTMDB(`/${type}/${id}`);
}

export async function searchMultiMedia(query) {
  const data = await fetchFromTMDB('/search/multi', { query });
  return (data || []).filter(item => item.media_type === 'movie' || item.media_type === 'tv');
}

export async function fetchSeasonDetails(seriesId, seasonNumber) {
  return fetchFromTMDB(`/tv/${seriesId}/season/${seasonNumber}`);
}

export async function fetchMediaByProvider(providerId, type = 'movie', page = 1) {
  const endpoint = type === 'movie' ? '/discover/movie' : '/discover/tv';
  return fetchFromTMDB(endpoint, {
    with_watch_providers: providerId,
    watch_region: 'US',
    page: page
  });
}

export async function fetchMediaByCompany(companyId) {
  return fetchFromTMDB('/discover/movie', {
    with_companies: companyId
  });
}