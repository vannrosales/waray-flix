// Clean service worker with complete asset passthrough
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.map((k) => caches.delete(k)))).then(() => self.clients.claim())
  );
});

// Do not intercept static assets or scripts
self.addEventListener('fetch', () => {
  // Let the browser handle standard network requests directly
});
