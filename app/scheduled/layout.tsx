"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Navigation } from "@/components/navigation"

export default function ScheduledLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [whatsappStatus, setWhatsappStatus] = useState("Desconectado")

  useEffect(() => {
    checkWhatsAppStatus()
  }, [])

  const checkWhatsAppStatus = async () => {
    try {
      const response = await fetch("https://back-wsp.onrender.com/api/status")
      const data = await response.json()
      if (data.success) {
        setWhatsappStatus(data.whatsappReady ? "Conectado" : "Desconectado")
      }
    } catch (error) {
      console.error("Error verificando estado:", error)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation whatsappStatus={whatsappStatus} />
      {children}
    </div>
  )
}
