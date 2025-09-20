"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Search, Users, Plus, Edit, Trash2, Phone, Mail } from "lucide-react"
import Link from "next/link"

interface Client {
  id: string
  name: string
  phone: string
  email?: string
  notes?: string
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    loadClients()
  }, [])

  const loadClients = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000"}/api/clients`)
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

  const handleDeleteClient = async (id: string, name: string) => {
    if (confirm(`¿Estás seguro de que quieres eliminar a ${name}?`)) {
      try {
        // Aquí iría la llamada al backend para eliminar
        setClients(clients.filter((c) => c.id !== id))
      } catch (error) {
        console.error("Error eliminando cliente:", error)
      }
    }
  }

  const filteredClients = clients.filter(
    (client) => client.name.toLowerCase().includes(searchTerm.toLowerCase()) || client.phone.includes(searchTerm),
  )

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
              <Users className="h-6 w-6" />
              <div>
                <h1 className="text-xl font-semibold">Lista de Clientes</h1>
                <p className="text-sm text-white/80">{clients.length} clientes registrados</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/clients/add">
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                <Plus className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 space-y-6">
        <Card className="whatsapp-fade-in">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-whatsapp-gray h-4 w-4" />
              <Input
                placeholder="Buscar clientes por nombre o teléfono..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-whatsapp-light-gray border-0 focus:ring-2 focus:ring-whatsapp-green"
              />
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-4">
                  <div className="h-4 bg-whatsapp-light-gray rounded mb-2"></div>
                  <div className="h-3 bg-whatsapp-light-gray rounded mb-1"></div>
                  <div className="h-3 bg-whatsapp-light-gray rounded w-2/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredClients.length === 0 ? (
          <Card className="whatsapp-fade-in">
            <CardContent className="p-8 text-center">
              <Users className="h-12 w-12 text-whatsapp-gray mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {searchTerm ? "No se encontraron clientes" : "No hay clientes registrados"}
              </h3>
              <p className="text-whatsapp-gray mb-4">
                {searchTerm ? "Intenta con otros términos de búsqueda" : "Comienza agregando tu primer cliente"}
              </p>
              {!searchTerm && (
                <Link href="/clients/add">
                  <Button className="whatsapp-btn-primary">
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar Cliente
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredClients.map((client, index) => (
              <Card
                key={client.id}
                className="whatsapp-fade-in hover:shadow-lg transition-shadow"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">{client.name}</h3>
                      <div className="flex items-center gap-2 text-whatsapp-gray text-sm mb-1">
                        <Phone className="h-3 w-3" />
                        <span>{client.phone}</span>
                      </div>
                      {client.email && (
                        <div className="flex items-center gap-2 text-whatsapp-gray text-sm">
                          <Mail className="h-3 w-3" />
                          <span>{client.email}</span>
                        </div>
                      )}
                    </div>
                    <Badge variant="secondary" className="bg-whatsapp-green/10 text-whatsapp-green">
                      Activo
                    </Badge>
                  </div>

                  {client.notes && <p className="text-sm text-whatsapp-gray mb-3 line-clamp-2">{client.notes}</p>}

                  <div className="flex gap-2">
                    <Link href={`/clients/edit/${client.id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full whatsapp-btn-secondary bg-transparent">
                        <Edit className="h-3 w-3 mr-1" />
                        Editar
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteClient(client.id, client.name)}
                      className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="fixed bottom-6 right-6 md:hidden">
          <Link href="/clients/add">
            <Button
              size="lg"
              className="rounded-full h-14 w-14 bg-whatsapp-green hover:bg-whatsapp-green-dark shadow-lg"
            >
              <Plus className="h-6 w-6" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
