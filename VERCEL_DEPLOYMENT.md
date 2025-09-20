# 🚀 Guía de Despliegue en Vercel

## Frontend - Despliegue en Vercel

### Paso 1: Preparar el Repositorio
1. Crea un nuevo repositorio en GitHub para el frontend
2. Sube todos los archivos del frontend al repositorio

### Paso 2: Conectar con Vercel
1. Ve a [vercel.com](https://vercel.com) e inicia sesión
2. Haz clic en "New Project"
3. Importa tu repositorio de GitHub
4. Vercel detectará automáticamente que es un proyecto Next.js

### Paso 3: Configurar Variables de Entorno
En la configuración del proyecto en Vercel, agrega estas variables:

\`\`\`
NEXT_PUBLIC_BACKEND_URL=https://back-wsp.onrender.com
NEXT_PUBLIC_SOCKET_URL=https://back-wsp.onrender.com
\`\`\`

### Paso 4: Desplegar
1. Haz clic en "Deploy"
2. Vercel construirá y desplegará tu aplicación automáticamente
3. Obtendrás una URL como: `https://tu-app.vercel.app`

### Paso 5: Actualizar CORS en el Backend
Una vez que tengas la URL de Vercel, actualiza el backend en Render para permitir tu dominio de Vercel en la configuración de CORS.

## ✅ Verificación Final

1. **Frontend funcionando**: Tu app debe cargar en la URL de Vercel
2. **Conexión al backend**: Debe conectarse a tu backend en Render
3. **Socket.IO funcionando**: El QR debe generarse correctamente
4. **API calls funcionando**: Todas las funciones deben trabajar normalmente

## 🔧 Solución de Problemas

### Error de CORS
Si ves errores de CORS, asegúrate de que:
- Las variables de entorno estén configuradas correctamente
- El backend en Render permita tu dominio de Vercel

### Error de Socket.IO
Si el Socket.IO no conecta:
- Verifica que `NEXT_PUBLIC_SOCKET_URL` esté configurado
- Revisa los logs del backend en Render

### Error de Build
Si el build falla:
- Revisa que todas las dependencias estén en package.json
- Verifica que no haya errores de TypeScript

## 📱 Resultado Final

Tu aplicación estará disponible en:
- **Frontend**: `https://tu-app.vercel.app`
- **Backend**: `https://back-wsp.onrender.com`

¡Listo para usar en producción! 🎉
