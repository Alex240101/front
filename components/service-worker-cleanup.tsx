"use client"

import { useEffect } from "react"

export function ServiceWorkerCleanup() {
  useEffect(() => {
    const cleanupServiceWorker = async () => {
      if ("serviceWorker" in navigator) {
        try {
          // Get all registrations
          const registrations = await navigator.serviceWorker.getRegistrations()

          // Unregister all service workers
          for (const registration of registrations) {
            console.log("[Cleanup] Unregistering service worker:", registration.scope)
            await registration.unregister()
          }

          // Clear all caches
          if ("caches" in window) {
            const cacheNames = await caches.keys()
            for (const cacheName of cacheNames) {
              console.log("[Cleanup] Deleting cache:", cacheName)
              await caches.delete(cacheName)
            }
          }

          console.log("[Cleanup] Service worker cleanup completed")

          // Force reload after cleanup to ensure clean state
          if (registrations.length > 0) {
            setTimeout(() => {
              window.location.reload()
            }, 1000)
          }
        } catch (error) {
          console.error("[Cleanup] Error cleaning up service worker:", error)
        }
      }
    }

    cleanupServiceWorker()
  }, [])

  return null
}
