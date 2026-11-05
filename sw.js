/* Entre Deux Toits – fonctionnement hors connexion */
const CACHE = "edt-v2";
const FILES = ["./", "index.html", "manifest.webmanifest", "data/annuaire.json", "data/communes.json", "icone/icon-192.png", "icone/icon-512.png", "icone/icon-maskable-512.png", "icone/apple-touch-icon.png", "icone/icone.svg"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES))); self.skipWaiting(); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))); self.clients.claim(); });
self.addEventListener("fetch", e => {
  const u = new URL(e.request.url);
  if (u.origin !== location.origin) return; /* annuaire et communes : jamais mis en cache ici */
  e.respondWith(fetch(e.request).then(r => { const c = r.clone(); caches.open(CACHE).then(k => k.put(e.request, c)); return r; }).catch(() => caches.match(e.request).then(r => r || caches.match("index.html"))));
});
