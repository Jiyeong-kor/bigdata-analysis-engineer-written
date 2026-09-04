const CACHE_NAME = 'bigdata-study-v16';
const APP_SHELL = [
  './',
  './index.html',
  './styles.css',
  './ui-v2.css',
  './daily-mode.css',
  './iphone-quiz-layout.css',
  './data-subject-1.js',
  './data-subject-2.js',
  './data-subject-3.js',
  './data-subject-4.js',
  './data-bank-subject-1.js',
  './data-bank-subject-2.js',
  './data-bank-subject-3.js',
  './data-bank-subject-4.js',
  './data-finalize.js',
  './notion-learning-profile.js',
  './chat-review-12th.js',
  './daily-selection.js',
  './app-core.js',
  './app-home.js',
  './source-sync-patches.js',
  './hypothesis-pvalue-patch.js',
  './app-study.js',
  './app-v2.js',
  './chat-review-ui.js',
  './quiz-simplification.js',
  './answer-selection-fix.js',
  './instant-choice-grading-ui.js',
  './concept-link-fix.js',
  './app-update.js',
  './daily-mode.js',
  './app-v2-events.js',
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

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      })
      .catch(() => caches.match(event.request).then((cached) => cached || caches.match('./index.html')))
  );
});
