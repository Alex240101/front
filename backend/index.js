const express = require("express")
const { Server } = require("socket.io")
const { Client, LocalAuth } = require("whatsapp-web.js")
const http = require("http")
const cors = require("cors")
const QRCode = require("qrcode") // Agregando qrcode library para generar imagen QR
const { errorHandler, asyncHandler } = require("./middleware/error-handler")

// Configuración del servidor
console.log("🚀 Iniciando servidor WhatsApp Reminder System...")
const app = express()
const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: [
      "https://front-chi-woad.vercel.app",
      "https://front-chi-woad.vercel.app/",
      "https://front-chi-woad.vercel.app/dashboard",
      "https://front-chi-woad.vercel.app/clients",
      "https://front-chi-woad.vercel.app/messages",
      "https://front-chi-woad.vercel.app/scheduled",
      "http://localhost:3001",
      "http://127.0.0.1:3001",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    preflightContinue: false,
    optionsSuccessStatus: 204,
  },
})

const PORT = process.env.PORT || 3000

// Middlewares
app.use(
  cors({
    origin: [
      "https://front-chi-woad.vercel.app",
      "https://front-chi-woad.vercel.app/",
      "https://front-chi-woad.vercel.app/dashboard",
      "https://front-chi-woad.vercel.app/clients",
      "https://front-chi-woad.vercel.app/messages",
      "https://front-chi-woad.vercel.app/scheduled",
      "http://localhost:3001",
      "http://127.0.0.1:3001",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    preflightContinue: false,
    optionsSuccessStatus: 204,
  }),
)
app.use(express.json())

app.options("*", (req, res) => {
  res.header("Access-Control-Allow-Origin", "https://front-chi-woad.vercel.app")
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With")
  res.header("Access-Control-Allow-Credentials", "true")
  res.status(204).send()
})

// Variables globales
let whatsappClient = null
let isClientReady = false
let isInitializing = false // Prevenir múltiples inicializaciones
const clients = [] // Array en memoria para almacenar clientes

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
      ],
    },
  })

  // Evento: QR Code generado
  whatsappClient.on("qr", async (qr) => {
    console.log("📱 ¡QR Code generado! Enviando inmediatamente...")

    try {
      const qrImageUrl = await QRCode.toDataURL(qr, {
        width: 150, // Reduced size for faster generation
        margin: 0,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
        errorCorrectionLevel: "L", // Fastest generation
      })

      io.emit("qr", qrImageUrl)
      console.log("✅ QR enviado al frontend INMEDIATAMENTE")
    } catch (error) {
      console.error("❌ Error generando imagen QR:", error)
    }
  })

  // Evento: Cliente listo
  whatsappClient.on("ready", () => {
    console.log("✅ ¡Cliente de WhatsApp conectado y listo!")
    isClientReady = true
    isInitializing = false // Marcar inicialización como completa
    io.emit("ready", { message: "WhatsApp conectado exitosamente" })
  })

  // Evento: Cliente autenticado
  whatsappClient.on("authenticated", () => {
    console.log("🔐 Cliente autenticado correctamente")
    isInitializing = false // Marcar inicialización como completa
    io.emit("authenticated", { message: "Autenticación exitosa" })
  })

  // Evento: Error de autenticación
  whatsappClient.on("auth_failure", (msg) => {
    console.error("❌ Error de autenticación:", msg)
    isInitializing = false // Resetear flag en caso de error
    io.emit("auth_failure", { error: msg })
  })

  // Evento: Cliente desconectado
  whatsappClient.on("disconnected", (reason) => {
    console.log("🔌 Cliente desconectado:", reason)
    isClientReady = false
    isInitializing = false // Resetear flag
    io.emit("logout", { reason: reason })
  })

  // Inicializar cliente inmediatamente
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

  // Enviar estado actual al cliente que se conecta
  socket.emit("client_status", {
    isReady: isClientReady,
    clientsCount: clients.length,
  })

  socket.on("disconnect", () => {
    console.log("🔌 Cliente frontend desconectado:", socket.id)
  })
})

// ENDPOINTS DE LA API

// POST /api/client - Agregar cliente al array en memoria
app.post(
  "/api/client",
  asyncHandler(async (req, res) => {
    const { name, phone, email } = req.body

    if (!name || !phone) {
      return res.status(400).json({
        success: false,
        error: "Nombre y teléfono son requeridos",
      })
    }

    // Verificar si el cliente ya existe
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

    // Emitir actualización a todos los clientes conectados
    io.emit("client_added", newClient)

    res.status(201).json({
      success: true,
      message: "Cliente agregado exitosamente",
      client: newClient,
    })
  }),
)

// GET /api/clients - Obtener lista de clientes
app.get(
  "/api/clients",
  asyncHandler(async (req, res) => {
    console.log("📋 Solicitando lista de clientes. Total:", clients.length)

    res.status(200).json({
      success: true,
      clients: clients,
      total: clients.length,
    })
  }),
)

// POST /api/send - Enviar mensaje por WhatsApp
app.post(
  "/api/send",
  asyncHandler(async (req, res) => {
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

    // Formatear número de teléfono (agregar @c.us si no lo tiene)
    let formattedPhone = phone.replace(/\D/g, "") // Remover caracteres no numéricos
    if (!formattedPhone.includes("@c.us")) {
      formattedPhone = formattedPhone + "@c.us"
    }

    console.log("📤 Enviando mensaje a:", phone)
    console.log("💬 Contenido:", message.substring(0, 50) + "...")

    const sendMessageWithTimeout = new Promise(async (resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error("Timeout: El mensaje tardó demasiado en enviarse"))
      }, 30000) // 30 segundos timeout

      try {
        const sentMessage = await whatsappClient.sendMessage(formattedPhone, message)
        clearTimeout(timeout)
        resolve(sentMessage)
      } catch (error) {
        clearTimeout(timeout)
        reject(error)
      }
    })

    const sentMessage = await sendMessageWithTimeout

    console.log("✅ ¡Mensaje enviado exitosamente!")

    // Emitir evento de mensaje enviado
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
  }),
)

// POST /api/logout - Cerrar sesión de WhatsApp
app.post(
  "/api/logout",
  asyncHandler(async (req, res) => {
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
    isInitializing = false // Resetear flag

    console.log("✅ Sesión cerrada exitosamente")

    // Emitir evento de logout
    io.emit("logout", { message: "Sesión cerrada por el usuario" })

    res.status(200).json({
      success: true,
      message: "Sesión cerrada exitosamente",
    })

    console.log("🔄 Reinicializando WhatsApp...")
    initializeWhatsAppClient()
  }),
)

// Endpoint de estado del servidor
app.get(
  "/api/status",
  asyncHandler(async (req, res) => {
    res.status(200).json({
      success: true,
      status: "Server running",
      whatsappReady: isClientReady,
      clientsCount: clients.length,
      timestamp: new Date().toISOString(),
    })
  }),
)

// Endpoint raíz
app.get(
  "/",
  asyncHandler(async (req, res) => {
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
  }),
)

process.on("uncaughtException", (error) => {
  console.error("❌ Error no capturado:", error.message)
  console.error("Stack:", error.stack)
  // No exit the process, just log the error
})

process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Promesa rechazada no manejada:", reason)
  console.error("En promesa:", promise)
  // No exit the process, just log the error
})

process.on("SIGTERM", async () => {
  console.log("🛑 Recibida señal SIGTERM, cerrando servidor gracefully...")

  if (whatsappClient) {
    try {
      await whatsappClient.destroy()
    } catch (error) {
      console.error("Error al cerrar WhatsApp client:", error)
    }
  }

  server.close(() => {
    console.log("✅ Servidor cerrado correctamente")
    process.exit(0)
  })
})

process.on("SIGINT", async () => {
  console.log("🛑 Recibida señal SIGINT, cerrando servidor gracefully...")

  if (whatsappClient) {
    try {
      await whatsappClient.destroy()
    } catch (error) {
      console.error("Error al cerrar WhatsApp client:", error)
    }
  }

  server.close(() => {
    console.log("✅ Servidor cerrado correctamente")
    process.exit(0)
  })
})

app.use(errorHandler)

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

// Exportar para testing (opcional)
module.exports = { app, server, io }
