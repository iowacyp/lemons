const cacheName = 'lemons-cache-v1';
const assetsToCache = [
  '/',
  'index.html',
  'styles.css',
  'script.js',
  'LemonsCert.jpg',
  'download.png',
  'entrepreneur.html',
  'customize.html',
  'calculator.html',
  'loan.html',
  'marketing.html',
  'checklist.html',
  'photos.html',
  'journal.html',
  'report.html',
  'certificate.html'
];

// Install: Cache all core files
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(cacheName).then(cache => cache.addAll(assetsToCache))
  );
});

// Activate: Clean up old caches
self.addEventListener('activate', event => {
  clients.claim();
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== cacheName)
            .map(key => caches.delete(key))
      );
    })
  );
});

// Fetch: Serve from cache if available, except Font Awesome CSS
self.addEventListener('fetch', event => {
  if (event.request.url.includes('font-awesome') || event.request.url.includes('all.min.css')) {
    return fetch(event.request);
  }
  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request))
  );
});