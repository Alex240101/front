# 🚀 Guía de Despliegue - WhatsApp Reminder System

## 📋 Preparación

### 1. Estructura de Archivos
\`\`\`
proyecto/
├── backend/          # Para Render
│   ├── index.js
│   ├── package.json
│   └── render.yaml
├── frontend/         # Para Vercel
│   ├── app/
│   ├── components/
│   ├── package.json
│   ├── next.config.mjs
│   └── .env.local
└── DEPLOYMENT_GUIDE.md
\`\`\`

## 🔧 Despliegue del Backend en Render

### Paso 1: Preparar Repositorio
1. Crea un nuevo repositorio en GitHub solo para el backend
2. Sube la carpeta `backend/` como raíz del repositorio

### Paso 2: Configurar Render
1. Ve a [render.com](https://render.com) y crea una cuenta
2. Conecta tu cuenta de GitHub
3. Clic en "New +" → "Web Service"
4. Selecciona tu repositorio del backend
5. Configuración:
   - **Name**: `whatsapp-reminder-backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: `Starter` (gratis)

### Paso 3: Variables de Entorno en Render
\`\`\`
NODE_ENV=production
PORT=10000
\`\`\`

### Paso 4: Desplegar
1. Clic en "Create Web Service"
2. Espera a que termine el despliegue (5-10 minutos)
3. Copia la URL generada (ej: `https://tu-app.onrender.com`)

## 🌐 Despliegue del Frontend en Vercel

### Paso 1: Preparar Repositorio
1. Crea un nuevo repositorio en GitHub solo para el frontend
2. Sube la carpeta `frontend/` como raíz del repositorio

### Paso 2: Configurar Variables de Entorno
Crea archivo `.env.local` en el frontend:
\`\`\`
NEXT_PUBLIC_BACKEND_URL=https://tu-backend.onrender.com
NEXT_PUBLIC_SOCKET_URL=https://tu-backend.onrender.com
\`\`\`

### Paso 3: Configurar Vercel
1. Ve a [vercel.com](https://vercel.com) y crea una cuenta
2. Conecta tu cuenta de GitHub
3. Clic en "New Project"
4. Selecciona tu repositorio del frontend
5. Configuración:
   - **Framework Preset**: `Next.js`
   - **Root Directory**: `./` (raíz)
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

### Paso 4: Variables de Entorno en Vercel
En el dashboard de Vercel → Settings → Environment Variables:
\`\`\`
NEXT_PUBLIC_BACKEND_URL = https://tu-backend.onrender.com
NEXT_PUBLIC_SOCKET_URL = https://tu-backend.onrender.com
\`\`\`

### Paso 5: Desplegar
1. Clic en "Deploy"
2. Espera a que termine el despliegue (2-5 minutos)
3. Tu app estará disponible en `https://tu-app.vercel.app`

## ✅ Verificación

### Backend (Render)
- Visita `https://tu-backend.onrender.com`
- Deberías ver el mensaje de API funcionando
- Verifica `https://tu-backend.onrender.com/health`

### Frontend (Vercel)
- Visita `https://tu-frontend.vercel.app`
- Deberías ver la pantalla de carga
- Verifica que se conecte al backend

## 🔧 Configuración Post-Despliegue

### 1. Actualizar CORS en Backend
El backend ya está configurado para aceptar tu dominio de Vercel.

### 2. Configurar Dominio Personalizado (Opcional)
- En Vercel: Settings → Domains
- En Render: Settings → Custom Domains

## 🚨 Solución de Problemas

### Backend no inicia
- Verifica logs en Render Dashboard
- Asegúrate que `package.json` tenga `"start": "node index.js"`

### Frontend no conecta al backend
- Verifica variables de entorno en Vercel
- Asegúrate que la URL del backend sea correcta
- Revisa la consola del navegador para errores CORS

### WhatsApp no se conecta
- Render puede tardar en "despertar" (plan gratuito)
- Verifica logs del backend para errores de Puppeteer

## 📱 Uso en Producción

1. **Primera vez**: Visita tu frontend, escanea el QR con WhatsApp
2. **Clientes**: Agrega clientes desde la interfaz
3. **Mensajes**: Envía recordatorios desde la página de mensajes
4. **Configuración**: Ajusta delays y configuraciones

## 💡 Consejos

- **Render gratuito**: Se "duerme" después de 15 min de inactividad
- **Vercel gratuito**: Límite de 100GB de ancho de banda/mes
- **WhatsApp**: Mantén la sesión activa para evitar re-escanear QR
- **Backup**: Considera usar una base de datos real para producción

## 🔄 Actualizaciones

Para actualizar:
1. **Backend**: Push a GitHub → Render redespliega automáticamente
2. **Frontend**: Push a GitHub → Vercel redespliega automáticamente
