"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ThemeToggle } from "@/components/theme-toggle"
import { ArrowLeft, Edit, Save } from "lucide-react"
import Link from "next/link"
import { useRouter, useParams } from "next/navigation"

interface Client {
  id: string
  name: string
  phone: string
  email?: string
  notes?: string
}

export default function EditClientPage() {
  const router = useRouter()
  const params = useParams()
  const [isLoading, setIsLoading] = useState(false)
  const [client, setClient] = useState<Client | null>(null)
  const [editClient, setEditClient] = useState({
    name: "",
    phone: "",
    email: "",
    notes: "",
  })

  useEffect(() => {
    loadClient()
  }, [])

  const loadClient = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/clients")
      const data = await response.json()
      if (data.success) {
        const foundClient = data.clients.find((c: Client) => c.id === params.id)
        if (foundClient) {
          setClient(foundClient)
          setEditClient({
            name: foundClient.name,
            phone: foundClient.phone.replace("+51", ""),
            email: foundClient.email || "",
            notes: foundClient.notes || "",
          })
        }
      }
    } catch (error) {
      console.error("Error cargando cliente:", error)
    }
  }

  const handleUpdateClient = async () => {
    if (editClient.name && editClient.phone && client) {
      setIsLoading(true)
      try {
        // Aquí iría la llamada al backend para actualizar
        // Por ahora simulamos el éxito
        router.push("/clients")
      } catch (error) {
        console.error("Error actualizando cliente:", error)
        alert("Error al actualizar cliente")
      } finally {
        setIsLoading(false)
      }
    }
  }

  if (!client) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-whatsapp-green mx-auto mb-4"></div>
          <p>Cargando cliente...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-whatsapp-green text-white p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/clients">
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <Edit className="h-6 w-6" />
              <div>
                <h1 className="text-xl font-semibold">Editar Cliente</h1>
                <p className="text-sm text-white/80">{client.name}</p>
              </div>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4">
        <Card className="whatsapp-fade-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5 text-whatsapp-green" />
              Editar Información
            </CardTitle>
            <CardDescription>
              Modifica los datos del cliente. Los campos marcados con * son obligatorios.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">
                  Nombre completo *
                </Label>
                <Input
                  id="name"
                  value={editClient.name}
                  onChange={(e) => setEditClient({ ...editClient, name: e.target.value })}
                  placeholder="Ej: Juan Pérez García"
                  className="focus:ring-2 focus:ring-whatsapp-green focus:border-whatsapp-green"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium">
                  Teléfono *
                </Label>
                <div className="flex">
                  <div className="flex items-center px-3 bg-whatsapp-light-gray border border-r-0 rounded-l-md">
                    <span className="text-sm font-medium">+51</span>
                  </div>
                  <Input
                    id="phone"
                    value={editClient.phone}
                    onChange={(e) => setEditClient({ ...editClient, phone: e.target.value })}
                    placeholder="987654321"
                    className="rounded-l-none focus:ring-2 focus:ring-whatsapp-green focus:border-whatsapp-green"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Correo electrónico
              </Label>
              <Input
                id="email"
                type="email"
                value={editClient.email}
                onChange={(e) => setEditClient({ ...editClient, email: e.target.value })}
                placeholder="juan@ejemplo.com"
                className="focus:ring-2 focus:ring-whatsapp-green focus:border-whatsapp-green"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes" className="text-sm font-medium">
                Notas adicionales
              </Label>
              <Textarea
                id="notes"
                value={editClient.notes}
                onChange={(e) => setEditClient({ ...editClient, notes: e.target.value })}
                placeholder="Información adicional sobre el cliente..."
                rows={4}
                className="focus:ring-2 focus:ring-whatsapp-green focus:border-whatsapp-green"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleUpdateClient}
                disabled={!editClient.name || !editClient.phone || isLoading}
                className="flex-1 whatsapp-btn-primary"
              >
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? "Guardando..." : "Guardar Cambios"}
              </Button>
              <Link href="/clients">
                <Button variant="outline" className="whatsapp-btn-secondary bg-transparent">
                  Cancelar
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
