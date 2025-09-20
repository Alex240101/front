"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Navigation } from "@/components/navigation"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [whatsappStatus, setWhatsappStatus] = useState("Desconectado")

  useEffect(() => {
    checkWhatsAppStatus()
    // Check status every 30 seconds
    const interval = setInterval(checkWhatsAppStatus, 30000)
    return () => clearInterval(interval)
  }, [])

  const checkWhatsAppStatus = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/status")
      const data = await response.json()
      if (data.success) {
        setWhatsappStatus(data.whatsappReady ? "Conectado" : "Desconectado")
      }
    } catch (error) {
      console.error("Error verificando estado:", error)
      setWhatsappStatus("Error")
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation whatsappStatus={whatsappStatus} />
      {children}
    </div>
  )
}
