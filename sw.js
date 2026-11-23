// Offline support: serve from cache instantly, refresh the cache in the background.
// Bump CACHE when shipping a new batch so old files get cleared.
const CACHE = 'gympal-v14';
const ASSETS = ['./', './index.html', './manifest.json', './icon-180.png', './icon-192.png', './icon-512.png',
  './img/assisted-pull-up-1.png', './img/assisted-pull-up-2.png', './img/back-extension-45-1.png', './img/back-extension-45-2.png', './img/bench-dip-1.png', './img/bench-dip-2.png', './img/cable-curl-1.png', './img/cable-curl-2.png', './img/cable-fly-1.png', './img/cable-fly-2.png', './img/dumbbell-bench-press-1.png', './img/dumbbell-bench-press-2.png', './img/dumbbell-curl-1.png', './img/dumbbell-curl-2.png', './img/dumbbell-shoulder-press-1.png', './img/dumbbell-shoulder-press-2.png', './img/hammer-curl-1.png', './img/hammer-curl-2.png', './img/incline-dumbbell-press-1.png', './img/incline-dumbbell-press-2.png', './img/lateral-raise-1.png', './img/lateral-raise-2.png', './img/lying-leg-curl-1.png', './img/lying-leg-curl-2.png', './img/pec-deck-1.png', './img/pec-deck-2.png', './img/preacher-curl-1.png', './img/preacher-curl-2.png', './img/seated-cable-row-1.png', './img/seated-cable-row-2.png', './img/seated-leg-curl-1.png', './img/seated-leg-curl-2.png', './img/shoulder-press-machine-1.png', './img/shoulder-press-machine-2.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS.map(u => new Request(u, {cache: 'no-cache'})))));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(caches.open(CACHE).then(async cache => {
    const cached = await cache.match(e.request, { ignoreSearch: true });
    // 'no-cache' = always ask GitHub whether the file changed, instead of trusting a copy up to 10 min old
    const fresh = fetch(new Request(e.request.url, {cache: 'no-cache', credentials: 'same-origin'})).then(res => {
      if (res.ok) cache.put(e.request, res.clone());
      return res;
    }).catch(() => cached);
    return cached || fresh;
  }));
});
