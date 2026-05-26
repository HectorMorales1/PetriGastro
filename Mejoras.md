# MEJORAS — PetriGastro

> Documento único consolidado (26/05/2026)
> Fuentes: `Mejoras.md`, `Auditoria_Mejoras.md`, `.opencode/plans/mejoras-implementation.md`, `PLAN_MEJORAS.md`

---

## ✅ CAMBIOS APLICADOS (20 completados)

### 🔒 S1 — Seguridad y Bugs Críticos

| # | Descripción | Archivos afectados |
|---|-------------|-------------------|
| ✅ | **Validación de env vars**: Se agregaron `CLOUDINARY_API_SECRET`, `CLOUDINARY_API_KEY`, `CLOUDINARY_CLOUD_NAME` a la validación obligatoria en el arranque | `server/server.ts:9` |
| ✅ | **Precio verificado desde BD**: El servidor ya consulta `platos.precio` real y no confía en el precio enviado por el frontend | `server/controllers/pedidoController.ts:25-35` |
| ✅ | **SSL de BD**: `rejectUnauthorized: false` → `true` con `DB_CA_CERT` configurable por entorno | `server/config/db.ts:11,18` |
| ✅ | **Pantalla negra Admin Usuarios**: Extraído `UsuariosManager` con manejo de error + loading + empty state | `client/src/components/admin/UsuariosManager.tsx` |
| ✅ | **Validación express-validator agregada** en rutas que faltaban (feedback, fechas, usuarios) | `server/routes/feedback.ts`, `fechas.ts`, `usuarios.ts` |
| ✅ | **Rate limit en rutas POST/PUT/DELETE**: 50 req/15min en feedback, usuarios, fechas y upload | `server/app.ts:85-98` |
| ✅ | **Multer error mapping seguro**: Errores mapeados a mensajes amigables en español | `server/routes/upload.ts:27-32` |
| ✅ | **Switches desactivados más visibles**: `bg-gray-300` → `bg-gray-400` en modo claro | `client/src/components/admin/PlatosManager.tsx` |
| ✅ | **Campo `ingredientes`**: Migración 004 + tipo TypeScript + formulario Admin + modal de detalle | `server/migrations/004_ingredientes.sql`, `types.ts`, `PlatosManager.tsx`, `DishModal.tsx` |
| ✅ | **Info platos en MisPedidos**: Query SQL mejorada + UI con nombre, cantidad, precio e imagen | `server/controllers/feedbackController.ts`, `client/src/pages/MisPedidos.tsx` |
| ✅ | **node_modules/ raíz en .gitignore**: Agregado al `.gitignore` raíz | `.gitignore` |

### 🧱 S2 — Arquitectura y UX

| # | Descripción | Archivos afectados |
|---|-------------|-------------------|
| ✅ | **Admin.tsx refactorizado**: 1420 → 213 líneas. Extraídos 6 managers a `components/admin/` | `client/src/components/admin/` (7 archivos nuevos) |
| ✅ | **Login duplicado eliminado**: `LoginModal` removido de `Home.tsx`. Redirige a `/login` con `useNavigate` | `client/src/pages/Home.tsx` |
| ✅ | **HSTS + CSP mejorados**: Se agregó `hsts`, `baseUri`, `formAction`, `upgradeInsecureRequests` | `server/app.ts:32-46` |
| ✅ | **Contraste WCAG mejorado**: `--color-text-light` más oscuro, `--color-border` más opaco, checkbox y `<select>` con colores explícitos | `client/src/index.css` |
| ✅ | **Modal de detalle de plato**: Al hacer clic en un plato del menú se abre un modal con descripción, ingredientes e imagen ampliada | `client/src/components/DishModal.tsx`, `MenuCard.tsx` |
| ✅ | **Fondo sólido en carrito**: Backdrop del carrito cambiado de `bg-black/50` a `bg-black/90` para fondo completamente opaco | `client/src/components/CartDrawer.tsx:108` |
| ✅ | **Polling reducido**: MisPedidos 15s→60s, Admin 30s→120s, solicitudes 15s/60s→120s | `MisPedidos.tsx`, `Admin.tsx` |
| ✅ | **ScrollVideo**: Intervalo ya se limpia con `clearInterval` | `ScrollVideo.tsx` (verificado) |
| ✅ | **ErrorBoundary**: Ya envuelve las rutas con Suspense | `client/src/App.tsx` (verificado) |
| ✅ | **Nav móvil con fondo sólido**: Usa `bg-neutral-900 rounded-xl p-2` con hover states | `client/src/components/Header.tsx:155` |
| ✅ | **ScrollToTop funcional**: Con `scrollRestoration = 'manual'` + `scrollTo(0,0)` por pathname | `client/src/components/ScrollToTop.tsx` |
| ✅ | **Feedback al crear pedido**: Pantalla de confirmación con nº pedido, fecha, total y pasos siguientes | `client/src/components/CartDrawer.tsx:165-213` |
| ✅ | **authMiddleware + adminMiddleware**: Todas las rutas protegidas ya encadenan ambos middlewares | `server/routes/categorias.ts`, `config.ts` |
| ✅ | **LoadingSpinner reutilizable**: Componente existente en `components/LoadingSpinner.tsx` | Verificado |
| ✅ | **Chunk splitting**: `chunkSizeWarningLimit: 300`, separado en vendor/ui/query | `client/vite.config.ts:58-75` |

### 🛠️ S3 — Mejores Prácticas

| # | Descripción | Archivos afectados |
|---|-------------|-------------------|
| ✅ | **`schema.sql` eliminado**: Era duplicado de `migrations/001_initial.sql` | `schema.sql` (eliminado) |
| ✅ | **Logging unificado**: `console.error` → `logger.error` en upload.ts y db.ts | `server/routes/upload.ts`, `server/config/db.ts` |
| ✅ | **Prettier configurado**: `.prettierrc` con reglas consistentes | `.prettierrc` (nuevo) |
| ✅ | **Cloudinary folder**: Ya usa `process.env.CLOUDINARY_FOLDER` con fallback | `server/routes/upload.ts:45` (verificado) |

### 🐳 S4 — DevOps y Limpieza

| # | Descripción | Archivos afectados |
|---|-------------|-------------------|
| ✅ | **Dockerfile** + **docker-compose.yml** creados | `Dockerfile`, `docker-compose.yml` (nuevos) |
| ✅ | **Health check**: `GET /` ya devuelve status, version, uptime, db status | `server/app.ts:95-111` (verificado) |
| ✅ | **uploads/**: Creado `.gitkeep`, actualizado `.gitignore` | `server/uploads/.gitkeep`, `server/.gitignore` |
| ✅ | **toggleField optimizado**: Ya envía solo `{ [field]: !valorActual }` | Extraído en `PlatosManager.tsx` |
| ✅ | **CartItem minimalista**: Solo guarda `{id, nombre, precio, cantidad, categoria_id}` | `client/src/types.ts` (verificado) |

---

## 🔴 PENDIENTES (próxima iteración)

### P3 — Calidad de Código

#### 🧹 1. Capa de servicios (service layer)
**Archivos**: Nuevos `server/services/`
**Problema**: SQL y lógica de negocio mezclados en controllers. Extraer lógica a servicios separados.
```
server/services/
├── pedidoService.ts
├── platoService.ts
├── usuarioService.ts
├── categoriaService.ts
└── feedbackService.ts
```

#### 🧹 2. TypeScript ESLint para server
**Archivo**: `server/eslint.config.js` — configurar `typescript-eslint`.

#### 🧹 3. Migrar server tests a TypeScript
**Archivos**: `server/test/api.test.js`, `helpers.js` → `.ts`

#### 🧹 4. Unificar estilos de exportación en server
**Problema**: Mezcla de `export =` (CommonJS) y `export {}` (ESM).

### P5 — DevOps

#### 🐳 5. Express 5 beta
`express@^5.2.1` — monitorizar release estable.

---

## 📊 VISTA RÁPIDA — Próxima iteración

| Prioridad | # | Tarea | Esfuerzo | Estado |
|-----------|---|-------|----------|--------|
| **P3** | 1 | Capa de servicios | 8-12 h | ❌ |
| **P3** | 2 | TypeScript ESLint server | 1 h | ❌ |
| **P3** | 3 | Tests server a TS | 1 h | ❌ |
| **P3** | 4 | Unificar exports server | 1 h | ❌ |
| **P5** | 5 | Express 5 monitoring | — | ⏳ |

---

## 🗺️ MAPA DE ARCHIVOS DEL PROYECTO

```
PetriGastro/
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── admin/                    ← NUEVO (6 managers extraídos)
│   │   │   │   ├── CategoriasManager.tsx
│   │   │   │   ├── FechasManager.tsx
│   │   │   │   ├── Paginacion.tsx
│   │   │   │   ├── PlatosManager.tsx
│   │   │   │   ├── SolicitudesManager.tsx
│   │   │   │   ├── StatsManager.tsx
│   │   │   │   └── UsuariosManager.tsx
│   │   │   ├── CartDrawer.tsx
│   │   │   ├── ErrorBoundary.tsx
│   │   │   ├── Header.tsx
│   │   │   ├── Layout.tsx
│   │   │   ├── LoadingSpinner.tsx
│   │   │   ├── ScrollToTop.tsx
│   │   │   ├── ScrollVideo.tsx
│   │   │   └── ...
│   │   ├── context/
│   │   │   ├── AuthContext.tsx
│   │   │   ├── CartContext.tsx
│   │   │   ├── ThemeContext.tsx
│   │   │   └── ToastContext.tsx
│   │   ├── pages/
│   │   │   ├── Admin.tsx                 ← REFACTORIZADO (213 líneas)
│   │   │   ├── Home.tsx                  ← LoginModal eliminado
│   │   │   ├── MisPedidos.tsx            ← Polling: 60s
│   │   │   └── ...
│   │   ├── index.css                     ← Contraste mejorado
│   │   └── types.ts
│   ├── vite.config.ts
│   └── vitest.config.ts
├── server/
│   ├── app.ts                            ← HSTS + CSP mejorados
│   ├── server.ts                         ← Más env vars validadas
│   ├── config/
│   │   └── db.ts                         ← SSL fix
│   ├── migrations/
│   │   ├── 001_initial.sql
│   │   ├── 003_soft_delete.sql
│   │   └── 004_ingredientes.sql          ← NUEVA
│   ├── routes/
│   │   ├── feedback.ts                   ← +validación + items en getMisPedidos
│   │   ├── fechas.ts                     ← +validación
│   │   ├── platos.ts                     ← +validación ingredientes
│   │   ├── usuarios.ts                   ← +validación
│   │   └── upload.ts                     ← logger + multer seguro
│   └── uploads/
│       └── .gitkeep                      ← NUEVO
├── .prettierrc                           ← NUEVO
├── Dockerfile                            ← NUEVO
├── docker-compose.yml                    ← NUEVO
└── MEJORAS.md                            ← ESTE DOCUMENTO
```

---

## 🔗 REFERENCIA CRUZADA

| Documento original | Contenido absorbido en |
|-------------------|----------------------|
| `Mejoras.md` | Items de usuario → Pendientes P1 |
| `Auditoria_Mejoras.md` | 38 hallazgos → Divididos entre ✅ y ❌ |
| `.opencode/plans/mejoras-implementation.md` | 5 tareas → Verificadas vs realidad |
| `PLAN_MEJORAS.md` | 28 tareas → Consolidado aquí |
