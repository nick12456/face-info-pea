// Simple cache for offline use
const CACHE = 'faceinfo-pwa-v1';
const ASSETS = [
  '/index.html',
  '/manifest.webmanifest',
  'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/dist/face-api.min.js'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(
    keys.filter(k => k!==CACHE).map(k => caches.delete(k))
  )));
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (url.origin === location.origin && (url.pathname === '/' || url.pathname === '/index.html')) {
    // Network first for index.html
    e.respondWith(
      fetch(e.request).then(r => {
        const copy = r.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy));
        return r;
      }).catch(() => caches.match('/index.html'))
    );
  } else {
    // Cache first for everything else
    e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
  }
});
