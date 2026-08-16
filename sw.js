// Service worker — offline app shell (cache-first for local files).
const CACHE = "looksmax-v12";
const ASSETS = [
  "./",
  "./index.html",
  "./css/styles.css",
  "./js/app.js",
  "./js/store.js",
  "./js/defaults.js",
  "./js/config.js",
  "./js/supabase-sync.js",
  "./js/program.js",
  "./js/nutrition.js",
  "./js/foods.js",
  "./js/off.js",
  "./js/scanner.js",
  "./js/supplements.js",
  "./manifest.webmanifest",
  "./icons/icon.svg",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  // Only handle same-origin GETs; everything else (Supabase, CDN) goes straight to network.
  if (e.request.method !== "GET" || url.origin !== self.location.origin) return;

  // Stale-while-revalidate: respond from cache immediately, refresh cache in background.
  // Next load always gets the latest version without needing a SW version bump.
  e.respondWith(
    caches.open(CACHE).then(cache => {
      return cache.match(e.request).then(cached => {
        const networkFetch = fetch(e.request).then(res => {
          if (res.ok) cache.put(e.request, res.clone());
          return res;
        }).catch(() => cached || caches.match("./index.html"));
        return cached || networkFetch;
      });
    })
  );
});
