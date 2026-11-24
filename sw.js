/* Entre Deux Toits – fonctionnement hors connexion */
const CACHE = "edt-v16";
const FILES = ["./", "index.html", "app.html", "manifest.webmanifest", "annuaire.json", "communes.json", "icon-192.png", "icon-512.png", "icon-maskable-512.png", "apple-touch-icon.png", "icone.svg", "logo-2a-formation.png", "count.js"];

/* Installation : copie fraîche des fichiers (sans passer par le cache du navigateur) */
self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES.map(f => new Request(f, { cache: "reload" })))));
  self.skipWaiting();
});

/* Activation : suppression des anciennes copies */
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});

/* Réseau d'abord, copie enregistrée si le réseau ne répond pas.
   La copie de l'appli (app.html) ne remplace que des PAGES : une image, la vidéo ou un fichier
   injoignable renvoie une vraie erreur, pour qu'une panne réseau ne soit plus masquée. */
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const u = new URL(req.url);
  if (u.origin !== location.origin) return;          /* statistiques GoatCounter : jamais interceptées */
  if (req.headers.has("range")) return;              /* vidéo lue par morceaux : laissée au navigateur */
  const page = req.mode === "navigate";
  e.respondWith(
    fetch(req).then(r => {
      if (r.ok && r.status === 200 && r.type === "basic") {
        const c = r.clone();
        caches.open(CACHE).then(k => k.put(req, c)).catch(() => {});
      }
      return r;
    }).catch(() =>
      caches.match(req, page ? { ignoreSearch: true } : undefined).then(r => {
        if (r) return r;
        if (page) return caches.match(/\/(index\.html)?$/.test(u.pathname) ? "index.html" : "app.html");
        return Response.error();
      })
    )
  );
});
