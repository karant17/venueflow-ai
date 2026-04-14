const CACHE_NAME = 'venueflow-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/src/components/styles.css',
  '/src/main.js',
  '/src/screens/attendeeScreen.js',
  '/src/screens/opsScreen.js',
  '/src/services/venueService.js',
  '/src/logic/recommendationLogic.js',
  '/src/utils/helpers.js',
  '/src/data/eventData.js',
  '/src/data/gateData.js',
  '/src/data/zoneData.js',
  '/src/data/facilityData.js',
  '/src/data/alertData.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS);
    }).catch(err => console.warn('PWA caching failed', err))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    }).catch(() => fetch(event.request))
  );
});
