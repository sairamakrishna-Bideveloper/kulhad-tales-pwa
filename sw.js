const CACHE = 'kulhad-tales-v1';
const APP_SHELL = [
  './', './index.html', './styles.css', './script.js', './manifest.webmanifest',
  './logo.png', './hero.jpg', './story.jpg', './interior.jpg', './gallery.jpg',
  './chai-masala.jpg', './chai-ginger.jpg', './chai-elachi.jpg', './chai-special.jpg',
  './filter-coffee.jpg', './cappuccino.jpg', './cold-coffee.jpg', './coolers.jpg', './desserts.jpg'
];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(APP_SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
    const copy = response.clone();
    caches.open(CACHE).then(cache => cache.put(event.request, copy));
    return response;
  }).catch(() => caches.match('./index.html'))));
});
