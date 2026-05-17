# Errores Pendientes de Corregir

## Críticos

### 14. Credenciales hardcodeadas en BD
- **Archivo**: `server/config/db.js`
- **Problema**: Credenciales PostgreSQL hardcodeadas en código (host, port, user, password)
- **Solución**: Usar solo variables de entorno de process.env

### 15. Validación insuficiente de estados de pedido
- **Archivo**: `server/controllers/pedidoController.js:76`
- **Problema**: Campo `estado` acepta cualquier valor sin validación (inyección SQL posible)
- **Solución**: Whitelist de estados válidos: pendiente, confirmado, preparando, preparado, entregado, cancelado

### 1. Auth en memoria en el servidor
- **Archivo**: `server/controllers/authController.js`
- **Problema**: Los usuarios se almacenan en un array JS en memoria en vez de en PostgreSQL. Los registros se pierden al reiniciar el servidor.
- **Solución**: Migrar el `authController` para usar la tabla `usuarios` de PostgreSQL.

### 2. Sistema de reservas vs pedidos unificado
- **Problema**: Existían dos sistemas (reservas y pedidos). Ahora solo hay pedidos con fecha de recogida.
- **Solución**: ✅ Implementado - Pedidos con selección de fecha de recogida configurable por admin

### 16. JWT_SECRET débil para producción
- **Archivo**: `server/.env`
- **Problema**: `your-super-secret-jwt-key-change-in-production` es muy débil
- **Solución**: Generar clave de al menos 32 caracteres aleatorios con: `node -e "console.log(crypto.randomBytes(32).toString('hex'))"`

### 17. Sanitización de inputs缺失 (XSS)
- **Problema**: Solo se valida pero no se sanitiza entrada de usuario
- **Solución**: Usar `express-validator` con sanitización en todas las rutas

### 18. Token en localStorage vulnerable a XSS
- **Archivo**: `client/src/context/AuthContext.tsx`
- **Problema**: Token JWT almacenado en localStorage (accesible via XSS)
- **Solución**: Considerar usar httpOnly cookies en producción, o implementar sanitización en cliente

---

## Moderados

### 19. Optimizar imágenes de animación (Fotogramas)
- **Ubicación**: `client/public/Fotogramas/` (119 imágenes JPEG ~30-50MB)
- **Problema**: Las imágenes son necesarias para ScrollVideo pero pesan demasiado y ralentizan el build
- **Solución**: Convertir de JPEG a WebP (ahorra 40-70% sin pérdida de calidad)
  1. Convertir `frame_001.jpg` a `frame_001.webp` (calidad 80-85%)
  2. Actualizar `Home.tsx` líneas 27 y 77 para usar `.webp` en vez de `.jpg`

### 20. Imágenes del menú sin formato optimizado
- **Problema**: Solo JPEG, sin WebP/AVIF para mejor rendimiento
- **Solución**: Convertir imágenes de platos a WebP o usar servicio cloud (Cloudinary, Uploadcare)

### 21. CSP con 'unsafe-inline' en scripts
- **Archivo**: `server/app.js:27`
- **Problema**: CSP permite scripts inline, menor seguridad
- **Solución**: Mover scripts inline a archivos externos o usar nonce

### 8. JWT con 7 días de expiración
- **Archivo**: `server/controllers/authController.js`
- **Problema**: `expiresIn: '7d'` es muy largo. El plan de migración recomienda 15 minutos con refresh token.
- **Solución**: Reducir expiración e implementar refresh tokens.

---

## Menores

### 12. Sin scroll-video funcional en React
- **Archivo**: `client/src/pages/Home.tsx` (ScrollVideo)
- **Problema**: El scroll-video requiere los fotogramas en `public/Fotogramas/`. Si no existen, la sección se queda en negro con spinner infinito.

### 13. LoginModal en Home.tsx no usa register de AuthContext
- **Archivo**: `client/src/pages/Home.tsx` (LoginModal)
- **Problema**: El modal de registro en la Home tiene un `handleRegister` que no llama a la API, solo simula éxito.
- **Solución**: Conectarlo con `AuthContext.register()` o eliminarlo (ya existe página Register).

---

## Archivos Legacy a Eliminar

### 22. Archivos de la web antigua (raíz del proyecto)
- **Ubicación**: raíz - `index.html`, `login.html`, `css/`, `js/`, `data/`
- **Problema**: Código legacy sin usar que confunde y ocupa espacio
- **Acción**: Eliminar estas carpetas y archivos

### 23. Archivos de documentación desactualizados
- **Ubicación**: `docs/SPEC.md`, `docs/mejoras.md`, `docs/FUTURE_ROADMAP.md`
- **Problema**: Documentación desactualizada
- **Acción**: Eliminar o actualizar

### 24. Recursos sin usar
- **Ubicación**: `Recursos/`
- **Acción**: Verificar si se usa, si no eliminar

---

## Despliegue a Producción

### Checklist de Seguridad para Producción

| Paso | Acción | Estado |
|------|--------|--------|
| S1 | Cambiar `JWT_SECRET` por clave de 32+ caracteres aleatorios | ⏳ PENDIENTE |
| S2 | Mover credenciales BD a variables de entorno (no hardcoded) | ⏳ PENDIENTE |
| S3 | Configurar `NODE_ENV=production` en servidor | ⏳ PENDIENTE |
| S4 | Implementar sanitización de inputs (express-validator) | ⏳ PENDIENTE |
| S5 | Validar estados de pedido con whitelist | ⏳ PENDIENTE |
| S6 | Habilitar CORS solo para dominio de producción | ⏳ PENDIENTE |
| S7 | Configurar logging de producción (Sentry o similar) | ⏳ PENDIENTE |
| S8 | Implementar rate limiting por IP | ⏳ PENDIENTE |

### Checklist de Rendimiento para Producción

| Paso | Acción | Estado |
|------|--------|--------|
| R1 | Convertir imágenes Fotogramas de JPEG a WebP | ⏳ PENDIENTE |
| R2 | Optimizar imágenes del menú (WebP) | ⏳ PENDIENTE |
| R3 | Configurar caching de CDN en Vercel | ⏳ PENDIENTE |
| R4 | Habilitar compression avanzada (brotli) | ⏳ PENDIENTE |

### Preparación para subir a GitHub

| Paso | Acción | Estado |
|------|--------|--------|
| 1 | Crear `.gitignore` en `server/` que excluya `.env` | ⚠️ PENDIENTE |
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
DATABASE_URL=postgresql://... (de Render)
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

## ✅ Corregidos en esta sesión

| # | Descripción | Estado |
|---|---|---|
| 3 | Tema carbon/crema invertidos en `index.css` | ✅ Corregido |
| 4 | Migración a TypeScript (tsconfig, archivos .tsx/.ts, tipos) | ✅ Migrado |
| 5 | `dist/` en `.gitignore` — no trackeado | ✅ Verificado |
| 6 | `lang="en"` → `lang="es"` + title en `index.html` | ✅ Corregido |
| 7 | Variable `CLIENT_URL` añadida a `.env` para CORS | ✅ Corregido |
| 9 | Paginación en tablas de Admin (pedidos, reservas, platos) | ✅ Corregido |
| — | Botón "Marcar preparado" + estado "preparado" en pedidos | ✅ Añadido |
| 10 | AuthContext migrado de `fetch()` a `authApi` (axios) | ✅ Corregido |
| 11 | Directorios vacíos `hooks/` y `utils/` eliminados | ✅ Eliminado |
