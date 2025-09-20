"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Navigation } from "@/components/navigation"
import { ArrowLeft, Settings, Clock, Bell, Palette, Database, Wifi } from "lucide-react"
import Link from "next/link"

export default function SettingsPage() {
  const [whatsappStatus, setWhatsappStatus] = useState("Desconectado")
  const [settings, setSettings] = useState({
    defaultDelay: 3,
    maxDelay: 60,
    minDelay: 1,
    autoReconnect: true,
    notifications: true,
    soundEnabled: true,
    darkMode: false,
    compactMode: false,
    autoBackup: true,
    backupInterval: 24, // hours
  })

  useEffect(() => {
    checkWhatsAppStatus()
    loadSettings()
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
    }
  }

  const loadSettings = () => {
    try {
      const stored = localStorage.getItem("whatsapp-settings")
      if (stored) {
        const parsed = JSON.parse(stored)
        setSettings((prev) => ({ ...prev, ...parsed }))
      }
    } catch (error) {
      console.error("Error cargando configuración:", error)
    }
  }

  const saveSettings = (newSettings: typeof settings) => {
    try {
      localStorage.setItem("whatsapp-settings", JSON.stringify(newSettings))
      setSettings(newSettings)
      console.log("✅ Configuración guardada")
    } catch (error) {
      console.error("Error guardando configuración:", error)
    }
  }

  const handleSettingChange = (key: keyof typeof settings, value: any) => {
    const newSettings = { ...settings, [key]: value }
    saveSettings(newSettings)
  }

  const resetSettings = () => {
    if (confirm("¿Estás seguro de que quieres restaurar la configuración por defecto?")) {
      const defaultSettings = {
        defaultDelay: 3,
        maxDelay: 60,
        minDelay: 1,
        autoReconnect: true,
        notifications: true,
        soundEnabled: true,
        darkMode: false,
        compactMode: false,
        autoBackup: true,
        backupInterval: 24,
      }
      saveSettings(defaultSettings)
      alert("✅ Configuración restaurada")
    }
  }

  const exportSettings = () => {
    try {
      const dataStr = JSON.stringify(settings, null, 2)
      const dataBlob = new Blob([dataStr], { type: "application/json" })
      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement("a")
      link.href = url
      link.download = `whatsapp-settings-${new Date().toISOString().split("T")[0]}.json`
      link.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Error exportando configuración:", error)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation whatsappStatus={whatsappStatus} />

      <div className="bg-whatsapp-green text-white p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <Settings className="h-6 w-6" />
              <div>
                <h1 className="text-xl font-semibold">Configuración</h1>
                <p className="text-sm text-white/80">Personaliza tu experiencia</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge
              variant={whatsappStatus === "Conectado" ? "default" : "destructive"}
              className="bg-white/20 text-white"
            >
              WhatsApp {whatsappStatus}
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {/* Configuración de Mensajes */}
        <Card className="whatsapp-fade-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-whatsapp-green" />
              Configuración de Envío
            </CardTitle>
            <CardDescription>Configura los tiempos de espera entre mensajes para evitar bloqueos</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="defaultDelay">Delay por defecto (segundos)</Label>
                <Input
                  id="defaultDelay"
                  type="number"
                  min={settings.minDelay}
                  max={settings.maxDelay}
                  value={settings.defaultDelay}
                  onChange={(e) => handleSettingChange("defaultDelay", Number(e.target.value))}
                  className="focus:ring-2 focus:ring-whatsapp-green"
                />
                <p className="text-xs text-whatsapp-gray">Tiempo de espera recomendado: 3-5 segundos</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="minDelay">Delay mínimo (segundos)</Label>
                <Input
                  id="minDelay"
                  type="number"
                  min="1"
                  max="10"
                  value={settings.minDelay}
                  onChange={(e) => handleSettingChange("minDelay", Number(e.target.value))}
                  className="focus:ring-2 focus:ring-whatsapp-green"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxDelay">Delay máximo (segundos)</Label>
                <Input
                  id="maxDelay"
                  type="number"
                  min="10"
                  max="300"
                  value={settings.maxDelay}
                  onChange={(e) => handleSettingChange("maxDelay", Number(e.target.value))}
                  className="focus:ring-2 focus:ring-whatsapp-green"
                />
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">💡 Recomendaciones de Seguridad</h4>
              <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                <li>
                  • <strong>3-5 segundos:</strong> Seguro para uso normal (recomendado)
                </li>
                <li>
                  • <strong>10-15 segundos:</strong> Muy seguro para cuentas nuevas
                </li>
                <li>
                  • <strong>30-60 segundos:</strong> Máxima seguridad para grandes volúmenes
                </li>
                <li>
                  • <strong>Evitar:</strong> Menos de 2 segundos puede activar protecciones
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Configuración de Apariencia */}
        <Card className="whatsapp-fade-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5 text-whatsapp-green" />
              Apariencia
            </CardTitle>
            <CardDescription>Personaliza la interfaz de la aplicación</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="compactMode">Modo compacto</Label>
                <p className="text-sm text-whatsapp-gray">Reduce el espaciado entre elementos</p>
              </div>
              <Switch
                id="compactMode"
                checked={settings.compactMode}
                onCheckedChange={(checked) => handleSettingChange("compactMode", checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Configuración de Notificaciones */}
        <Card className="whatsapp-fade-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-whatsapp-green" />
              Notificaciones
            </CardTitle>
            <CardDescription>Configura las alertas y notificaciones</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="notifications">Notificaciones push</Label>
                <p className="text-sm text-whatsapp-gray">Recibe alertas de mensajes enviados</p>
              </div>
              <Switch
                id="notifications"
                checked={settings.notifications}
                onCheckedChange={(checked) => handleSettingChange("notifications", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="soundEnabled">Sonidos</Label>
                <p className="text-sm text-whatsapp-gray">Reproducir sonidos de notificación</p>
              </div>
              <Switch
                id="soundEnabled"
                checked={settings.soundEnabled}
                onCheckedChange={(checked) => handleSettingChange("soundEnabled", checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Configuración de Conexión */}
        <Card className="whatsapp-fade-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wifi className="h-5 w-5 text-whatsapp-green" />
              Conexión
            </CardTitle>
            <CardDescription>Configuración de conectividad y respaldo</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="autoReconnect">Reconexión automática</Label>
                <p className="text-sm text-whatsapp-gray">
                  Intentar reconectar automáticamente si se pierde la conexión
                </p>
              </div>
              <Switch
                id="autoReconnect"
                checked={settings.autoReconnect}
                onCheckedChange={(checked) => handleSettingChange("autoReconnect", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="autoBackup">Respaldo automático</Label>
                <p className="text-sm text-whatsapp-gray">Crear respaldos automáticos de la configuración</p>
              </div>
              <Switch
                id="autoBackup"
                checked={settings.autoBackup}
                onCheckedChange={(checked) => handleSettingChange("autoBackup", checked)}
              />
            </div>

            {settings.autoBackup && (
              <div className="space-y-2">
                <Label htmlFor="backupInterval">Intervalo de respaldo (horas)</Label>
                <Input
                  id="backupInterval"
                  type="number"
                  min="1"
                  max="168"
                  value={settings.backupInterval}
                  onChange={(e) => handleSettingChange("backupInterval", Number(e.target.value))}
                  className="focus:ring-2 focus:ring-whatsapp-green"
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Acciones */}
        <Card className="whatsapp-fade-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-whatsapp-green" />
              Gestión de Datos
            </CardTitle>
            <CardDescription>Exportar, importar y restaurar configuración</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button onClick={exportSettings} variant="outline" className="whatsapp-btn-secondary bg-transparent">
                Exportar Configuración
              </Button>

              <Button
                onClick={resetSettings}
                variant="outline"
                className="text-red-600 border-red-200 hover:bg-red-50 bg-transparent"
              >
                Restaurar por Defecto
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
