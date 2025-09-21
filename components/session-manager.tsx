"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

interface SessionData {
  isAuthenticated: boolean
  whatsappStatus: string
  lastActivity: number
  sessionId: string
}

export function SessionManager() {
  const router = useRouter()
  const [sessionData, setSessionData] = useState<SessionData | null>(null)

  useEffect(() => {
    const loadSession = () => {
      try {
        const stored = localStorage.getItem("whatsapp-session")
        if (stored) {
          const session: SessionData = JSON.parse(stored)

          // Check if session is still valid (24 hours)
          const now = Date.now()
          const sessionAge = now - session.lastActivity
          const maxAge = 24 * 60 * 60 * 1000 // 24 hours

          if (sessionAge < maxAge) {
            setSessionData(session)
            console.log("[Session] Restored session from localStorage")
            return session
          } else {
            // Session expired
            localStorage.removeItem("whatsapp-session")
            console.log("[Session] Session expired, removed from storage")
          }
        }
      } catch (error) {
        console.error("[Session] Error loading session:", error)
        localStorage.removeItem("whatsapp-session")
      }
      return null
    }

    const saveSession = (data: SessionData) => {
      try {
        localStorage.setItem("whatsapp-session", JSON.stringify(data))
        console.log("[Session] Session saved to localStorage")
      } catch (error) {
        console.error("[Session] Error saving session:", error)
      }
    }

    const updateActivity = () => {
      const current = loadSession()
      if (current) {
        const updated = {
          ...current,
          lastActivity: Date.now(),
        }
        setSessionData(updated)
        saveSession(updated)
      }
    }

    // Load initial session
    const initialSession = loadSession()

    // Set up activity tracking
    const activityEvents = ["mousedown", "mousemove", "keypress", "scroll", "touchstart"]
    const throttledUpdate = throttle(updateActivity, 30000) // Update every 30 seconds max

    activityEvents.forEach((event) => {
      document.addEventListener(event, throttledUpdate, true)
    })

    // Check WhatsApp status periodically
    const checkStatus = async () => {
      try {
        const response = await fetch("https://back-wsp.onrender.com/api/status")
        const data = await response.json()

        if (data.success) {
          const newSession: SessionData = {
            isAuthenticated: data.whatsappReady,
            whatsappStatus: data.whatsappReady ? "Conectado" : "Desconectado",
            lastActivity: Date.now(),
            sessionId: initialSession?.sessionId || generateSessionId(),
          }

          setSessionData(newSession)
          saveSession(newSession)
        }
      } catch (error) {
        console.error("[Session] Error checking status:", error)
      }
    }

    // Check status immediately and then every 30 seconds
    checkStatus()
    const statusInterval = setInterval(checkStatus, 30000)

    // Cleanup
    return () => {
      activityEvents.forEach((event) => {
        document.removeEventListener(event, throttledUpdate, true)
      })
      clearInterval(statusInterval)
    }
  }, [])

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && sessionData) {
        // Page became visible, update activity
        const updated = {
          ...sessionData,
          lastActivity: Date.now(),
        }
        setSessionData(updated)
        localStorage.setItem("whatsapp-session", JSON.stringify(updated))
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange)
  }, [sessionData])

  return null // This component doesn't render anything
}

// Utility functions
function throttle(func: Function, limit: number) {
  let inThrottle: boolean
  return function (this: any, ...args: any[]) {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

function generateSessionId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}
