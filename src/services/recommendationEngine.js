import { CONFIG } from '../config/siteConfig';
import { storageService } from './storageService';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

export async function fetchPersonalizedRecommendations() {
  const apiKey = CONFIG.tmdbApiKey;
  const watchlist = storageService.getPlaylist();
  const history = storageService.getHistory();

  // Collect all IDs the user already knows to prevent recommending things they already saved/watched
  const existingIds = new Set([
    ...watchlist.map(item => String(item.id || item.media_id)),
    ...history.map(item => String(item.id || item.media_id))
  ]);

  // Combine seed items (prioritize recent watch history, then watchlist items)
  const seedItems = [
    ...history.slice(0, 3).map(i => ({ ...i, reasonType: 'watched' })),
    ...watchlist.slice(0, 3).map(i => ({ ...i, reasonType: 'saved' }))
  ].slice(0, 4);

  // If user has no seed items, fallback to top trending cinema
  if (seedItems.length === 0) {
    try {
      const res = await fetch(`${TMDB_BASE_URL}/trending/all/week?api_key=${apiKey}`);
      if (!res.ok) return { items: [], reason: 'Popular Across WarayFlix' };
      const data = await res.json();
      const results = (data.results || [])
        .filter(item => item.poster_path && item.vote_average > 6.0)
        .slice(0, 15)
        .map(item => ({
          ...item,
          matchReason: 'Top Trending Cinema'
        }));
      return { items: results, reason: 'Curated Trending Cinema' };
    } catch {
      return { items: [], reason: 'Trending' };
    }
  }

  // Fetch recommendations for seed items in parallel
  const fetchPromises = seedItems.map(async (seed) => {
    const mediaType = seed.media_type || (seed.first_air_date || seed.season ? 'tv' : 'movie');
    const seedId = seed.media_id || seed.id;
    const seedTitle = seed.title || seed.name || 'your library';

    try {
      const recRes = await fetch(`${TMDB_BASE_URL}/${mediaType}/${seedId}/recommendations?api_key=${apiKey}`);
      if (recRes.ok) {
        const recData = await recRes.json();
        if (recData.results && recData.results.length > 0) {
          return recData.results.map(r => ({
            ...r,
            media_type: r.media_type || mediaType,
            matchReason: seed.reasonType === 'watched' ? `Because you watched "${seedTitle}"` : `Based on "${seedTitle}" in your list`
          }));
        }
      }

      // Fallback to similar
      const simRes = await fetch(`${TMDB_BASE_URL}/${mediaType}/${seedId}/similar?api_key=${apiKey}`);
      if (simRes.ok) {
        const simData = await simRes.json();
        return (simData.results || []).map(r => ({
          ...r,
          media_type: r.media_type || mediaType,
          matchReason: `Similar to "${seedTitle}"`
        }));
      }
    } catch {
      return [];
    }
    return [];
  });

  const resultsNested = await Promise.all(fetchPromises);
  const combined = resultsNested.flat();

  // De-duplicate and filter out already saved/watched items
  const seenIds = new Set();
  const filtered = [];

  for (const item of combined) {
    const itemIdStr = String(item.id);
    if (!item.poster_path) continue;
    if (existingIds.has(itemIdStr)) continue;
    if (seenIds.has(itemIdStr)) continue;

    seenIds.add(itemIdStr);
    filtered.push(item);
  }

  const primarySeedTitle = seedItems[0]?.title || seedItems[0]?.name;
  const reasonHeading = primarySeedTitle 
    ? `Based on ${primarySeedTitle} & your taste` 
    : 'Curated For You';

  return {
    items: filtered.slice(0, 18),
    reason: reasonHeading
  };
}

