"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Users, MessageSquare, Calendar, Send, TrendingUp, Clock } from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalClients: 0,
    messagesThisMonth: 0,
    scheduledMessages: 0,
    whatsappStatus: "Desconectado",
  })

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000"}/api/clients`)
      const data = await response.json()
      if (data.success) {
        setStats((prev) => ({ ...prev, totalClients: data.clients.length }))
      }

      const statusResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000"}/api/status`)
      const statusData = await statusResponse.json()
      if (statusData.success) {
        setStats((prev) => ({
          ...prev,
          whatsappStatus: statusData.whatsappReady ? "Conectado" : "Desconectado",
        }))
      }
    } catch (error) {
      console.error("Error cargando estadísticas:", error)
    }
  }

  return (
    <div className="p-4 space-y-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">Dashboard</h1>
          <p className="text-whatsapp-gray">Resumen de tu sistema de recordatorios WhatsApp</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="whatsapp-fade-in hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-whatsapp-gray">Total Clientes</p>
                  <p className="text-2xl font-bold text-whatsapp-green">{stats.totalClients}</p>
                </div>
                <Users className="h-8 w-8 text-whatsapp-green" />
              </div>
            </CardContent>
          </Card>

          <Card className="whatsapp-fade-in hover:shadow-lg transition-shadow" style={{ animationDelay: "0.1s" }}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-whatsapp-gray">Mensajes Este Mes</p>
                  <p className="text-2xl font-bold text-whatsapp-green">{stats.messagesThisMonth}</p>
                </div>
                <MessageSquare className="h-8 w-8 text-whatsapp-green" />
              </div>
            </CardContent>
          </Card>

          <Card className="whatsapp-fade-in hover:shadow-lg transition-shadow" style={{ animationDelay: "0.2s" }}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-whatsapp-gray">Mensajes Programados</p>
                  <p className="text-2xl font-bold text-whatsapp-green">{stats.scheduledMessages}</p>
                </div>
                <Calendar className="h-8 w-8 text-whatsapp-green" />
              </div>
            </CardContent>
          </Card>

          <Card className="whatsapp-fade-in hover:shadow-lg transition-shadow" style={{ animationDelay: "0.3s" }}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-whatsapp-gray">Estado WhatsApp</p>
                  <p
                    className={`text-lg font-semibold ${stats.whatsappStatus === "Conectado" ? "text-whatsapp-green" : "text-red-500"}`}
                  >
                    {stats.whatsappStatus}
                  </p>
                </div>
                <div
                  className={`h-3 w-3 rounded-full ${stats.whatsappStatus === "Conectado" ? "bg-whatsapp-green" : "bg-red-500"}`}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="whatsapp-fade-in hover:shadow-lg transition-shadow cursor-pointer">
            <Link href="/clients">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-whatsapp-green/10 rounded-lg">
                    <Users className="h-6 w-6 text-whatsapp-green" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Gestionar Clientes</h3>
                    <p className="text-sm text-whatsapp-gray">Ver, agregar y editar clientes</p>
                  </div>
                </div>
              </CardContent>
            </Link>
          </Card>

          <Card
            className="whatsapp-fade-in hover:shadow-lg transition-shadow cursor-pointer"
            style={{ animationDelay: "0.1s" }}
          >
            <Link href="/messages">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-whatsapp-green/10 rounded-lg">
                    <Send className="h-6 w-6 text-whatsapp-green" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Enviar Mensajes</h3>
                    <p className="text-sm text-whatsapp-gray">Envía recordatorios a tus clientes</p>
                  </div>
                </div>
              </CardContent>
            </Link>
          </Card>

          <Card
            className="whatsapp-fade-in hover:shadow-lg transition-shadow cursor-pointer"
            style={{ animationDelay: "0.2s" }}
          >
            <Link href="/scheduled">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-whatsapp-green/10 rounded-lg">
                    <Calendar className="h-6 w-6 text-whatsapp-green" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Mensajes Programados</h3>
                    <p className="text-sm text-whatsapp-gray">Programa mensajes automáticos</p>
                  </div>
                </div>
              </CardContent>
            </Link>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="whatsapp-fade-in">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-5 w-5 text-whatsapp-green" />
              <h2 className="text-lg font-semibold">Actividad Reciente</h2>
            </div>
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-whatsapp-gray mx-auto mb-4" />
              <p className="text-whatsapp-gray">No hay actividad reciente</p>
              <p className="text-sm text-whatsapp-gray mt-2">
                Los mensajes enviados y acciones realizadas aparecerán aquí
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
