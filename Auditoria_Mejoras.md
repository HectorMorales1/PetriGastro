# Auditoría y Propuesta de Mejoras — PetriGastro

> Fecha: 26/05/2026
> Alcance: Full-stack (Node.js/Express + React/TypeScript + PostgreSQL)

---

## 🔴 Seguridad Crítica

| # | Problema | Impacto | Solución |
|---|----------|---------|----------|
| 1 | **El precio del pedido se calcula desde el cliente** (`server/controllers/pedidoController.ts:24`) — el frontend envía `{ id, cantidad, precio }` y el servidor suma `item.precio * item.cantidad` sin verificar contra la BD | Un usuario malicioso puede pedir platos a precio 0 € | El servidor debe consultar `platos.precio` real para cada `item.id` al crear el pedido |
| 2 | **Al rechazar un usuario se borra físicamente** (`DELETE FROM usuarios`) — sin soft-delete ni registro de auditoría | Pérdida irreversible de datos; no hay trazabilidad | Añadir columna `deleted_at` y usar soft-delete, o al menos mantener un log de auditoría |
| 3 | **`POST /api/reservas` sin rate limit ni autenticación** — cualquier bot puede saturar el sistema | Vulnerable a spam y DoS | Aplicar rate limit específico y validación CAPTCHA opcional |
| 4 | **`.env` con claves reales (JWT secret, Cloudinary, DB password)** — aunque está en `.gitignore`, en algún momento pudo comitearse | Exposición de credenciales si el repositorio se hace público | Rotar todas las claves y verificar el historial de git |

---

## 🟠 Arquitectura y Backend

| # | Problema | Solución |
|---|----------|----------|
| 5 | **Express 5 en beta** (`express@5.2.1`) — puede tener breaking changes imprevistos | Monitorizar el release estable o considerar volver a Express 4 si aparecen problemas de estabilidad |
| 6 | **`authMiddleware` no se encadena antes de `adminMiddleware`** en rutas de categorías (`routes/categorias.ts`) y configuración (`routes/config.ts`) | Añadir `authMiddleware` explícitamente antes de `adminMiddleware` |
| 7 | **No hay endpoint para invalidar refresh tokens** — la columna `token_version` existe pero no hay forma de incrementarla (por ejemplo al cambiar contraseña o cerrar sesión) | Crear endpoint `POST /api/auth/invalidate-sessions` que incremente `token_version` del usuario |
| 8 | **Migración 002 redundante** — `token_version` ya existe en `001_initial.sql` | Eliminar migración 002 o unificarla en la inicial |
| 9 | **Sin transacción por fichero de migración** — si un SQL tiene múltiples statements y falla uno, no hay rollback | Envolver cada migración en `BEGIN...COMMIT` |
| 10 | **`as any` en helmet** (`app.ts:47`) — se fuerza a `any` para evitar conflictos de tipos con Express 5 | Actualizar o parchear tipos de helmet, o usar `@types/helmet` |
| 11 | **Logger duplicado** — se usa `morgan` + `pino`. Morgan formatea para humanos y pino para JSON | Unificar usando solo `pino-http` para ambos propósitos |
| 12 | **Falta validación con `express-validator`** en rutas POST/PUT de categorías, platos y configuración | Añadir validación de tipos y rangos en todas las rutas de escritura |
| 13 | **No hay sanitización de entrada** en campos de texto (XSS mitigado por React pero no por API directa) | Usar `express-validator` con `trim()` y `escape()` |

---

## 🟡 Frontend — Rendimiento

| # | Problema | Solución |
|---|----------|----------|
| 14 | **`toggleField` en `Admin.tsx` envía el plato entero** — `updateMutation.mutate({ id, data: { ...plato, [field]: !plato[field] } })` envía todos los campos del objeto | Enviar solo `{ [field]: !valorActual }` en lugar de todo el objeto |
| 15 | **Cart persiste objetos `Plato` completos** en localStorage (descripción, imagen_url, precio, etc.) | Guardar solo `{ id, nombre, precio, cantidad, categoria_id }` |
| 16 | **`ScrollVideo.tsx`: `setInterval` nunca se limpia** después de que las imágenes carguen, sigue ejecutándose sin hacer nada útil | Limpiar el intervalo con `clearInterval` cuando `loaded = true` |
| 17 | **No hay `LoadingSpinner` como componente reutilizable** — está definido inline en `App.tsx` | Extraer a `components/LoadingSpinner.tsx` y reutilizar |
| 18 | **`chunkSizeWarningLimit: 1000`** en `vite.config.ts` — chunks de hasta 1000 KB, demasiado grandes | Reducir a ~250-300 KB; ya hay lazy-loading por ruta, pero se puede dividir Admin en chunks más pequeños |
| 19 | **Polling de pedidos cada 10s** — puede ser excesivo si no hay cambios frecuentes | Aumentar a 30-60s o implementar Server-Sent Events (SSE) / WebSockets para actualizaciones en tiempo real |

---

## 🟡 Frontend — UX/UI (incluye bugs reportados)

| # | Problema | Solución |
|---|----------|----------|
| 20 | **Pantalla en negro en Admin → Usuarios** (reportado en `Mejoras.md`) | Depurar el renderizado de `UsuariosManager` — posible error en datos o estado no manejado. Revisar si falla al obtener usuarios sin datos |
| 21 | **Contraste de colores deficiente en modo claro** (reportado) | Revisar combinaciones texto/fondo con herramientas WCAG AA. Asegurar ratio de contraste ≥ 4.5:1 |
| 22 | **Enlaces no scrolean al inicio de página** (reportado) — `ScrollToTop` no funciona correctamente en todas las rutas | Verificar que `ScrollToTop.tsx` se ejecute en cada cambio de `pathname` y no interfiera con `scrollRestoration` del navegador |
| 23 | **Nav móvil sin fondo en secciones** (reportado) | Añadir `background-color` con opacidad al menú desplegable para que el texto sea legible sobre cualquier contenido |
| 24 | **Ruta `/reservas` existe pero no está enlazada en el Router** — la página `Reservas.tsx` es inaccesible | Añadir ruta en `App.tsx` y enlace en el Header/Nav, decidiendo si requiere autenticación |
| 25 | **Icono "X" en botón "Editar horarios"** del Admin (`Admin.tsx:710`) — debería ser un lápiz | Cambiar a `<Pencil size={18} />` |
| 26 | **`getEstadoColor` duplicado** en `MisPedidos.tsx` y `Admin.tsx` | Extraer a un helper compartido en `utils/estadoPedido.ts` |
| 27 | **Sin Error Boundary** — si un chunk lazy falla al cargar, el usuario ve pantalla en blanco | Añadir un `ErrorBoundary` en `App.tsx` envolviendo las rutas con Suspense |
| 28 | **Email duplicado** — La BD ya tiene UNIQUE, pero verificar que el mensaje de error se muestre correctamente al usuario | Asegurar que el frontend capture y muestre el error 409 del backend |
| 29 | **LoginModal en `Home.tsx` sin tipos** — usa `any` en parámetros | Añadir interfaz `LoginModalProps` con `isOpen`, `onClose`, `onLoginSuccess` |

---

## 🔵 Backend — Mejores Prácticas

| # | Problema | Solución |
|---|----------|----------|
| 30 | **`pool.connect()` manual** en `pedidoController.create` — correcto pero propenso a fugas si se modifica y se salta el `finally` | Considerar `pool.transaction()` helper o mantener patrón actual con tests que verifiquen liberación |
| 31 | **Variables de entorno no validadas al arrancar** — si falta `DATABASE_URL` o `JWT_SECRET`, falla más tarde | Usar `envalid` o validación explícita en `server.ts` que detenga el proceso si falta algo crítico |
| 32 | **Mezcla de estilos de exportación** — `export =` (CommonJS) y `export {}` (ESM) en distintos archivos | Unificar a un solo estilo (`export default` o `export =`) para consistencia |
| 33 | **Hardcoded folder en Cloudinary upload** — `folder: 'petrigastro/platos'` | Mover a variable de entorno con fallback |
| 34 | **Error handler genérico** — Multer errors devuelven el mensaje interno al cliente | Mapear errores de Multer a mensajes seguros y amigables |

---

## 🟢 DevOps y Repositorio

| # | Problema | Solución |
|---|----------|----------|
| 35 | **Sin CI/CD pipeline** — no se ejecutan tests automáticos en cada PR | Añadir GitHub Actions con lint + typecheck + test + build |
| 36 | **`uploads/` en el repositorio** — directorio vacío que no debería versionarse | Añadir `uploads/` al `.gitignore` y crear `.gitkeep` si es necesario |
| 37 | **`node_modules/` en root** — el `package.json` raíz solo tiene `concurrently` | Evaluar si se necesita o se puede eliminar la dependencia raíz, usando `concurrently` desde server/client |
| 38 | **Sin health check endpoint completo** — `GET /` solo devuelve JSON básico | Añadir estado de conexión a PostgreSQL, versión y uptime |

---

## 📊 Priorización Recomendada

| Prioridad | Tickets |
|-----------|---------|
| **S1 — Inmediata** | 1 (precio servidor), 2 (soft-delete), 3 (rate limit reservas), 20 (pantalla negra admin) |
| **S2 — Alta** | 6 (authMiddleware), 7 (invalidar tokens), 14 (toggleField optimización), 24 (ruta reservas), 22 (scroll), 21 (contraste), 23 (nav móvil), 27 (Error Boundary) |
| **S3 — Media** | 8-13 (backend), 15-19 (frontend rendimiento), 25-26, 28-29 (UX menor), 30-34 (mejores prácticas) |
| **S4 — Baja** | 35-38 (DevOps) |

---

## 📝 Notas Adicionales

- **PWA ya implementado** con `vite-plugin-pwa` y Workbox — buen trabajo, mantener y testear en producción.
- **SEO** bien manejado con `react-helmet-async` y JSON-LD.
- **Testing** configurado con Vitest + Testing Library (frontend) y Vitest + Supertest (backend) — excelente base.
- **Accesibilidad** decente con ARIA roles, skip link y `prefers-reduced-motion` — seguir mejorando.
