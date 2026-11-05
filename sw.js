/* Entre Deux Toits – fonctionnement hors connexion */
const CACHE = "edt-v3";
const FILES = ["./", "index.html", "app.html", "manifest.webmanifest", "annuaire.json", "communes.json", "icon-192.png", "icon-512.png", "icon-maskable-512.png", "apple-touch-icon.png", "icone.svg"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES))); self.skipWaiting(); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))); self.clients.claim(); });
self.addEventListener("fetch", e => {
  const u = new URL(e.request.url);
  if (u.origin !== location.origin) return; /* annuaire et communes : jamais mis en cache ici */
  e.respondWith(fetch(e.request).then(r => { const c = r.clone(); caches.open(CACHE).then(k => k.put(e.request, c)); return r; }).catch(() => caches.match(e.request).then(r => r || caches.match("app.html"))));
});
