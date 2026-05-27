# MEJORAS — PetriGastro

> Documento único consolidado (27/05/2026)
> Fuentes: `Mejoras.md`, `Auditoria_Mejoras.md`, `.opencode/plans/mejoras-implementation.md`, `PLAN_MEJORAS.md`, `Auditoría 27/05/2026`

✅ **100% completado — todas las mejoras implementadas**

---

## ✅ CAMBIOS APLICADOS (61 completados)

### 🔒 S1 — Seguridad y Bugs Críticos

| # | Descripción | Archivos afectados |
|---|-------------|-------------------|
| ✅ | **Validación de env vars**: Se agregaron `CLOUDINARY_API_SECRET`, `CLOUDINARY_API_KEY`, `CLOUDINARY_CLOUD_NAME` a la validación obligatoria en el arranque | `server/server.ts:9` |
| ✅ | **Precio verificado desde BD**: El servidor ya consulta `platos.precio` real y no confía en el precio enviado por el frontend | `server/controllers/pedidoController.ts:25-35` |
| ✅ | **SSL de BD**: `rejectUnauthorized: false` → `true` con `DB_CA_CERT` configurable por entorno | `server/config/db.ts:11,18` |
| ✅ | **Pantalla negra Admin Usuarios**: Extraído `UsuariosManager` con manejo de error + loading + empty state | `client/src/components/admin/UsuariosManager.tsx` |
| ✅ | **Validación express-validator agregada** en rutas que faltaban (feedback, fechas, usuarios) | `server/routes/feedback.ts`, `fechas.ts`, `usuarios.ts` |
| ✅ | **Rate limit en rutas POST/PUT/DELETE**: 50 req/15min en feedback, usuarios, fechas y upload | `server/app.ts:68-99` |
| ✅ | **Multer error mapping seguro**: Errores mapeados a mensajes amigables en español | `server/routes/upload.ts:27-32` |
| ✅ | **Switches desactivados más visibles**: `bg-gray-300` → `bg-gray-400` en modo claro | `client/src/components/admin/PlatosManager.tsx` |
| ✅ | **Campo `ingredientes`**: Migración 004 + tipo TypeScript + formulario Admin + modal de detalle | `server/migrations/004_ingredientes.sql`, `types.ts`, `PlatosManager.tsx`, `DishModal.tsx` |
| ✅ | **Info platos en MisPedidos**: Query SQL mejorada + UI con nombre, cantidad, precio e imagen | `server/controllers/feedbackController.ts`, `client/src/pages/MisPedidos.tsx` |
| ✅ | **node_modules/ raíz en .gitignore**: Agregado al `.gitignore` raíz | `.gitignore` |
| ✅ | **C1 — `.env.example` creado**: Documentación de vars necesarias sin credenciales reales | `server/.env.example` (nuevo) |
| ✅ | **C2 — `token_version` en authMiddleware**: Incluido en payload JWT + verificado contra BD en cada request autenticado | `server/middleware/auth.ts:34-47`, `controllers/authController.ts:27` |
| ✅ | **M1 — Rate limit en `/auth/verificar`**: 10 req/15min contra brute-force de tokens | `server/app.ts:92-96` |
| ✅ | **M2 — Stripe CSP relic eliminado**: `https://js.stripe.com` removido de `scriptSrc` | `server/app.ts:38` |
| ✅ | **M3 — Catch-all 404**: Middleware al final de app.ts para rutas no encontradas | `server/app.ts:145-147` |
| ✅ | **M4 — Índices BD**: Migración 005 con 5 índices (usuario_id, pedido_id, fecha, estado, email) | `server/migrations/005_indices.sql` (nuevo) |
| ✅ | **M5 — Pool max configurable**: `DB_POOL_MAX` env var con fallback 20 | `server/config/db.ts:12,17,24` |

### 🧱 S2 — Arquitectura y UX

| # | Descripción | Archivos afectados |
|---|-------------|-------------------|
| ✅ | **Admin.tsx refactorizado**: 1420 → 213 líneas. Extraídos 6 managers a `components/admin/` | `client/src/components/admin/` (7 archivos nuevos) |
| ✅ | **Login duplicado eliminado**: `LoginModal` removido de `Home.tsx`. Redirige a `/login` con `useNavigate` | `client/src/pages/Home.tsx` |
| ✅ | **HSTS + CSP mejorados**: Se agregó `hsts`, `baseUri`, `formAction`, `upgradeInsecureRequests` | `server/app.ts:32-54` |
| ✅ | **Contraste WCAG mejorado**: `--color-text-light` más oscuro, `--color-border` más opaco, checkbox y `<select>` con colores explícitos | `client/src/index.css` |
| ✅ | **Modal de detalle de plato**: Al hacer clic en un plato del menú se abre un modal con descripción, ingredientes e imagen ampliada | `client/src/components/DishModal.tsx`, `MenuCard.tsx` |
| ✅ | **Fondo sólido en carrito**: Backdrop del carrito cambiado de `bg-black/50` a `bg-black/90` para fondo completamente opaco | `client/src/components/CartDrawer.tsx:108` |
| ✅ | **Polling reducido**: MisPedidos 15s→60s, Admin 30s→120s, solicitudes 15s/60s→120s | `client/src/pages/MisPedidos.tsx`, `client/src/pages/Admin.tsx` |
| ✅ | **ScrollVideo**: Intervalo ya se limpia con `clearInterval` | `client/src/components/ScrollVideo.tsx` (verificado) |
| ✅ | **ErrorBoundary**: Ya envuelve las rutas con Suspense | `client/src/App.tsx` (verificado) |
| ✅ | **Nav móvil con fondo sólido**: Usa `bg-neutral-900 rounded-xl p-2` con hover states | `client/src/components/Header.tsx:155` |
| ✅ | **ScrollToTop funcional**: Con `scrollRestoration = 'manual'` + `scrollTo(0,0)` por pathname | `client/src/components/ScrollToTop.tsx` |
| ✅ | **Feedback al crear pedido**: Pantalla de confirmación con nº pedido, fecha, total y pasos siguientes | `client/src/components/CartDrawer.tsx:165-213` |
| ✅ | **authMiddleware + adminMiddleware**: Todas las rutas protegidas ya encadenan ambos middlewares | `server/routes/categorias.ts`, `server/routes/config.ts` |
| ✅ | **LoadingSpinner reutilizable**: Componente existente en `client/src/components/LoadingSpinner.tsx` | Verificado |
| ✅ | **Chunk splitting**: `chunkSizeWarningLimit: 300`, separado en vendor/ui/query | `client/vite.config.ts:58-75` |

### 🛠️ S3 — Mejores Prácticas

| # | Descripción | Archivos afectados |
|---|-------------|-------------------|
| ✅ | **`schema.sql` eliminado**: Era duplicado de `migrations/001_initial.sql` | `schema.sql` (eliminado) |
| ✅ | **Logging unificado**: `console.error` → `logger.error` en upload.ts y db.ts | `server/routes/upload.ts`, `server/config/db.ts` |
| ✅ | **Prettier configurado**: `.prettierrc` con reglas consistentes | `.prettierrc` (nuevo) |
| ✅ | **Cloudinary folder**: Ya usa `process.env.CLOUDINARY_FOLDER` con fallback | `server/routes/upload.ts:45` (verificado) |
| ✅ | **B5 — Migration runner unificado**: `migrate.ts` usa Pino logger; `config/migrations.ts` simplificado a re-export | `server/migrate.ts`, `server/config/migrations.ts` |
| ✅ | **B6 — Errores genéricos mejorados**: Mensajes más descriptivos en authController y pedidoController | `authController.ts`, `pedidoController.ts` |

### 🐳 S4 — DevOps y Limpieza

| # | Descripción | Archivos afectados |
|---|-------------|-------------------|
| ✅ | **Dockerfile** + **docker-compose.yml** creados | `Dockerfile`, `docker-compose.yml` (nuevos) |
| ✅ | **Health check**: `GET /` ya devuelve status, version, uptime, db status | `server/app.ts:113-129` (verificado) |
| ✅ | **uploads/**: Creado `.gitkeep`, actualizado `.gitignore` | `server/uploads/.gitkeep`, `server/.gitignore` |
| ✅ | **toggleField optimizado**: Ya envía solo `{ [field]: !valorActual }` | Extraído en `client/src/components/admin/PlatosManager.tsx` |
| ✅ | **CartItem minimalista**: Solo guarda `{id, nombre, precio, cantidad, categoria_id}` | `client/src/types.ts` (verificado) |
| ✅ | **C3 — Dockerfile reparado**: `COPY node_modules` a la etapa de producción | `Dockerfile` |
| ✅ | **C4 — CI/CD reparado**: `node migrate.js` → `npx tsx migrate.ts` | `.github/workflows/ci.yml:80` |
| ✅ | **B1 — Register.tsx eliminado**: Archivo innecesario (solo redirigía a Login) | `client/src/pages/Register.tsx` (eliminado) |
| ✅ | **B2 — setup_config.js eliminado**: Stub sin uso | `server/setup_config.js` (eliminado) |
| ✅ | **M5 — Seed hash documentado**: Añadida nota en migración 001 sobre claves de desarrollo | `server/migrations/001_initial.sql` |
| ✅ | **M8 — CartDrawer con useQuery**: Reemplazado useEffect+fetch por @tanstack/react-query | `client/src/components/CartDrawer.tsx:26-32` |
| ✅ | **M9 — Paginación server-side platos**: platoController.getAll ahora acepta page/limit y devuelve pagination | `server/controllers/platoController.ts`, `PlatosManager.tsx` |
| ✅ | **B3 — Email templates extraídos**: Módulo `server/config/emailTemplates.ts` con funciones verificationEmail, approvalEmail, rejectionEmail | `server/config/emailTemplates.ts` (nuevo) |
| ✅ | **B4 — Items mapping helper**: `server/utils/pedidoHelper.ts` con attachItemsToPedidos(), reutilizado en pedidoController y feedbackController | `server/utils/pedidoHelper.ts` (nuevo) |
| ✅ | **B7 — Cloudinary transformations**: Parámetros width=800, height=600, quality=auto, fetch_format=auto en upload | `server/routes/upload.ts:44-56` |
| ✅ | **B8 — Deploy workflow real**: Usa appleboy/ssh-action con secrets para deploy SSH a VPS | `.github/workflows/deploy.yml` |
| ✅ | **B9 — docker-compose volumen uploads**: Añadido volumen `uploads:` persistente | `docker-compose.yml` |
| ✅ | **B10 — TypeScript ESLint configurado**: typescript-eslint instalado y configurado en server/eslint.config.js | `server/eslint.config.js`, `package.json` |
| ✅ | **P3.4 — Exports unificados a ESM**: Todos los `export =` reemplazados por `export default` | 21 archivos en server/ |
| ✅ | **P3.3 — Tests server migrados a TS**: setup.ts, helpers.ts, api.test.ts | `server/test/*.ts` |
| ✅ | **P3.1 — Capa de servicios creada**: 6 servicios con lógica de negocio extraída de controllers | `server/services/*.ts` (6 archivos nuevos) |

---

## ✅ TODAS LAS MEJORAS COMPLETADAS

No quedan items pendientes. El repositorio está al día con todas las mejoras documentadas en `MEJORAS.md`.

---

## 📊 VISTA RÁPIDA

### Completados (61)

| # | Tarea | Esfuerzo |
|---|-------|----------|
| C1 | `.env.example` + `.gitignore` | 15 min |
| C2 | `token_version` en authMiddleware | 30 min |
| C3 | Dockerfile reparado | 15 min |
| C4 | CI/CD reparado | 15 min |
| M1 | Rate limit verificar email | 10 min |
| M2 | Stripe CSP relic eliminado | 5 min |
| M3 | Catch-all 404 | 10 min |
| M4 | Índices BD (migración 005) | 15 min |
| M5 | Pool max configurable | 10 min |
| M5 | Seed password hash documentado | 5 min |
| M8 | CartDrawer con useQuery | 30 min |
| M9 | Paginación server-side platos | 1 h |
| B1 | Eliminar Register.tsx | 5 min |
| B2 | Eliminar setup_config.js | 5 min |
| B3 | Extraer email templates a módulo | 30 min |
| B4 | Items mapping helper | 20 min |
| B5 | Unificar migration runner | 15 min |
| B6 | Errores genéricos en controllers | 30 min |
| B7 | Cloudinary transformations | 15 min |
| B8 | Deploy workflow real | 30 min |
| B9 | Volumen persistente uploads | 10 min |
| B10 | TypeScript ESLint configurado | 30 min |
| P3.1 | Capa de servicios (6 servicios) | 8 h |
| P3.3 | Tests server migrados a TS | 1 h |
| P3.4 | Exports unificados a ESM | 1 h |

✅ **Todas las mejoras completadas**

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
│   ├── app.ts                            ← HSTS + CSP + rate limit + 404 + verificar limiter
│   ├── server.ts                         ← Más env vars validadas
│   ├── .env.example                      ← NUEVO
│   ├── config/
│   │   ├── db.ts                         ← SSL + pool max
│   │   ├── emailTemplates.ts             ← NUEVO (verification, approval, rejection)
│   │   ├── logger.ts
│   │   ├── mailer.ts
│   │   ├── migrations.ts                 ← Re-export
│   │   ├── cloudinary.ts
│   │   └── validate.ts
│   ├── middleware/
│   │   ├── auth.ts                       ← token_version verificado
│   │   └── errorHandler.ts
│   ├── services/                         ← NUEVA (capa de servicios)
│   │   ├── pedidoService.ts
│   │   ├── platoService.ts
│   │   ├── usuarioService.ts
│   │   ├── categoriaService.ts
│   │   ├── feedbackService.ts
│   │   └── configService.ts
│   ├── controllers/                      ← Ahora delegan en services/
│   │   ├── authController.ts
│   │   ├── pedidoController.ts
│   │   ├── platoController.ts
│   │   ├── usuarioController.ts
│   │   ├── categoriaController.ts
│   │   ├── configController.ts
│   │   └── feedbackController.ts
│   ├── utils/
│   │   └── pedidoHelper.ts               ← NUEVO (attachItemsToPedidos)
│   ├── test/                             ← Migrado a TS
│   │   ├── setup.ts
│   │   ├── helpers.ts
│   │   └── api.test.ts
│   ├── migrate.ts                        ← Pino logger
│   ├── migrations/
│   │   ├── 001_initial.sql               ← Seed documentado
│   │   ├── 003_soft_delete.sql
│   │   ├── 004_ingredientes.sql
│   │   └── 005_indices.sql               ← NUEVO
│   ├── routes/
│   │   ├── auth.ts
│   │   ├── categorias.ts
│   │   ├── config.ts
│   │   ├── fechas.ts
│   │   ├── feedback.ts
│   │   ├── pedidos.ts
│   │   ├── platos.ts
│   │   ├── upload.ts                     ← Cloudinary transforms
│   │   └── usuarios.ts
│   └── uploads/
│       └── .gitkeep
├── .prettierrc
├── eslint.config.js                      ← Config TS actualizada
├── Dockerfile                            ← node_modules prod stage
├── docker-compose.yml                    ← volumen uploads persistente
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
| `Auditoría 27/05/2026` | 26 hallazgos → 100% implementados |
