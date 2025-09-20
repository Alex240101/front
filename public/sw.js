const CACHE_NAME = "whatsapp-reminders-v1.0.0"
const STATIC_CACHE_URLS = [
  "/",
  "/dashboard",
  "/clients",
  "/messages",
  "/scheduled",
  "/manifest.json",
  "/icons/icon-192x192.jpg",
  "/icons/icon-512x512.jpg",
]

// Install event - cache static assets
self.addEventListener("install", (event) => {
  console.log("[SW] Installing service worker...")
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("[SW] Caching static assets")
        return cache.addAll(STATIC_CACHE_URLS)
      })
      .then(() => {
        console.log("[SW] Service worker installed successfully")
        return self.skipWaiting()
      })
      .catch((error) => {
        console.error("[SW] Error during installation:", error)
      }),
  )
})

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  console.log("[SW] Activating service worker...")
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log("[SW] Deleting old cache:", cacheName)
              return caches.delete(cacheName)
            }
          }),
        )
      })
      .then(() => {
        console.log("[SW] Service worker activated")
        return self.clients.claim()
      }),
  )
})

// Fetch event - serve from cache, fallback to network
self.addEventListener("fetch", (event) => {
  // Skip non-GET requests
  if (event.request.method !== "GET") {
    return
  }

  // Skip API calls and socket.io requests
  if (
    event.request.url.includes("/api/") ||
    event.request.url.includes("socket.io") ||
    event.request.url.includes("https://back-wsp.onrender.com")
  ) {
    return
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        console.log("[SW] Serving from cache:", event.request.url)
        return cachedResponse
      }

      console.log("[SW] Fetching from network:", event.request.url)
      return fetch(event.request)
        .then((response) => {
          // Don't cache non-successful responses
          if (!response || response.status !== 200 || response.type !== "basic") {
            return response
          }

          // Clone the response
          const responseToCache = response.clone()

          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache)
          })

          return response
        })
        .catch((error) => {
          console.error("[SW] Fetch failed:", error)

          // Return offline page for navigation requests
          if (event.request.mode === "navigate") {
            return caches.match("/")
          }

          throw error
        })
    }),
  )
})

// Background sync for offline message queue
self.addEventListener("sync", (event) => {
  console.log("[SW] Background sync triggered:", event.tag)

  if (event.tag === "send-messages") {
    event.waitUntil(
      // Handle offline message queue
      handleOfflineMessages(),
    )
  }
})

// Push notifications (for future use)
self.addEventListener("push", (event) => {
  console.log("[SW] Push notification received")

  const options = {
    body: event.data ? event.data.text() : "Nuevo mensaje de WhatsApp Reminders",
    icon: "/icons/icon-192x192.jpg",
    badge: "/icons/icon-72x72.jpg",
    vibrate: [200, 100, 200],
    data: {
      url: "/dashboard",
    },
    actions: [
      {
        action: "open",
        title: "Abrir App",
        icon: "/icons/icon-96x96.jpg",
      },
      {
        action: "close",
        title: "Cerrar",
        icon: "/icons/icon-96x96.jpg",
      },
    ],
  }

  event.waitUntil(self.registration.showNotification("WhatsApp Reminders", options))
})

// Handle notification clicks
self.addEventListener("notificationclick", (event) => {
  console.log("[SW] Notification clicked:", event.action)

  event.notification.close()

  if (event.action === "open" || !event.action) {
    event.waitUntil(clients.openWindow(event.notification.data.url || "/dashboard"))
  }
})

// Handle offline message queue
async function handleOfflineMessages() {
  try {
    const cache = await caches.open(CACHE_NAME)
    const offlineMessages = await cache.match("/offline-messages")

    if (offlineMessages) {
      const messages = await offlineMessages.json()

      // Try to send each message
      for (const message of messages) {
        try {
          const response = await fetch("/api/send", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(message),
          })

          if (response.ok) {
            console.log("[SW] Offline message sent successfully")
          }
        } catch (error) {
          console.error("[SW] Failed to send offline message:", error)
        }
      }

      // Clear the offline queue
      await cache.delete("/offline-messages")
    }
  } catch (error) {
    console.error("[SW] Error handling offline messages:", error)
  }
}
