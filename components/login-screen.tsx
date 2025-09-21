"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { io, type Socket } from "socket.io-client"

interface LoginScreenProps {
  onLoginSuccess: () => void
}

export default function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const [qrCode, setQrCode] = useState<string>("")
  const [isConnected, setIsConnected] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState("Conectando...")
  const socketRef = useRef<Socket | null>(null)
  const onLoginSuccessRef = useRef(onLoginSuccess)

  useEffect(() => {
    onLoginSuccessRef.current = onLoginSuccess
  }, [onLoginSuccess])

  useEffect(() => {
    // Limpiar estado inicial
    setQrCode("")
    setIsConnected(false)
    setConnectionStatus("Conectando...")

    // Crear conexión Socket.IO solo si no existe
    if (!socketRef.current) {
      console.log("[v0] Creando nueva conexión Socket.IO")
      socketRef.current = io("https://back-wsp.onrender.com", {
        forceNew: true, // Forzar nueva conexión
        reconnection: false, // Desactivar reconexión automática
        timeout: 5000, // Reduced timeout for faster connection
      })

      const socket = socketRef.current

      socket.on("connect", () => {
        console.log("[v0] Frontend conectado al backend")
        setConnectionStatus("Esperando QR...")
      })

      socket.on("qr", (qrData: string) => {
        console.log("[v0] QR recibido del backend")
        setQrCode(qrData)
        setConnectionStatus("QR Generado")
      })

      socket.on("ready", () => {
        console.log("[v0] WhatsApp conectado exitosamente")
        setIsConnected(true)
        setConnectionStatus("Conectado")
        setTimeout(() => onLoginSuccessRef.current(), 1500)
      })

      socket.on("authenticated", () => {
        console.log("[v0] WhatsApp autenticado")
        setIsConnected(true)
        setConnectionStatus("Autenticado")
        setTimeout(() => onLoginSuccessRef.current(), 1500)
      })

      socket.on("auth_failure", () => {
        console.log("[v0] Error de autenticación")
        setConnectionStatus("Error de autenticación")
        setQrCode("")
      })

      socket.on("logout", () => {
        console.log("[v0] WhatsApp desconectado - reiniciando...")
        setIsConnected(false)
        setConnectionStatus("Esperando QR...")
        setQrCode("")
      })

      socket.on("disconnect", () => {
        console.log("[v0] Socket desconectado")
        setConnectionStatus("Desconectado")
      })
    }

    return () => {
      if (socketRef.current) {
        console.log("[v0] Desconectando Socket.IO")
        socketRef.current.disconnect()
        socketRef.current = null
      }
    }
  }, []) // Array de dependencias vacío para ejecutar solo una vez

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md fade-in hover-lift border-border/50">
        <CardHeader className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-primary rounded-xl flex items-center justify-center shadow-lg">
            <svg className="w-8 h-8 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </div>
          <div>
            <CardTitle className="text-2xl font-bold font-space-grotesk text-foreground">Iniciar Sesión</CardTitle>
            <CardDescription className="font-sans text-muted-foreground">
              Escanea el código QR con WhatsApp
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Status Badge */}
          <div className="flex justify-center">
            <Badge
              variant={isConnected ? "default" : "secondary"}
              className={`font-sans transition-all duration-300 ${isConnected ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}
            >
              {connectionStatus}
            </Badge>
          </div>

          {/* QR Code Area */}
          <div className="flex justify-center">
            <div className="w-64 h-64 bg-card border border-border rounded-xl flex items-center justify-center shadow-inner">
              {qrCode ? (
                <div className="text-center space-y-4 fade-in">
                  <div className="w-48 h-48 bg-white rounded-lg flex items-center justify-center p-3 shadow-lg">
                    <img
                      src={qrCode || "/placeholder.svg"}
                      alt="QR Code para WhatsApp"
                      className="w-full h-full object-contain"
                      onLoad={() => console.log("[v0] QR image loaded successfully")}
                      onError={() => console.log("[v0] Error loading QR image")}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground font-sans">
                    {isConnected ? "¡Conectado exitosamente!" : "Escanea con WhatsApp"}
                  </p>
                </div>
              ) : (
                <div className="text-center space-y-3">
                  <div className="w-16 h-16 mx-auto border-4 border-gray-200 border-t-whatsapp-green rounded-full animate-spin" />
                  <p className="text-sm text-muted-foreground font-sans">
                    {connectionStatus === "Conectando..." ? "Conectando al servidor..." : "Generando QR..."}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Instructions */}
          <div className="text-center space-y-2 px-4">
            <p className="text-sm text-muted-foreground font-sans">1. Abre WhatsApp en tu teléfono</p>
            <p className="text-sm text-muted-foreground font-sans">2. Ve a Configuración → Dispositivos vinculados</p>
            <p className="text-sm text-muted-foreground font-sans">3. Escanea este código QR</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
