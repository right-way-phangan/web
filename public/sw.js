/**
 * Kill-switch service worker.
 *
 * The current site registers NO service worker. This file exists only to
 * neutralize a stale service worker left over from whatever was previously
 * hosted on this domain (before the 2026-06-02 DNS swap). If a device still
 * has an old SW registered at this path, the browser's periodic update check
 * fetches this script, installs it, and it then wipes caches, unregisters
 * itself, and reloads open tabs onto the fresh, SW-free site.
 *
 * Inert on devices that never had a service worker — nothing fetches it.
 */
self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      try {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      } catch {
        /* ignore */
      }
      try {
        await self.registration.unregister();
      } catch {
        /* ignore */
      }
      const clients = await self.clients.matchAll({ type: "window" });
      clients.forEach((c) => {
        try {
          c.navigate(c.url);
        } catch {
          /* ignore */
        }
      });
    })(),
  );
});

// Never intercept requests — always let them hit the network (fresh site).
self.addEventListener("fetch", () => {});
