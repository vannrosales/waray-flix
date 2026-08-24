const CACHE_NAME = 'warayflix-cache-v3';
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/favicon.svg',
  '/icon-192.svg',
  '/icon-512.svg'
];

// Install: Cache core static assets safely
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      await Promise.allSettled(
        STATIC_ASSETS.map((url) => cache.add(url).catch((err) => console.warn(`SW cache failed for ${url}:`, err)))
      );
    }).then(() => self.skipWaiting())
  );
});

// Activate: Clean up all older caches immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: Safe handling with guaranteed correct MIME types
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Only handle HTTP/HTTPS GET requests; bypass extension, websocket, API and embed calls
  if (
    request.method !== 'GET' ||
    !url.protocol.startsWith('http') ||
    url.origin.includes('themoviedb.org') ||
    url.origin.includes('broker.emqx.io') ||
    url.origin.includes('embed') ||
    url.origin.includes('cinesrc') ||
    url.origin.includes('vidsrc') ||
    url.origin.includes('videasy') ||
    url.origin.includes('zoryva') ||
    url.origin.includes('vidcore')
  ) {
    return;
  }

  // Scripts / Modules: Network First (never serve HTML fallback for JS scripts)
  if (request.destination === 'script' || url.pathname.endsWith('.js') || url.pathname.endsWith('.jsx')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200 && response.type === 'basic') {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // HTML navigation requests (Network First -> Cache fallback)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const copy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put('/', copy));
          }
          return networkResponse;
        })
        .catch(async () => {
          const cached = await caches.match('/');
          if (cached) return cached;
          return new Response(
            '<!DOCTYPE html><html><head><title>WarayFlix</title></head><body style="background:#FAFAFA;color:#09090B;display:flex;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;">You are currently offline. Please reconnect to internet.</body></html>',
            { headers: { 'Content-Type': 'text/html' } }
          );
        })
    );
    return;
  }

  // Static Assets (CSS, Fonts, Images)
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;
      return fetch(request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const copy = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        }
        return networkResponse;
      });
    })
  );
});
