// Changez ce numéro à chaque mise à jour du jeu (v1 -> v2 -> v3...)
const VERSION = 'v2';
const CACHE = 'smm3-' + VERSION;
const ASSETS = [
  './', 'index.html', 'manifest.webmanifest', 'icon.svg', 'icon-180.png', 'icon-192.png', 'icon-512.png',
  'css/style.css', 'js/main.js', 'js/game.js', 'js/scene.js', 'js/questions.js',
  'js/graph.js', 'js/audio.js', 'js/store.js', 'lib/three.module.min.js'
];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE)
    .then(c => c.addAll(ASSETS.map(u => new Request(u, { cache: 'reload' }))))
    .then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(ks => Promise.all(ks.filter(k => k.startsWith('smm3-') && k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(caches.match(e.request, { ignoreSearch: true }).then(r => r || fetch(e.request)));
});
