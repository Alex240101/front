const express = require("express")
const { Server } = require("socket.io")
const { Client, LocalAuth } = require("whatsapp-web.js")
const http = require("http")
const cors = require("cors")
const QRCode = require("qrcode")

// Configuración del servidor
console.log("🚀 Iniciando servidor WhatsApp Reminder System...")
const app = express()
const server = http.createServer(app)

const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:3001",
      "http://127.0.0.1:3001",
      "https://whatsapp-reminders.vercel.app", // Tu dominio de Vercel
      "https://*.vercel.app", // Cualquier subdominio de Vercel
    ],
    methods: ["GET", "POST"],
    credentials: true,
  },
})

const PORT = process.env.PORT || 3000

app.use(
  cors({
    origin: [
      "http://localhost:3001",
      "http://127.0.0.1:3001",
      "https://whatsapp-reminders.vercel.app",
      "https://*.vercel.app",
    ],
    credentials: true,
  }),
)
app.use(express.json())

// Variables globales
let whatsappClient = null
let isClientReady = false
let isInitializing = false
const clients = []

function initializeWhatsAppClient() {
  if (isInitializing) {
    console.log("⚠️ Cliente ya está inicializándose, esperando...")
    return
  }

  if (whatsappClient) {
    console.log("⚠️ Cliente ya existe, no reinicializando")
    return
  }

  isInitializing = true
  console.log("📱 Inicializando cliente de WhatsApp...")

  whatsappClient = new Client({
    authStrategy: new LocalAuth({
      clientId: "whatsapp-reminder-system",
    }),
    puppeteer: {
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--no-first-run",
        "--no-zygote",
        "--single-process",
        "--disable-gpu",
        "--disable-web-security",
        "--disable-features=VizDisplayCompositor",
      ],
    },
  })

  // Evento: QR Code generado
  whatsappClient.on("qr", async (qr) => {
    console.log("📱 ¡QR Code generado! Enviando inmediatamente...")

    try {
      const qrImageUrl = await QRCode.toDataURL(qr, {
        width: 200,
        margin: 0,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
        errorCorrectionLevel: "L",
      })

      io.emit("qr", qrImageUrl)
      console.log("✅ QR enviado al frontend")
    } catch (error) {
      console.error("❌ Error generando imagen QR:", error)
    }
  })

  // Evento: Cliente listo
  whatsappClient.on("ready", () => {
    console.log("✅ ¡Cliente de WhatsApp conectado y listo!")
    isClientReady = true
    isInitializing = false
    io.emit("ready", { message: "WhatsApp conectado exitosamente" })
  })

  // Evento: Cliente autenticado
  whatsappClient.on("authenticated", () => {
    console.log("🔐 Cliente autenticado correctamente")
    isInitializing = false
    io.emit("authenticated", { message: "Autenticación exitosa" })
  })

  // Evento: Error de autenticación
  whatsappClient.on("auth_failure", (msg) => {
    console.error("❌ Error de autenticación:", msg)
    isInitializing = false
    io.emit("auth_failure", { error: msg })
  })

  // Evento: Cliente desconectado
  whatsappClient.on("disconnected", (reason) => {
    console.log("🔌 Cliente desconectado:", reason)
    isClientReady = false
    isInitializing = false
    io.emit("logout", { reason: reason })
  })

  console.log("🔄 Iniciando proceso de conexión...")
  whatsappClient.initialize()
}

// Socket.IO - Manejo de conexiones
io.on("connection", (socket) => {
  console.log("🔗 Cliente frontend conectado:", socket.id)

  if (!whatsappClient && !isInitializing) {
    console.log("🔄 Inicializando WhatsApp para nuevo cliente...")
    initializeWhatsAppClient()
  }

  socket.emit("client_status", {
    isReady: isClientReady,
    clientsCount: clients.length,
  })

  socket.on("disconnect", () => {
    console.log("🔌 Cliente frontend desconectado:", socket.id)
  })
})

// ENDPOINTS DE LA API

// POST /api/client - Agregar cliente
app.post("/api/client", (req, res) => {
  try {
    const { name, phone, email } = req.body

    if (!name || !phone) {
      return res.status(400).json({
        success: false,
        error: "Nombre y teléfono son requeridos",
      })
    }

    const existingClient = clients.find((client) => client.phone === phone)
    if (existingClient) {
      return res.status(409).json({
        success: false,
        error: "Cliente ya existe con este número",
      })
    }

    const newClient = {
      id: Date.now().toString(),
      name,
      phone,
      email: email || null,
      createdAt: new Date().toISOString(),
    }

    clients.push(newClient)
    console.log("👤 ✅ Cliente agregado:", newClient.name, "-", newClient.phone)

    io.emit("client_added", newClient)

    res.status(201).json({
      success: true,
      message: "Cliente agregado exitosamente",
      client: newClient,
    })
  } catch (error) {
    console.error("❌ Error al agregar cliente:", error)
    res.status(500).json({
      success: false,
      error: "Error interno del servidor",
    })
  }
})

// GET /api/clients - Obtener clientes
app.get("/api/clients", (req, res) => {
  try {
    console.log("📋 Solicitando lista de clientes. Total:", clients.length)

    res.status(200).json({
      success: true,
      clients: clients,
      total: clients.length,
    })
  } catch (error) {
    console.error("❌ Error al obtener clientes:", error)
    res.status(500).json({
      success: false,
      error: "Error interno del servidor",
    })
  }
})

// POST /api/send - Enviar mensaje
app.post("/api/send", async (req, res) => {
  try {
    const { phone, message } = req.body

    if (!phone || !message) {
      return res.status(400).json({
        success: false,
        error: "Teléfono y mensaje son requeridos",
      })
    }

    if (!isClientReady || !whatsappClient) {
      return res.status(503).json({
        success: false,
        error: "Cliente de WhatsApp no está conectado",
      })
    }

    let formattedPhone = phone.replace(/\D/g, "")
    if (!formattedPhone.includes("@c.us")) {
      formattedPhone = formattedPhone + "@c.us"
    }

    console.log("📤 Enviando mensaje a:", phone)
    console.log("💬 Contenido:", message.substring(0, 50) + "...")

    const sentMessage = await whatsappClient.sendMessage(formattedPhone, message)

    console.log("✅ ¡Mensaje enviado exitosamente!")

    io.emit("message_sent", {
      phone,
      message,
      timestamp: new Date().toISOString(),
    })

    res.status(200).json({
      success: true,
      message: "Mensaje enviado exitosamente",
      messageId: sentMessage.id._serialized,
    })
  } catch (error) {
    console.error("❌ Error al enviar mensaje:", error)
    res.status(500).json({
      success: false,
      error: "Error al enviar mensaje: " + error.message,
    })
  }
})

// POST /api/logout - Cerrar sesión
app.post("/api/logout", async (req, res) => {
  try {
    if (!whatsappClient) {
      return res.status(400).json({
        success: false,
        error: "No hay sesión activa para cerrar",
      })
    }

    console.log("🚪 Cerrando sesión de WhatsApp...")

    await whatsappClient.logout()
    await whatsappClient.destroy()

    whatsappClient = null
    isClientReady = false
    isInitializing = false

    console.log("✅ Sesión cerrada exitosamente")

    io.emit("logout", { message: "Sesión cerrada por el usuario" })

    res.status(200).json({
      success: true,
      message: "Sesión cerrada exitosamente",
    })

    console.log("🔄 Reinicializando WhatsApp...")
    initializeWhatsAppClient()
  } catch (error) {
    console.error("❌ Error al cerrar sesión:", error)

    whatsappClient = null
    isClientReady = false
    isInitializing = false

    res.status(500).json({
      success: false,
      error: "Error al cerrar sesión: " + error.message,
    })

    console.log("🔄 Reinicializando WhatsApp después de error...")
    initializeWhatsAppClient()
  }
})

// GET /api/status - Estado del servidor
app.get("/api/status", (req, res) => {
  res.status(200).json({
    success: true,
    status: "Server running",
    whatsappReady: isClientReady,
    clientsCount: clients.length,
    timestamp: new Date().toISOString(),
  })
})

// GET / - Endpoint raíz
app.get("/", (req, res) => {
  res.json({
    message: "🚀 WhatsApp Reminder System API",
    version: "1.0.0",
    status: "✅ Servidor funcionando correctamente",
    whatsappStatus: isClientReady ? "✅ Conectado" : "⏳ Desconectado",
    endpoints: {
      "POST /api/client": "Agregar cliente",
      "GET /api/clients": "Obtener clientes",
      "POST /api/send": "Enviar mensaje",
      "POST /api/logout": "Cerrar sesión",
      "GET /api/status": "Estado del servidor",
    },
  })
})

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  })
})

process.on("uncaughtException", (error) => {
  console.error("❌ Error no capturado:", error)
})

process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Promesa rechazada no manejada:", reason)
})

// Iniciar servidor
server.listen(PORT, () => {
  console.log("=".repeat(50))
  console.log("🚀 SERVIDOR WHATSAPP REMINDER INICIADO")
  console.log("=".repeat(50))
  console.log(`📡 Puerto: ${PORT}`)
  console.log(`🌐 API: http://localhost:${PORT}`)
  console.log(`🔌 Socket.IO: Habilitado`)
  console.log(`📱 WhatsApp: Inicializando...`)
  console.log("=".repeat(50))
})

module.exports = { app, server, io }
