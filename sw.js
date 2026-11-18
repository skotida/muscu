// Muscu – service worker: makes the app work offline.
// Change VERSION when you update a file so phones pick up the new version.
const VERSION = "muscu-v1";
const FILES = [
  "./",
  "index.html",
  "manifest.webmanifest",
  "apple-touch-icon.png",
  "icon-192.png",
  "icon-512.png",
  "icon-maskable-512.png",
  "favicon-32.png",
  "barlow-condensed-latin-600-normal.woff2",
  "barlow-condensed-latin-700-normal.woff2",
  "barlow-latin-400-normal.woff2",
  "barlow-latin-500-normal.woff2",
  "barlow-latin-600-normal.woff2",
  "barlow-latin-700-normal.woff2"
];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Serve from cache first (instant, offline), refresh the cache in the background.
self.addEventListener("fetch", event => {
  const req = event.request;
  if (req.method !== "GET" || new URL(req.url).origin !== self.location.origin) return;
  event.respondWith(
    caches.open(VERSION).then(cache =>
      cache.match(req, {ignoreSearch: true}).then(cached => {
        const network = fetch(req).then(res => {
          if (res && res.ok) cache.put(req, res.clone());
          return res;
        }).catch(() => cached || (req.mode === "navigate" ? cache.match("index.html") : undefined));
        return cached || network;
      })
    )
  );
});
