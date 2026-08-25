/**
 * formatters.js
 * Central utility functions for formatting dates, durations, titles, ratings, and media metadata.
 */

/**
 * Safely extract 4-digit release year from a media item.
 */
export function getReleaseYear(media, fallback = '2026') {
  if (!media) return fallback;
  const rawDate = media.release_date || media.first_air_date || media.air_date;
  if (!rawDate || typeof rawDate !== 'string') return fallback;
  return rawDate.substring(0, 4) || fallback;
}

/**
 * Extract canonical title or name from media object.
 */
export function getMediaTitle(media, fallback = 'Untitled') {
  if (!media) return fallback;
  return media.title || media.name || media.original_title || media.original_name || fallback;
}

/**
 * Format rating to 1 decimal place (e.g. 8.4). Returns null if unrated.
 */
export function formatRating(rating) {
  const num = Number(rating);
  if (!num || isNaN(num) || num <= 0) return null;
  return num.toFixed(1);
}

/**
 * Format runtime in minutes to readable string (e.g. 124 -> "2h 4m", 45 -> "45m").
 */
export function formatDuration(minutes) {
  const min = Number(minutes);
  if (!min || isNaN(min) || min <= 0) return null;
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  return `${m}m`;
}

/**
 * Format seconds to "mm:ss" or "hh:mm:ss" (e.g. 3665 -> "1:01:05", 125 -> "02:05").
 */
export function formatPlaybackTime(seconds) {
  const sec = Math.max(0, Math.floor(Number(seconds) || 0));
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;

  const pad = (n) => String(n).padStart(2, '0');

  if (h > 0) {
    return `${h}:${pad(m)}:${pad(s)}`;
  }
  return `${pad(m)}:${pad(s)}`;
}

/**
 * Calculate completion percentage between 0 and 100.
 */
export function calculateProgress(currentSeconds, totalSeconds) {
  const current = Number(currentSeconds) || 0;
  const total = Number(totalSeconds) || 0;
  if (total <= 0) return 0;
  return Math.min(Math.round((current / total) * 100), 100);
}

/**
 * Normalize a media object to standard structure across TMDB & Supabase.
 */
export function normalizeMedia(media, fallbackType = 'movie') {
  if (!media) return null;
  const id = media.id || media.media_id;
  const media_type = media.media_type || (media.first_air_date ? 'tv' : fallbackType);
  const title = getMediaTitle(media);

  return {
    id,
    media_id: String(id),
    title,
    name: title,
    poster_path: media.poster_path || '',
    backdrop_path: media.backdrop_path || '',
    media_type,
    vote_average: Number(media.vote_average) || 0,
    release_date: media.release_date || media.first_air_date || '',
    overview: media.overview || '',
  };
}

/**
 * Check if a media item is flagged as adult / 18+ / NSFW (e.g. hentai, adult animation, erotica, ComicFesta).
 */
export function isAdultContent(media) {
  if (!media) return false;
  if (media.adult === true) return true;

  const title = (media.title || media.name || media.original_title || media.original_name || '').toLowerCase();
  const overview = (media.overview || '').toLowerCase();

  const adultKeywords = [
    'hentai',
    'uncensored hentai',
    'erotic anime',
    'adult animation (18+)',
    'r-18',
    '18+ only',
    'eromanga',
    'ecchi',
    'comicfesta',
    'animefesta',
    'shikiyoku',
    'souryo to majiwaru',
    'overflow',
    'kiss x sis',
    'yosuga no sora',
    'valkyrie drive',
    'seikon no qwaser',
    'ishuzoku reviewers',
    'interspecies reviewers',
    'peter grill',
    'harem camp',
    'smut',
    'erotica',
    'sexual desire',
    'carnal desire',
    'erotic encounter',
    'lustful',
    'sexually explicit',
  ];

  for (const keyword of adultKeywords) {
    if (title.includes(keyword) || overview.includes(keyword)) {
      return true;
    }
  }

  return false;
}

/**
 * Filter out adult and 18+ content from an array of media items.
 */
export function filterSafeMedia(items) {
  if (!Array.isArray(items)) return [];
  return items.filter(item => item && !isAdultContent(item));
}


