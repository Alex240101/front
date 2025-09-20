"use client"

import { useState, useEffect } from "react"
import LoadingScreen from "@/components/loading-screen"
import LoginScreen from "@/components/login-screen"
import WelcomeScreen from "@/components/welcome-screen"
import { SessionManager } from "@/components/session-manager"
import { PWAInstall } from "@/components/pwa-install"

type AppState = "loading" | "login" | "welcome" | "dashboard"

export default function WhatsAppApp() {
  const [currentState, setCurrentState] = useState<AppState>("loading")

  useEffect(() => {
    const checkExistingSession = () => {
      try {
        const stored = localStorage.getItem("whatsapp-session")
        if (stored) {
          const session = JSON.parse(stored)
          const now = Date.now()
          const sessionAge = now - session.lastActivity
          const maxAge = 24 * 60 * 60 * 1000 // 24 hours

          if (sessionAge < maxAge && session.isAuthenticated) {
            console.log("[App] Restoring existing session")
            window.location.href = "/dashboard"
            return
          }
        }
      } catch (error) {
        console.error("[App] Error checking session:", error)
      }
    }

    // Check for existing session after loading
    if (currentState === "loading") {
      setTimeout(checkExistingSession, 1500)
    }
  }, [currentState])

  const handleLoadingComplete = () => {
    setCurrentState("login")
  }

  const handleLoginSuccess = () => {
    setCurrentState("welcome")
  }

  const handleGetStarted = () => {
    window.location.href = "/dashboard"
  }

  const handleLogout = () => {
    localStorage.removeItem("whatsapp-session")
    setCurrentState("login")
  }

  // Render current screen based on state
  return (
    <>
      <SessionManager />
      <PWAInstall />

      {(() => {
        switch (currentState) {
          case "loading":
            return <LoadingScreen onComplete={handleLoadingComplete} />

          case "login":
            return <LoginScreen onLoginSuccess={handleLoginSuccess} />

          case "welcome":
            return <WelcomeScreen onGetStarted={handleGetStarted} />

          default:
            return <LoadingScreen onComplete={handleLoadingComplete} />
        }
      })()}
    </>
  )
}
