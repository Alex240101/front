"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, Send, Search, Users, Clock, CheckCircle, XCircle, Pause, Play } from "lucide-react"
import Link from "next/link"

interface Client {
  id: string
  name: string
  phone: string
  email?: string
  notes?: string
}

interface MessageStatus {
  clientId: string
  clientName: string
  status: "pending" | "sending" | "sent" | "failed"
  error?: string
}

export default function MessagesPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [selectedClients, setSelectedClients] = useState<string[]>([])
  const [messageText, setMessageText] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [whatsappStatus, setWhatsappStatus] = useState("Desconectado")
  const [messageStatuses, setMessageStatuses] = useState<MessageStatus[]>([])
  const [sendingProgress, setSendingProgress] = useState(0)
  const [delaySeconds, setDelaySeconds] = useState(3)

  useEffect(() => {
    loadClients()
    checkWhatsAppStatus()
    loadDelaySettings()
  }, [])

  const loadClients = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("https://back-wsp.onrender.com/api/clients")
      const data = await response.json()
      if (data.success) {
        setClients(data.clients)
      }
    } catch (error) {
      console.error("Error cargando clientes:", error)
    } finally {
      setIsLoading(false)
    }
  }

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

  const toggleClientSelection = (id: string) => {
    setSelectedClients((prev) => (prev.includes(id) ? prev.filter((clientId) => clientId !== id) : [...prev, id]))
  }

  const selectAllClients = () => {
    const filtered = filteredClients.map((c) => c.id)
    setSelectedClients(filtered)
  }

  const clearSelection = () => {
    setSelectedClients([])
  }

  const handleSendMessages = async () => {
    if (!messageText || selectedClients.length === 0) return

    setIsSending(true)
    setIsPaused(false)
    setSendingProgress(0)

    const selectedClientData = clients.filter((c) => selectedClients.includes(c.id))
    const initialStatuses: MessageStatus[] = selectedClientData.map((client) => ({
      clientId: client.id,
      clientName: client.name,
      status: "pending",
    }))

    setMessageStatuses(initialStatuses)

    let successCount = 0
    let errorCount = 0

    for (let i = 0; i < selectedClientData.length; i++) {
      if (isPaused) {
        // Si está pausado, esperar hasta que se reanude
        while (isPaused) {
          await new Promise((resolve) => setTimeout(resolve, 100))
        }
      }

      const client = selectedClientData[i]

      // Actualizar estado a "enviando"
      setMessageStatuses((prev) =>
        prev.map((status) => (status.clientId === client.id ? { ...status, status: "sending" } : status)),
      )

      try {
        const response = await fetch("http://localhost:3000/api/send", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            phone: client.phone,
            message: messageText,
          }),
        })

        const data = await response.json()

        if (data.success) {
          successCount++
          setMessageStatuses((prev) =>
            prev.map((status) => (status.clientId === client.id ? { ...status, status: "sent" } : status)),
          )
        } else {
          errorCount++
          setMessageStatuses((prev) =>
            prev.map((status) =>
              status.clientId === client.id ? { ...status, status: "failed", error: data.error } : status,
            ),
          )
        }
      } catch (error) {
        errorCount++
        setMessageStatuses((prev) =>
          prev.map((status) =>
            status.clientId === client.id ? { ...status, status: "failed", error: "Error de conexión" } : status,
          ),
        )
      }

      // Actualizar progreso
      setSendingProgress(((i + 1) / selectedClientData.length) * 100)

      // Delay entre mensajes (excepto en el último)
      if (i < selectedClientData.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, delaySeconds * 1000))
      }
    }

    setIsSending(false)

    // Mostrar resumen
    if (successCount > 0) {
      alert(`✅ Mensajes enviados exitosamente: ${successCount}${errorCount > 0 ? `. Fallaron: ${errorCount}` : ""}`)
    } else {
      alert(`❌ No se pudo enviar ningún mensaje`)
    }
  }

  const pauseSending = () => {
    setIsPaused(true)
  }

  const resumeSending = () => {
    setIsPaused(false)
  }

  const loadDelaySettings = () => {
    try {
      const stored = localStorage.getItem("whatsapp-settings")
      if (stored) {
        const settings = JSON.parse(stored)
        setDelaySeconds(settings.defaultDelay || 3)
      }
    } catch (error) {
      console.error("Error loading delay settings:", error)
    }
  }

  const saveDelaySettings = (delay: number) => {
    try {
      const stored = localStorage.getItem("whatsapp-settings")
      const settings = stored ? JSON.parse(stored) : {}
      settings.defaultDelay = delay
      localStorage.setItem("whatsapp-settings", JSON.stringify(settings))
    } catch (error) {
      console.error("Error saving delay settings:", error)
    }
  }

  const handleDelayChange = (newDelay: number) => {
    setDelaySeconds(newDelay)
    saveDelaySettings(newDelay)
  }

  const filteredClients = clients.filter(
    (client) => client.name.toLowerCase().includes(searchTerm.toLowerCase()) || client.phone.includes(searchTerm),
  )

  const getStatusIcon = (status: MessageStatus["status"]) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4 text-whatsapp-gray" />
      case "sending":
        return <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-whatsapp-green" />
      case "sent":
        return <CheckCircle className="h-4 w-4 text-whatsapp-green" />
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-whatsapp-green text-white p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <Send className="h-6 w-6" />
              <div>
                <h1 className="text-xl font-semibold">Enviar Mensajes</h1>
                <p className="text-sm text-white/80">Envía recordatorios a tus clientes</p>
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

      <div className="max-w-7xl mx-auto p-4 space-y-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Selección de Clientes */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="whatsapp-fade-in">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-whatsapp-green" />
                      Seleccionar Clientes
                    </CardTitle>
                    <CardDescription>Elige los clientes que recibirán el mensaje</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={selectAllClients}
                      className="whatsapp-btn-secondary bg-transparent"
                    >
                      Seleccionar Todos
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearSelection}
                      className="text-red-600 border-red-200 hover:bg-red-50 bg-transparent"
                    >
                      Limpiar
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-whatsapp-gray h-4 w-4" />
                  <Input
                    placeholder="Buscar clientes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 focus:ring-2 focus:ring-whatsapp-green"
                  />
                </div>

                <div className="max-h-96 overflow-y-auto space-y-2">
                  {filteredClients.map((client) => (
                    <div
                      key={client.id}
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedClients.includes(client.id)
                          ? "bg-whatsapp-green/10 border-whatsapp-green"
                          : "hover:bg-whatsapp-light-gray border-border"
                      }`}
                      onClick={() => toggleClientSelection(client.id)}
                    >
                      <input
                        type="checkbox"
                        checked={selectedClients.includes(client.id)}
                        onChange={() => toggleClientSelection(client.id)}
                        className="w-4 h-4 accent-whatsapp-green"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium">{client.name}</h4>
                        <p className="text-sm text-whatsapp-gray">{client.phone}</p>
                      </div>
                      {messageStatuses.find((s) => s.clientId === client.id) && (
                        <div className="flex items-center gap-2">
                          {getStatusIcon(messageStatuses.find((s) => s.clientId === client.id)!.status)}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {selectedClients.length > 0 && (
                  <div className="bg-whatsapp-green/10 p-3 rounded-lg">
                    <p className="text-sm text-whatsapp-green font-medium">
                      {selectedClients.length} cliente(s) seleccionado(s)
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Panel de Envío */}
          <div className="space-y-6">
            <Card className="whatsapp-fade-in">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="h-5 w-5 text-whatsapp-green" />
                  Mensaje
                </CardTitle>
                <CardDescription>Escribe el mensaje que se enviará</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="message">Texto del mensaje</Label>
                  <Textarea
                    id="message"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Buenos días, por favor cancelar su cuota del día de hoy puntual."
                    rows={6}
                    className="focus:ring-2 focus:ring-whatsapp-green"
                  />
                  <p className="text-xs text-whatsapp-gray">{messageText.length} caracteres</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="delay">Delay entre mensajes (segundos)</Label>
                    <Link href="/settings" className="text-xs text-whatsapp-green hover:underline">
                      Configurar
                    </Link>
                  </div>
                  <Input
                    id="delay"
                    type="number"
                    min="1"
                    max="300"
                    value={delaySeconds}
                    onChange={(e) => handleDelayChange(Number(e.target.value))}
                    className="focus:ring-2 focus:ring-whatsapp-green"
                  />
                  <div className="text-xs text-whatsapp-gray space-y-1">
                    <p>Tiempo de espera entre cada envío para evitar bloqueos</p>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          delaySeconds >= 30
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : delaySeconds >= 10
                              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                              : delaySeconds >= 3
                                ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                                : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                        }`}
                      >
                        {delaySeconds >= 30
                          ? "Muy Seguro"
                          : delaySeconds >= 10
                            ? "Seguro"
                            : delaySeconds >= 3
                              ? "Normal"
                              : "Riesgo"}
                      </span>
                      {delaySeconds < 3 && <span className="text-red-500 text-xs">⚠️ Puede activar protecciones</span>}
                    </div>
                  </div>
                </div>

                {isSending && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Progreso</span>
                      <span className="text-sm">{Math.round(sendingProgress)}%</span>
                    </div>
                    <Progress value={sendingProgress} className="h-2" />
                  </div>
                )}

                <div className="flex gap-2">
                  {!isSending ? (
                    <Button
                      onClick={handleSendMessages}
                      disabled={!messageText || selectedClients.length === 0 || whatsappStatus !== "Conectado"}
                      className="flex-1 whatsapp-btn-primary"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Enviar ({selectedClients.length})
                    </Button>
                  ) : (
                    <div className="flex gap-2 w-full">
                      <Button
                        onClick={isPaused ? resumeSending : pauseSending}
                        variant="outline"
                        className="flex-1 bg-transparent"
                      >
                        {isPaused ? (
                          <>
                            <Play className="h-4 w-4 mr-2" />
                            Reanudar
                          </>
                        ) : (
                          <>
                            <Pause className="h-4 w-4 mr-2" />
                            Pausar
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>

                {whatsappStatus !== "Conectado" && (
                  <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
                    <p className="text-sm text-red-600">WhatsApp debe estar conectado para enviar mensajes</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Estado de Envíos */}
            {messageStatuses.length > 0 && (
              <Card className="whatsapp-fade-in">
                <CardHeader>
                  <CardTitle className="text-sm">Estado de Envíos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {messageStatuses.map((status) => (
                      <div key={status.clientId} className="flex items-center justify-between text-sm">
                        <span className="truncate flex-1">{status.clientName}</span>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(status.status)}
                          <span
                            className={`text-xs ${
                              status.status === "sent"
                                ? "text-whatsapp-green"
                                : status.status === "failed"
                                  ? "text-red-500"
                                  : status.status === "sending"
                                    ? "text-blue-500"
                                    : "text-whatsapp-gray"
                            }`}
                          >
                            {status.status === "pending"
                              ? "Pendiente"
                              : status.status === "sending"
                                ? "Enviando..."
                                : status.status === "sent"
                                  ? "Enviado"
                                  : "Error"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
