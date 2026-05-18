# Errores Pendientes de Corregir

## Pendientes - Críticos

### 19. Credenciales en servidor de producción
- **Problema**: Cuando despliegues a producción (Render), necesitas configurar las variables de entorno de BD
- **Acción**: Configurar DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD en el panel de Render

### 20. CSP con 'unsafe-inline' en scripts
- **Archivo**: `server/app.js:27`
- **Problema**: CSP permite scripts inline, menor seguridad
- **Solución**: Mover scripts inline a archivos externos o usar nonce

---

## Pendientes - Moderados

### 21. Imágenes del menú sin formato optimizado
- **Problema**: Solo JPEG, sin WebP/AVIF para mejor rendimiento
- **Solución**: Convertir imágenes de platos a WebP o usar servicio cloud (Cloudinary, Uploadcare)

---

## Pendientes - Despliegue

### Checklist de Seguridad para Producción

| Paso | Acción | Estado |
|------|--------|--------|
| S3 | Configurar `NODE_ENV=production` en servidor | ⏳ PENDIENTE |
| S6 | Habilitar CORS solo para dominio de producción | ⏳ PENDIENTE |
| S7 | Configurar logging de producción (Sentry o similar) | ⏳ PENDIENTE |
| S8 | Implementar rate limiting por IP | ⏳ PENDIENTE |

### Checklist de Rendimiento para Producción

| Paso | Acción | Estado |
|------|--------|--------|
| R2 | Optimizar imágenes del menú (WebP) | ⏳ PENDIENTE |
| R3 | Configurar caching de CDN en Vercel | ⏳ PENDIENTE |
| R4 | Habilitar compression avanzada (brotli) | ⏳ PENDIENTE |

### Preparación para subir a GitHub

| Paso | Acción | Estado |
|------|--------|--------|
| 1 | Crear `.gitignore` en `server/` que excluya `.env` | ✅ Listo |
| 2 | Subir código a GitHub (sin incluir `.env`) | ⏳ PENDIENTE |
| 3 | Crear cuenta en [render.com](https://render.com) con GitHub | ⏳ PENDIENTE |
| 4 | Desplegar PostgreSQL en Render (Free tier) | ⏳ PENDIENTE |
| 5 | Configurar variables de entorno en Render | ⏳ PENDIENTE |
| 6 | Desplegar Backend (Web Service) en Render | ⏳ PENDIENTE |
| 7 | Crear cuenta en [vercel.com](https://vercel.com) con GitHub | ⏳ PENDIENTE |
| 8 | Desplegar Frontend en Vercel | ⏳ PENDIENTE |
| 9 | Actualizar `VITE_API_URL` en frontend | ⏳ PENDIENTE |

### Variables de entorno para Render (Backend)

```
DB_HOST=...
DB_PORT=5432
DB_NAME=...
DB_USER=...
DB_PASSWORD=...
JWT_SECRET=una-clave-segura-generada
CLIENT_URL=https://tu-proyecto.vercel.app
PORT=3000
NODE_ENV=production
```

### Variables de entorno para Vercel (Frontend)

```
VITE_API_URL=https://tu-backend.onrender.com/api
```

---

## ✅ Todo Corregido

| # | Descripción | Estado |
|---|---|---|
| 3 | Tema carbon/crema invertidos en `index.css` | ✅ Corregido |
| 4 | Migración a TypeScript | ✅ Migrado |
| 5 | `dist/` en `.gitignore` | ✅ Verificado |
| 6 | `lang="en"` → `lang="es"` | ✅ Corregido |
| 7 | CLIENT_URL en `.env` para CORS | ✅ Corregido |
| 9 | Paginación en tablas de Admin | ✅ Corregido |
| — | Botón "Marcar preparado" + estado "preparado" | ✅ Añadido |
| 10 | AuthContext migrado de fetch() a axios | ✅ Corregido |
| 11 | Directorios vacíos eliminados | ✅ Eliminado |
| 1 | Auth migrado a PostgreSQL | ✅ Corregido |
| 8 | JWT 7 días → 15min con refresh token | ✅ Corregido |
| 13 | LoginModal usa AuthContext.register() | ✅ Corregido |
| 15 | Validación whitelist estados de pedido | ✅ Corregido |
| 16 | JWT_SECRET clave de 32 caracteres | ✅ Corregido |
| 17 | Sanitización inputs (XSS) | ✅ Corregido |
| 18 | Interceptor con refresh token automático | ✅ Corregido |
| 12 | Scroll-video funcional (40 imágenes) | ✅ Corregido |
| 14 | Credenciales BD en variables de entorno | ✅ Corregido |
| 22 | Archivos web antigua eliminados | ✅ Eliminado |
| 23 | Documentos desactualizados eliminados | ✅ Eliminado |
| 24 | Recursos sin usar eliminados | ✅ Eliminado |