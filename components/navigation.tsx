"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ThemeToggle } from "@/components/theme-toggle"
import { Home, Users, Send, Calendar, Menu, X, LogOut, MessageSquare, Settings } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

interface NavigationProps {
  whatsappStatus?: string
  onLogout?: () => void
}

export function Navigation({ whatsappStatus = "Desconectado", onLogout }: NavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  const navigationItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: Home,
    },
    {
      name: "Clientes",
      href: "/clients",
      icon: Users,
    },
    {
      name: "Enviar Mensajes",
      href: "/messages",
      icon: Send,
    },
    {
      name: "Programados",
      href: "/scheduled",
      icon: Calendar,
    },
    {
      name: "Configuración",
      href: "/settings",
      icon: Settings,
    },
  ]

  const handleLogout = async () => {
    if (confirm("¿Estás seguro de que quieres cerrar sesión de WhatsApp?")) {
      try {
        localStorage.removeItem("whatsapp-session")

        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000"}/api/logout`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        })

        const data = await response.json()
        if (data.success) {
          alert("✅ Sesión cerrada exitosamente")
          window.location.href = "/"
        } else {
          alert("❌ Error al cerrar sesión: " + data.error)
        }
      } catch (error) {
        console.error("Error cerrando sesión:", error)
        alert("❌ Error al cerrar sesión")
      }
    }
  }

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:flex bg-gray-900 text-white p-4 shadow-lg border-b border-gray-700">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="flex items-center gap-2">
              <MessageSquare className="h-6 w-6 text-white" />
              <span className="font-semibold text-lg text-white">WhatsApp Reminders</span>
            </Link>

            <div className="flex items-center gap-1">
              {navigationItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link key={item.href} href={item.href}>
                    <Button
                      variant="ghost"
                      className={`text-white hover:bg-gray-800 hover:text-white transition-all duration-200 ${
                        isActive ? "bg-gray-800 text-white shadow-md border border-gray-600" : ""
                      }`}
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      {item.name}
                    </Button>
                  </Link>
                )
              })}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Badge
              variant={whatsappStatus === "Conectado" ? "default" : "destructive"}
              className={`${
                whatsappStatus === "Conectado" ? "bg-green-500 text-white" : "bg-red-500 text-white"
              } shadow-sm`}
            >
              WhatsApp {whatsappStatus}
            </Badge>
            <ThemeToggle />
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="text-white hover:bg-gray-800 transition-all duration-200"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <nav className="md:hidden bg-gray-900 text-white p-4 shadow-lg border-b border-gray-700">
        <div className="flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-white" />
            <span className="font-semibold text-white">WhatsApp Reminders</span>
          </Link>

          <div className="flex items-center gap-2">
            <Badge
              variant={whatsappStatus === "Conectado" ? "default" : "destructive"}
              className={`${
                whatsappStatus === "Conectado" ? "bg-green-500 text-white" : "bg-red-500 text-white"
              } text-xs shadow-sm`}
            >
              {whatsappStatus}
            </Badge>
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-white hover:bg-gray-800"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="mt-4 space-y-2 border-t border-gray-600 pt-4">
            {navigationItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant="ghost"
                    className={`w-full justify-start text-white hover:bg-gray-800 transition-all duration-200 ${
                      isActive ? "bg-gray-800 border border-gray-600" : ""
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {item.name}
                  </Button>
                </Link>
              )
            })}
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="w-full justify-start text-white hover:bg-gray-800"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Cerrar Sesión
            </Button>
          </div>
        )}
      </nav>
    </>
  )
}
