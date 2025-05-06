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
  'certificate.html',
  'manifest.json',
  'icon-192.png',
  'icon-512.png'
];

// Install: Cache all core files
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    (async () => {
      const cache = await caches.open(cacheName);
      await Promise.allSettled(
        assetsToCache.map(async asset => {
          try {
            const response = await fetch(asset);
            if (!response.ok) throw new Error(`${asset} failed with ${response.status}`);
            await cache.put(asset, response);
          } catch (err) {
            console.warn('Cache failed for:', asset, err);
          }
        })
      );
    })()
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