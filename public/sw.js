console.log("[SW] Service worker disabled to prevent chunk loading issues")

// Immediately unregister this service worker
self.addEventListener("install", (event) => {
  console.log("[SW] Unregistering service worker...")
  self.skipWaiting()
})

self.addEventListener("activate", (event) => {
  console.log("[SW] Cleaning up and unregistering...")
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            console.log("[SW] Deleting cache:", cacheName)
            return caches.delete(cacheName)
          }),
        )
      })
      .then(() => {
        console.log("[SW] All caches cleared")
        return self.clients.claim()
      })
      .then(() => {
        // Unregister this service worker
        return self.registration.unregister()
      }),
  )
})

// Don't intercept any fetch requests
self.addEventListener("fetch", (event) => {
  // Let all requests pass through normally
  return
})
