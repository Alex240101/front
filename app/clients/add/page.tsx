"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ThemeToggle } from "@/components/theme-toggle"
import { ArrowLeft, UserPlus, Save } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function AddClientPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [newClient, setNewClient] = useState({
    name: "",
    phone: "",
    email: "",
    notes: "",
  })

  const handleAddClient = async () => {
    if (newClient.name && newClient.phone) {
      setIsLoading(true)
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000"}/api/client`, {
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
          router.push("/clients")
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
              <UserPlus className="h-6 w-6" />
              <div>
                <h1 className="text-xl font-semibold">Agregar Cliente</h1>
                <p className="text-sm text-white/80">Registra un nuevo cliente</p>
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
              <UserPlus className="h-5 w-5 text-whatsapp-green" />
              Información del Cliente
            </CardTitle>
            <CardDescription>
              Completa los datos del nuevo cliente. Los campos marcados con * son obligatorios.
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
                  value={newClient.name}
                  onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
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
                    value={newClient.phone}
                    onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                    placeholder="987654321"
                    className="rounded-l-none focus:ring-2 focus:ring-whatsapp-green focus:border-whatsapp-green"
                  />
                </div>
                <p className="text-xs text-whatsapp-gray">Ingresa el número sin el código de país (+51)</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Correo electrónico
              </Label>
              <Input
                id="email"
                type="email"
                value={newClient.email}
                onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
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
                value={newClient.notes}
                onChange={(e) => setNewClient({ ...newClient, notes: e.target.value })}
                placeholder="Información adicional sobre el cliente, recordatorios especiales, etc."
                rows={4}
                className="focus:ring-2 focus:ring-whatsapp-green focus:border-whatsapp-green"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleAddClient}
                disabled={!newClient.name || !newClient.phone || isLoading}
                className="flex-1 whatsapp-btn-primary"
              >
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? "Guardando..." : "Guardar Cliente"}
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
