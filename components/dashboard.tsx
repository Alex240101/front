"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

interface Client {
  id: string
  name: string
  phone: string
  email?: string
  notes?: string
}

interface DashboardProps {
  onLogout?: () => void
}

export default function Dashboard({ onLogout }: DashboardProps) {
  const [clients, setClients] = useState<Client[]>([])
  const [isAddingClient, setIsAddingClient] = useState(false)
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [messageText, setMessageText] = useState("")
  const [selectedClients, setSelectedClients] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [whatsappStatus, setWhatsappStatus] = useState("Desconectado")

  const [newClient, setNewClient] = useState({
    name: "",
    phone: "",
    email: "",
    notes: "",
  })

  useEffect(() => {
    loadClients()
    checkWhatsAppStatus()
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

  const handleAddClient = async () => {
    if (newClient.name && newClient.phone) {
      setIsLoading(true)
      try {
        const response = await fetch("https://back-wsp.onrender.com/api/client", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: newClient.name,
            phone: newClient.phone.startsWith("+51") ? newClient.phone : `+51${newClient.phone}`,
            email: newClient.email || undefined,
            notes: newClient.notes || undefined,
          }),
        })

        const data = await response.json()
        if (data.success) {
          await loadClients()
          setNewClient({ name: "", phone: "", email: "", notes: "" })
          setIsAddingClient(false)
        } else {
          alert("Error: " + data.error)
        }
      } catch (error) {
        console.error("Error agregando cliente:", error)
        alert("Error al agregar cliente")
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleEditClient = (client: Client) => {
    setEditingClient(client)
    setNewClient({
      name: client.name,
      phone: client.phone.replace("+51", ""),
      email: client.email || "",
      notes: client.notes || "",
    })
  }

  const handleUpdateClient = () => {
    if (editingClient && newClient.name && newClient.phone) {
      const updatedClient: Client = {
        ...editingClient,
        name: newClient.name,
        phone: newClient.phone.startsWith("+51") ? newClient.phone : `+51${newClient.phone}`,
        email: newClient.email || undefined,
        notes: newClient.notes || undefined,
      }
      setClients(clients.map((c) => (c.id === editingClient.id ? updatedClient : c)))
      setEditingClient(null)
      setNewClient({ name: "", phone: "", email: "", notes: "" })
    }
  }

  const handleDeleteClient = (id: string) => {
    setClients(clients.filter((c) => c.id !== id))
    setSelectedClients(selectedClients.filter((clientId) => clientId !== id))
  }

  const toggleClientSelection = (id: string) => {
    setSelectedClients((prev) => (prev.includes(id) ? prev.filter((clientId) => clientId !== id) : [...prev, id]))
  }

  const handleSendMessage = async () => {
    if (messageText && selectedClients.length > 0) {
      setIsLoading(true)
      try {
        const selectedClientData = clients.filter((c) => selectedClients.includes(c.id))
        let successCount = 0
        let errorCount = 0

        for (const client of selectedClientData) {
          try {
            const response = await fetch("https://back-wsp.onrender.com/api/send", {
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
            } else {
              errorCount++
              console.error(`Error enviando a ${client.name}:`, data.error)
            }
          } catch (error) {
            errorCount++
            console.error(`Error enviando a ${client.name}:`, error)
          }
        }

        if (successCount > 0) {
          alert(
            `✅ Mensaje enviado exitosamente a ${successCount} cliente(s)${errorCount > 0 ? `. ${errorCount} fallaron.` : ""}`,
          )
        } else {
          alert(`❌ No se pudo enviar el mensaje a ningún cliente`)
        }

        setMessageText("")
        setSelectedClients([])
      } catch (error) {
        console.error("Error enviando mensajes:", error)
        alert("Error al enviar mensajes")
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleLogout = async () => {
    if (confirm("¿Estás seguro de que quieres cerrar sesión de WhatsApp?")) {
      setIsLoading(true)
      try {
        const response = await fetch("https://back-wsp.onrender.com/api/logout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        })

        const data = await response.json()
        if (data.success) {
          alert("✅ Sesión cerrada exitosamente")
          setWhatsappStatus("Desconectado")
          if (onLogout) {
            onLogout()
          }
        } else {
          alert("❌ Error al cerrar sesión: " + data.error)
        }
      } catch (error) {
        console.error("Error cerrando sesión:", error)
        alert("❌ Error al cerrar sesión")
      } finally {
        setIsLoading(false)
      }
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold font-space-grotesk text-foreground">Dashboard</h1>
            <p className="text-muted-foreground font-dm-sans">Gestiona tus clientes y envía recordatorios</p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant={whatsappStatus === "Conectado" ? "default" : "destructive"} className="font-dm-sans">
              WhatsApp {whatsappStatus}
            </Badge>
            <Button
              variant="outline"
              onClick={handleLogout}
              disabled={isLoading}
              className="font-dm-sans bg-red-600 border-red-600 text-white hover:bg-red-700 hover:border-red-700 transition-colors"
            >
              {isLoading ? "Cerrando..." : "Cerrar Sesión"}
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Client Management */}
          <div className="lg:col-span-2 space-y-6">
            {/* Add/Edit Client Form */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="font-space-grotesk text-foreground">
                  {editingClient ? "Editar Cliente" : "Agregar Cliente"}
                </CardTitle>
                <CardDescription className="font-dm-sans text-muted-foreground">
                  {editingClient ? "Modifica los datos del cliente" : "Agrega un nuevo cliente a tu lista"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="font-dm-sans text-foreground">
                      Nombre completo
                    </Label>
                    <Input
                      id="name"
                      value={newClient.name}
                      onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                      placeholder="Juan Pérez"
                      className="font-dm-sans bg-input border-border text-foreground placeholder:text-muted-foreground"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="font-dm-sans text-foreground">
                      Teléfono
                    </Label>
                    <div className="flex">
                      <div className="flex items-center px-3 bg-muted border border-r-0 rounded-l-md border-border">
                        <span className="text-sm font-dm-sans text-foreground">+51</span>
                      </div>
                      <Input
                        id="phone"
                        value={newClient.phone}
                        onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                        placeholder="987654321"
                        className="rounded-l-none font-dm-sans bg-input border-border text-foreground placeholder:text-muted-foreground"
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="font-dm-sans text-foreground">
                    Email (opcional)
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={newClient.email}
                    onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                    placeholder="juan@ejemplo.com"
                    className="font-dm-sans bg-input border-border text-foreground placeholder:text-muted-foreground"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes" className="font-dm-sans text-foreground">
                    Notas (opcional)
                  </Label>
                  <Textarea
                    id="notes"
                    value={newClient.notes}
                    onChange={(e) => setNewClient({ ...newClient, notes: e.target.value })}
                    placeholder="Información adicional del cliente..."
                    className="font-dm-sans bg-input border-border text-foreground placeholder:text-muted-foreground"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={editingClient ? handleUpdateClient : handleAddClient}
                    className="font-dm-sans bg-green-600 hover:bg-green-700 text-white transition-colors"
                    disabled={isLoading}
                  >
                    {isLoading ? "Procesando..." : editingClient ? "Actualizar Cliente" : "Agregar Cliente"}
                  </Button>
                  {editingClient && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setEditingClient(null)
                        setNewClient({ name: "", phone: "", email: "", notes: "" })
                      }}
                      className="font-dm-sans bg-gray-600 border-gray-600 text-white hover:bg-gray-700 hover:border-gray-700 transition-colors"
                    >
                      Cancelar
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Clients List */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="font-space-grotesk text-foreground">Clientes ({clients.length})</CardTitle>
                <CardDescription className="font-dm-sans text-muted-foreground">
                  Lista de todos tus clientes registrados
                </CardDescription>
              </CardHeader>
              <CardContent>
                {clients.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground font-dm-sans">No hay clientes agregados aún</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {clients.map((client) => (
                      <div
                        key={client.id}
                        className="flex items-center justify-between p-4 border border-border rounded-lg bg-muted/20"
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={selectedClients.includes(client.id)}
                            onChange={() => toggleClientSelection(client.id)}
                            className="w-4 h-4 accent-green-600"
                          />
                          <div>
                            <h4 className="font-semibold font-space-grotesk text-foreground">{client.name}</h4>
                            <p className="text-sm text-muted-foreground font-dm-sans">{client.phone}</p>
                            {client.email && (
                              <p className="text-sm text-muted-foreground font-dm-sans">{client.email}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditClient(client)}
                            className="font-dm-sans bg-blue-600 border-blue-600 text-white hover:bg-blue-700 hover:border-blue-700 transition-colors"
                          >
                            Editar
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteClient(client.id)}
                            className="font-dm-sans bg-red-600 hover:bg-red-700 text-white transition-colors"
                          >
                            Eliminar
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Message Sending */}
          <div className="space-y-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="font-space-grotesk text-foreground">Enviar Mensaje</CardTitle>
                <CardDescription className="font-dm-sans text-muted-foreground">
                  Envía recordatorios a los clientes seleccionados
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="message" className="font-dm-sans text-foreground">
                    Mensaje
                  </Label>
                  <Textarea
                    id="message"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Escribe tu mensaje aquí..."
                    rows={6}
                    className="font-dm-sans bg-input border-border text-foreground placeholder:text-muted-foreground"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-dm-sans text-foreground">Clientes seleccionados</Label>
                  <div className="text-sm text-muted-foreground font-dm-sans">
                    {selectedClients.length === 0
                      ? "Ningún cliente seleccionado"
                      : `${selectedClients.length} cliente(s) seleccionado(s)`}
                  </div>
                </div>
                <Button
                  onClick={handleSendMessage}
                  disabled={!messageText || selectedClients.length === 0 || isLoading || whatsappStatus !== "Conectado"}
                  className="w-full font-dm-sans bg-green-600 hover:bg-green-700 text-white transition-colors disabled:bg-gray-400 disabled:hover:bg-gray-400"
                >
                  {isLoading ? "Enviando..." : `Enviar Mensaje (${selectedClients.length})`}
                </Button>
              </CardContent>
            </Card>

            {/* Stats */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="font-space-grotesk text-foreground">Estadísticas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="font-dm-sans text-foreground">Total Clientes:</span>
                  <span className="font-semibold font-dm-sans text-foreground">{clients.length}</span>
                </div>
                <Separator className="bg-border" />
                <div className="flex justify-between">
                  <span className="font-dm-sans text-foreground">Seleccionados:</span>
                  <span className="font-semibold font-dm-sans text-foreground">{selectedClients.length}</span>
                </div>
                <Separator className="bg-border" />
                <div className="flex justify-between">
                  <span className="font-dm-sans text-foreground">Estado WhatsApp:</span>
                  <Badge variant={whatsappStatus === "Conectado" ? "default" : "destructive"} className="font-dm-sans">
                    {whatsappStatus}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
