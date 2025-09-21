;(() => {
  console.log("[Emergency Cleanup] Starting service worker cleanup...")

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (const registration of registrations) {
        console.log("[Emergency Cleanup] Unregistering:", registration.scope)
        registration.unregister()
      }
    })
  }

  if ("caches" in window) {
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames.map((cacheName) => {
          console.log("[Emergency Cleanup] Deleting cache:", cacheName)
          return caches.delete(cacheName)
        }),
      ),
    )
  }

  console.log("[Emergency Cleanup] Cleanup completed")
})()
