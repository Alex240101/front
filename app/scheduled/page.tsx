"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Calendar, Clock, Plus, Edit, Trash2, Play, Pause, Users } from "lucide-react"
import Link from "next/link"

interface Client {
  id: string
  name: string
  phone: string
  email?: string
  notes?: string
}

interface ScheduledMessage {
  id: string
  title: string
  message: string
  clientIds: string[]
  scheduleType: "once" | "daily" | "weekly" | "monthly"
  scheduleDate?: string
  scheduleTime: string
  isActive: boolean
  lastSent?: string
  nextSend?: string
  createdAt: string
}

export default function ScheduledPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [scheduledMessages, setScheduledMessages] = useState<ScheduledMessage[]>([])
  const [isCreating, setIsCreating] = useState(false)
  const [editingMessage, setEditingMessage] = useState<ScheduledMessage | null>(null)
  const [selectedClients, setSelectedClients] = useState<string[]>([])

  const [newSchedule, setNewSchedule] = useState({
    title: "",
    message: "",
    scheduleType: "once" as "once" | "daily" | "weekly" | "monthly",
    scheduleDate: "",
    scheduleTime: "",
  })

  useEffect(() => {
    loadClients()
    loadScheduledMessages()
  }, [])

  const loadClients = async () => {
    try {
      const response = await fetch("https://back-wsp.onrender.com/api/clients")
      const data = await response.json()
      if (data.success) {
        setClients(data.clients)
      }
    } catch (error) {
      console.error("Error cargando clientes:", error)
    }
  }

  const loadScheduledMessages = async () => {
    try {
      // Aquí iría la llamada al backend para cargar mensajes programados
      // Por ahora usamos datos de ejemplo
      const exampleSchedules: ScheduledMessage[] = [
        {
          id: "1",
          title: "Recordatorio de Pago Diario",
          message: "Buenos días, recordatorio para cancelar su cuota del día de hoy.",
          clientIds: ["1", "2"],
          scheduleType: "daily",
          scheduleTime: "09:00",
          isActive: true,
          nextSend: "2025-01-21T09:00:00",
          createdAt: "2025-01-20T10:00:00",
        },
      ]
      setScheduledMessages(exampleSchedules)
    } catch (error) {
      console.error("Error cargando mensajes programados:", error)
    }
  }

  const handleCreateSchedule = async () => {
    if (newSchedule.title && newSchedule.message && newSchedule.scheduleTime && selectedClients.length > 0) {
      const schedule: ScheduledMessage = {
        id: Date.now().toString(),
        title: newSchedule.title,
        message: newSchedule.message,
        clientIds: selectedClients,
        scheduleType: newSchedule.scheduleType,
        scheduleDate: newSchedule.scheduleDate,
        scheduleTime: newSchedule.scheduleTime,
        isActive: true,
        createdAt: new Date().toISOString(),
        nextSend: calculateNextSend(newSchedule.scheduleType, newSchedule.scheduleDate, newSchedule.scheduleTime),
      }

      try {
        // Aquí iría la llamada al backend para crear el mensaje programado
        setScheduledMessages([...scheduledMessages, schedule])
        resetForm()
        setIsCreating(false)
      } catch (error) {
        console.error("Error creando mensaje programado:", error)
        alert("Error al crear mensaje programado")
      }
    }
  }

  const calculateNextSend = (type: string, date?: string, time?: string) => {
    const now = new Date()
    const [hours, minutes] = time?.split(":").map(Number) || [9, 0]

    switch (type) {
      case "once":
        if (date) {
          const scheduleDate = new Date(date)
          scheduleDate.setHours(hours, minutes, 0, 0)
          return scheduleDate.toISOString()
        }
        break
      case "daily":
        const tomorrow = new Date(now)
        tomorrow.setDate(tomorrow.getDate() + 1)
        tomorrow.setHours(hours, minutes, 0, 0)
        return tomorrow.toISOString()
      case "weekly":
        const nextWeek = new Date(now)
        nextWeek.setDate(nextWeek.getDate() + 7)
        nextWeek.setHours(hours, minutes, 0, 0)
        return nextWeek.toISOString()
      case "monthly":
        const nextMonth = new Date(now)
        nextMonth.setMonth(nextMonth.getMonth() + 1)
        nextMonth.setHours(hours, minutes, 0, 0)
        return nextMonth.toISOString()
    }
    return new Date().toISOString()
  }

  const toggleScheduleStatus = async (id: string) => {
    setScheduledMessages(
      scheduledMessages.map((schedule) =>
        schedule.id === id ? { ...schedule, isActive: !schedule.isActive } : schedule,
      ),
    )
  }

  const deleteSchedule = async (id: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar este mensaje programado?")) {
      setScheduledMessages(scheduledMessages.filter((schedule) => schedule.id !== id))
    }
  }

  const resetForm = () => {
    setNewSchedule({
      title: "",
      message: "",
      scheduleType: "once",
      scheduleDate: "",
      scheduleTime: "",
    })
    setSelectedClients([])
    setEditingMessage(null)
  }

  const formatNextSend = (dateString?: string) => {
    if (!dateString) return "No programado"
    const date = new Date(dateString)
    return date.toLocaleString("es-PE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getScheduleTypeLabel = (type: string) => {
    switch (type) {
      case "once":
        return "Una vez"
      case "daily":
        return "Diario"
      case "weekly":
        return "Semanal"
      case "monthly":
        return "Mensual"
      default:
        return type
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
              <Calendar className="h-6 w-6" />
              <div>
                <h1 className="text-xl font-semibold">Mensajes Programados</h1>
                <p className="text-sm text-white/80">Automatiza tus recordatorios</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setIsCreating(true)}
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
            >
              <Plus className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 space-y-6">
        {/* Crear/Editar Mensaje Programado */}
        {(isCreating || editingMessage) && (
          <Card className="whatsapp-fade-in">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-whatsapp-green" />
                {editingMessage ? "Editar Mensaje Programado" : "Crear Mensaje Programado"}
              </CardTitle>
              <CardDescription>
                {editingMessage ? "Modifica el mensaje programado" : "Programa un mensaje automático"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Título del recordatorio</Label>
                    <Input
                      id="title"
                      value={newSchedule.title}
                      onChange={(e) => setNewSchedule({ ...newSchedule, title: e.target.value })}
                      placeholder="Ej: Recordatorio de Pago Diario"
                      className="focus:ring-2 focus:ring-whatsapp-green"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Mensaje</Label>
                    <Textarea
                      id="message"
                      value={newSchedule.message}
                      onChange={(e) => setNewSchedule({ ...newSchedule, message: e.target.value })}
                      placeholder="Buenos días, recordatorio para cancelar su cuota del día de hoy."
                      rows={4}
                      className="focus:ring-2 focus:ring-whatsapp-green"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Frecuencia</Label>
                      <Select
                        value={newSchedule.scheduleType}
                        onValueChange={(value: "once" | "daily" | "weekly" | "monthly") =>
                          setNewSchedule({ ...newSchedule, scheduleType: value })
                        }
                      >
                        <SelectTrigger className="focus:ring-2 focus:ring-whatsapp-green">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="once">Una vez</SelectItem>
                          <SelectItem value="daily">Diario</SelectItem>
                          <SelectItem value="weekly">Semanal</SelectItem>
                          <SelectItem value="monthly">Mensual</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="time">Hora</Label>
                      <Input
                        id="time"
                        type="time"
                        value={newSchedule.scheduleTime}
                        onChange={(e) => setNewSchedule({ ...newSchedule, scheduleTime: e.target.value })}
                        className="focus:ring-2 focus:ring-whatsapp-green"
                      />
                    </div>
                  </div>

                  {newSchedule.scheduleType === "once" && (
                    <div className="space-y-2">
                      <Label htmlFor="date">Fecha</Label>
                      <Input
                        id="date"
                        type="date"
                        value={newSchedule.scheduleDate}
                        onChange={(e) => setNewSchedule({ ...newSchedule, scheduleDate: e.target.value })}
                        className="focus:ring-2 focus:ring-whatsapp-green"
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Clientes ({selectedClients.length} seleccionados)</Label>
                    <div className="max-h-64 overflow-y-auto border rounded-lg p-2 space-y-2">
                      {clients.map((client) => (
                        <div
                          key={client.id}
                          className={`flex items-center gap-3 p-2 rounded cursor-pointer transition-colors ${
                            selectedClients.includes(client.id)
                              ? "bg-whatsapp-green/10 border border-whatsapp-green"
                              : "hover:bg-whatsapp-light-gray"
                          }`}
                          onClick={() =>
                            setSelectedClients((prev) =>
                              prev.includes(client.id) ? prev.filter((id) => id !== client.id) : [...prev, client.id],
                            )
                          }
                        >
                          <input
                            type="checkbox"
                            checked={selectedClients.includes(client.id)}
                            onChange={() => {}}
                            className="w-4 h-4 accent-whatsapp-green"
                          />
                          <div>
                            <p className="font-medium text-sm">{client.name}</p>
                            <p className="text-xs text-whatsapp-gray">{client.phone}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleCreateSchedule}
                  disabled={
                    !newSchedule.title ||
                    !newSchedule.message ||
                    !newSchedule.scheduleTime ||
                    selectedClients.length === 0
                  }
                  className="whatsapp-btn-primary"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  {editingMessage ? "Actualizar" : "Programar Mensaje"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsCreating(false)
                    resetForm()
                  }}
                  className="whatsapp-btn-secondary bg-transparent"
                >
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Lista de Mensajes Programados */}
        <Card className="whatsapp-fade-in">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Mensajes Programados ({scheduledMessages.length})</CardTitle>
                <CardDescription>Lista de todos tus mensajes automáticos</CardDescription>
              </div>
              {!isCreating && (
                <Button onClick={() => setIsCreating(true)} className="whatsapp-btn-primary">
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Mensaje
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {scheduledMessages.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-whatsapp-gray mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No hay mensajes programados</h3>
                <p className="text-whatsapp-gray mb-4">Crea tu primer mensaje automático</p>
                <Button onClick={() => setIsCreating(true)} className="whatsapp-btn-primary">
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Mensaje Programado
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {scheduledMessages.map((schedule) => (
                  <Card key={schedule.id} className="border-l-4 border-l-whatsapp-green">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold">{schedule.title}</h3>
                            <Badge
                              variant={schedule.isActive ? "default" : "secondary"}
                              className={
                                schedule.isActive ? "bg-whatsapp-green text-white" : "bg-whatsapp-gray text-white"
                              }
                            >
                              {schedule.isActive ? "Activo" : "Pausado"}
                            </Badge>
                            <Badge variant="outline" className="text-whatsapp-green border-whatsapp-green">
                              {getScheduleTypeLabel(schedule.scheduleType)}
                            </Badge>
                          </div>

                          <p className="text-sm text-whatsapp-gray mb-3 line-clamp-2">{schedule.message}</p>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-whatsapp-gray">Clientes:</span>
                              <div className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                <span className="font-medium">{schedule.clientIds.length}</span>
                              </div>
                            </div>
                            <div>
                              <span className="text-whatsapp-gray">Próximo envío:</span>
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                <span className="font-medium">{formatNextSend(schedule.nextSend)}</span>
                              </div>
                            </div>
                            <div>
                              <span className="text-whatsapp-gray">Hora:</span>
                              <p className="font-medium">{schedule.scheduleTime}</p>
                            </div>
                            <div>
                              <span className="text-whatsapp-gray">Último envío:</span>
                              <p className="font-medium">
                                {schedule.lastSent ? formatNextSend(schedule.lastSent) : "Nunca"}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2 ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleScheduleStatus(schedule.id)}
                            className={
                              schedule.isActive
                                ? "text-whatsapp-gray border-whatsapp-gray hover:bg-whatsapp-gray/10 bg-transparent"
                                : "text-whatsapp-green border-whatsapp-green hover:bg-whatsapp-green/10 bg-transparent"
                            }
                          >
                            {schedule.isActive ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingMessage(schedule)}
                            className="whatsapp-btn-secondary bg-transparent"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteSchedule(schedule.id)}
                            className="text-red-600 border-red-200 hover:bg-red-50 bg-transparent"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
