const express = require("express");
const { Server } = require("socket.io");
const { Client, LocalAuth } = require("whatsapp-web.js");
const http = require("http");
const cors = require("cors");
const QRCode = require("qrcode");

// ===============================
// CONFIGURACIÓN DEL SERVIDOR
// ===============================
console.log("🚀 Iniciando servidor WhatsApp Reminder System...");

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;

// ===============================
// MIDDLEWARES CORS FLEXIBLE
// ===============================
const allowedOrigins = [
  "http://localhost:3001",
  "http://127.0.0.1:3001",
  "https://front-git-main-cesar10-52-hotmailcoms-projects.vercel.app",
];

function checkOrigin(origin) {
  if (!origin) return true; // Permite Postman u otras herramientas
  if (allowedOrigins.includes(origin)) return true;
  // Permite cualquier subdominio de preview de tu proyecto en Vercel
  const vercelPattern = /^https:\/\/front-.*-cesar10-52-hotmailcoms-projects\.vercel\.app$/;
  return vercelPattern.test(origin);
}

app.use(
  cors({
    origin: (origin, callback) => {
      if (checkOrigin(origin)) return callback(null, true);
      console.log("❌ CORS rechazado:", origin);
      callback(new Error("CORS no permitido"));
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

app.use(express.json());

// ===============================
// SOCKET.IO CONFIG
// ===============================
const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (checkOrigin(origin)) return callback(null, true);
      console.log("❌ Socket.IO CORS rechazado:", origin);
      callback(new Error("CORS no permitido"));
    },
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// ===============================
// VARIABLES GLOBALES
// ===============================
let whatsappClient = null;
let isClientReady = false;
let isInitializing = false;
const clients = [];

// ===============================
// FUNCIONES
// ===============================
function initializeWhatsAppClient() {
  if (isInitializing || whatsappClient) return;

  isInitializing = true;
  console.log("📱 Inicializando cliente de WhatsApp...");

  whatsappClient = new Client({
    authStrategy: new LocalAuth({ clientId: "whatsapp-reminder-system" }),
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
  });

  whatsappClient.on("qr", async (qr) => {
    try {
      const qrImageUrl = await QRCode.toDataURL(qr, {
        width: 200,
        margin: 0,
        color: { dark: "#000000", light: "#FFFFFF" },
        errorCorrectionLevel: "L",
      });
      io.emit("qr", qrImageUrl);
      console.log("✅ QR enviado al frontend");
    } catch (error) {
      console.error("❌ Error generando imagen QR:", error);
    }
  });

  whatsappClient.on("ready", () => {
    console.log("✅ ¡Cliente de WhatsApp conectado y listo!");
    isClientReady = true;
    isInitializing = false;
    io.emit("ready", { message: "WhatsApp conectado exitosamente" });
  });

  whatsappClient.on("authenticated", () => {
    console.log("🔐 Cliente autenticado correctamente");
    isInitializing = false;
    io.emit("authenticated", { message: "Autenticación exitosa" });
  });

  whatsappClient.on("auth_failure", (msg) => {
    console.error("❌ Error de autenticación:", msg);
    isInitializing = false;
    io.emit("auth_failure", { error: msg });
  });

  whatsappClient.on("disconnected", (reason) => {
    console.log("🔌 Cliente desconectado:", reason);
    isClientReady = false;
    isInitializing = false;
    whatsappClient = null;
    io.emit("logout", { reason });
    setTimeout(() => initializeWhatsAppClient(), 3000);
  });

  whatsappClient.initialize();
}

// ===============================
// SOCKET.IO CONNECTION
// ===============================
io.on("connection", (socket) => {
  console.log("🔗 Cliente frontend conectado:", socket.id);

  if (!whatsappClient && !isInitializing) {
    console.log("🔄 Inicializando WhatsApp para nuevo cliente...");
    initializeWhatsAppClient();
  }

  socket.emit("client_status", {
    isReady: isClientReady,
    clientsCount: clients.length,
  });

  socket.on("disconnect", () => {
    console.log("🔌 Cliente frontend desconectado:", socket.id);
  });
});

// ===============================
// ENDPOINTS API
// ===============================
app.post("/api/client", (req, res) => {
  const { name, phone, email } = req.body;
  if (!name || !phone)
    return res.status(400).json({ success: false, error: "Nombre y teléfono son requeridos" });

  const existingClient = clients.find((c) => c.phone === phone);
  if (existingClient)
    return res.status(409).json({ success: false, error: "Cliente ya existe con este número" });

  const newClient = {
    id: Date.now().toString(),
    name,
    phone,
    email: email || null,
    createdAt: new Date().toISOString(),
  };
  clients.push(newClient);
  io.emit("client_added", newClient);
  console.log("👤 Cliente agregado:", name, "-", phone);

  res.status(201).json({ success: true, message: "Cliente agregado exitosamente", client: newClient });
});

app.get("/api/clients", (req, res) => {
  res.status(200).json({ success: true, clients, total: clients.length });
});

app.post("/api/send", async (req, res) => {
  const { phone, message } = req.body;
  if (!phone || !message)
    return res.status(400).json({ success: false, error: "Teléfono y mensaje son requeridos" });

  if (!isClientReady || !whatsappClient)
    return res.status(503).json({ success: false, error: "Cliente de WhatsApp no está conectado" });

  let formattedPhone = phone.replace(/\D/g, "");
  if (!formattedPhone.endsWith("@c.us")) formattedPhone += "@c.us";

  try {
    const sentMessage = await whatsappClient.sendMessage(formattedPhone, message);
    io.emit("message_sent", { phone, message, timestamp: new Date().toISOString() });
    res.status(200).json({
      success: true,
      message: "Mensaje enviado exitosamente",
      messageId: sentMessage.id._serialized,
    });
  } catch (error) {
    console.error("❌ Error al enviar mensaje:", error);
    res.status(500).json({ success: false, error: "Error al enviar mensaje: " + error.message });
  }
});

app.post("/api/logout", async (req, res) => {
  try {
    if (!whatsappClient) return res.status(400).json({ success: false, error: "No hay sesión activa" });

    await whatsappClient.logout();
    await whatsappClient.destroy();
    whatsappClient = null;
    isClientReady = false;
    isInitializing = false;

    io.emit("logout", { message: "Sesión cerrada por el usuario" });
    res.status(200).json({ success: true, message: "Sesión cerrada exitosamente" });

    setTimeout(() => initializeWhatsAppClient(), 3000);
  } catch (error) {
    console.error("❌ Error al cerrar sesión:", error);
    whatsappClient = null;
    isClientReady = false;
    isInitializing = false;
    res.status(500).json({ success: false, error: "Error al cerrar sesión: " + error.message });
    setTimeout(() => initializeWhatsAppClient(), 3000);
  }
});

app.get("/api/status", (req, res) => {
  res.status(200).json({
    success: true,
    status: "Server running",
    whatsappReady: isClientReady,
    clientsCount: clients.length,
    timestamp: new Date().toISOString(),
  });
});

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
  });
});

app.get("/health", (req, res) => {
  res.status(200).json({ status: "healthy", timestamp: new Date().toISOString(), uptime: process.uptime() });
});

// ===============================
// ERRORES GLOBALES
// ===============================
process.on("uncaughtException", (error) => console.error("❌ Error no capturado:", error));
process.on("unhandledRejection", (reason) => console.error("❌ Promesa rechazada no manejada:", reason));

// ===============================
// INICIAR SERVIDOR
// ===============================
server.listen(PORT, () => {
  console.log("=".repeat(50));
  console.log("🚀 SERVIDOR WHATSAPP REMINDER INICIADO");
  console.log("📡 Puerto:", PORT);
  console.log("🌐 API: http://localhost:" + PORT);
  console.log("🔌 Socket.IO: Habilitado");
  console.log("📱 WhatsApp: Inicializando...");
  console.log("=".repeat(50));
});

module.exports = { app, server, io };
