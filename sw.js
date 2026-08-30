const CACHE_NAME = 'bigdata-study-v2';
const APP_SHELL = [
  './',
  './index.html',
  './styles.css',
  './data-subject-1.js',
  './data-subject-2.js',
  './data-subject-3.js',
  './data-subject-4.js',
  './data-finalize.js',
  './app-core.js',
  './app-home.js',
  './source-sync-patches.js',
  './app-study.js',
  './app-events.js',
  './manifest.webmanifest',
  './icon-192.png',
  './apple-touch-icon.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      }).catch(() => caches.match('./index.html'));
    })
  );
});
