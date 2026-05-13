const cacheName = 'lemons-cache-v2';
const assetsToCache = [
  '/',
  'index.html',
  'styles.css',
  'script.js',
  'assets/css/styles.css',
  'assets/js/site-data.js',
  'assets/js/shell.js',
  'assets/js/script.js',
  'assets/js/pages/calculator.js',
  'assets/js/pages/certificate.js',
  'assets/js/pages/checklist.js',
  'assets/js/pages/customize.js',
  'assets/js/pages/dashboard.js',
  'assets/js/pages/journal.js',
  'assets/js/pages/loan.js',
  'assets/js/pages/marketing.js',
  'assets/js/pages/report.js',
  'assets/js/components/virtual-programming-signup-form.js',
  'LemonsCert.jpg',
  'assets/images/lemonade-dashboard-bg.jpg',
  'download.png',
  'entrepreneur.html',
  'customize.html',
  'calculator.html',
  'loan.html',
  'marketing.html',
  'checklist.html',
  'journal.html',
  'report.html',
  'certificate.html',
  'contact.html',
  'virtual-programming.html',
  'manifest.json',
  'icon-192.png',
  'icon-512.png',
  'favicon.svg',
  'favicon.ico',
  'favicon-96x96.png',
  'apple-touch-icon.png'
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
