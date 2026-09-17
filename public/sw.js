const CACHE_NAME = 'goodluck-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/images/logo.png',
  '/images/better_tshirt.png',
  '/images/tshirt_back.png'
];

// Service Worker Install
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE).catch(() => {});
    })
  );
  self.skipWaiting();
});

// Service Worker Activate
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Fetch event: Stale-while-revalidate for static assets & GET API calls
self.addEventListener('fetch', (event) => {
  const request = event.request;

  // Only intercept GET requests
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Skip non-http(s) or third-party extensions
  if (!url.protocol.startsWith('http')) return;

  // For static assets (images, css, js, webp, png, jpg, svg)
  const isStaticAsset = /\.(png|jpg|jpeg|svg|gif|webp|ico|css|js|woff2?|ttf)(\?.*)?$/i.test(url.pathname);
  const isApiProductRoute = url.pathname.startsWith('/api/products') || url.pathname.startsWith('/api/categories');

  if (isStaticAsset || isApiProductRoute) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const cachedResponse = await cache.match(request);

        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              cache.put(request, networkResponse.clone());
            }
            return networkResponse;
          })
          .catch(() => cachedResponse);

        return cachedResponse || fetchPromise;
      })
    );
  }
});
