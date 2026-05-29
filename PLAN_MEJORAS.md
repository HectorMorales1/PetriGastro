# Plan de Mejoras - PetriGastro

Basado en la auditoría del proyecto. Organizado por prioridad.

---

## Prioridad Alta (Imprescindible)

### [X] 1. Plan de acción detallado
- Crear este archivo con el roadmap de mejoras

### [ ] 2. Corregir migración faltante 002
- Archivo: `server/migrations/`
- Renumerar migraciones para que sean consecutivas (001, 002, 003, ...)
- Verificar que `migrate.ts` las ejecute en orden correcto

### [ ] 3. Aumentar cobertura de tests - Backend
- Archivos: `server/test/`
- Tests de autenticación (register, login, refresh, logout, verificar email)
- Tests de CRUD de platos, categorías, pedidos
- Tests de autorización (admin vs cliente)
- Tests de validación de entrada (express-validator)
- Tests de rate limiting
- Tests de flujo completo (crear pedido, cambiar estado, feedback)

### [ ] 4. Aumentar cobertura de tests - Frontend
- Archivos: `client/src/test/`, `client/src/components/`
- Tests de componentes principales (Header, AuthGuard, CartDrawer, Layout)
- Tests de contextos (AuthContext, CartContext)
- Tests de páginas (Login, Menu, Home)
- Tests del API layer (api.ts interceptors)

### [ ] 5. Agregar Docker/docker-compose
- Archivos: `docker-compose.yml`, `Dockerfile.server`, `Dockerfile.client`
- PostgreSQL + Server + Client en docker-compose
- Volumen persistente para BD
- Variables de entorno con .env.example

### [ ] 6. Agregar CI/CD con GitHub Actions
- Archivo: `.github/workflows/ci.yml`
- Lint, typecheck, tests en cada push/PR
- Build de producción
- Escaneo de secrets

---

## Prioridad Media (Importante)

### [ ] 7. Refactorizar Header.tsx en componentes más pequeños
- Extraer `DesktopNav`, `MobileNav`, `CartButton`, `ThemeToggle`, `UserMenu`
- Archivo: `client/src/components/Header.tsx -> client/src/components/header/`

### [ ] 8. Eliminar `any` del código backend
- Archivos en `server/services/`, `server/controllers/`
- Tipar `pedidoService.ts`, `platoService.ts`, `usuarioService.ts`
- Crear interfaces/exports compartidos desde `types.ts`

### [ ] 9. Unificar fetching en cliente (todo axios)
- Archivo: `client/src/context/AuthContext.tsx`, `client/src/services/api.ts`
- Reemplazar `fetch()` nativo en refresh token por axios
- Eliminar dependencia de `safeGetItem` duplicada

### [ ] 10. Agregar soft-delete consistente
- Archivos: `server/services/categoriaService.ts`, `server/services/platoService.ts`
- Agregar columna `deleted_at` a `categorias` y `platos`
- Migración 006 para soft-delete en categorías y platos
- Modificar queries para filtrar `deleted_at IS NULL`

### [ ] 11. Mover seed data fuera de migraciones
- Archivo nuevo: `server/seed.ts`
- Extraer inserts de `001_initial.sql` a `seed.ts`
- Permitir `npm run seed` para desarrollo

---

## Prioridad Baja (Deseable)

### [ ] 12. Agregar manejo de estados vacíos en UI
- Componentes: todas las listas (platos, pedidos, solicitudes, etc.)
- Mensajes tipo "No hay platos disponibles", "No tienes pedidos"
- Archivos: `client/src/pages/`, `client/src/components/admin/`

### [ ] 13. Agregar búsqueda de platos en frontend
- Barra de búsqueda en página Menu
- Consumir `?busqueda=` del endpoint existente
- Archivo: `client/src/pages/Menu.tsx`

### [ ] 14. Extraer números mágicos a constantes
- Rate limits en `server/app.ts`
- Tiempos de expiración, tamaños de archivo (5MB), etc.

### [ ] 15. Agregar manejo de errores amigable en cliente
- Reemplazar `console.error` con ToastContext
- Mensajes de error más específicos en formularios

---

## Progreso

| # | Mejora | Estado |
|---|--------|--------|
| 1 | Plan de acción | ✅ |
| 2 | Migración 002 (no-op placeholder) + 006 (soft-delete) | ✅ |
| 3 | Tests backend (auth, authorization, APIs, validation) | ✅ |
| 4 | Tests frontend (AuthGuard, CartContext, storage utils) | ✅ |
| 5 | Docker (docker-compose, server/Dockerfile, client/Dockerfile + nginx) | ✅ |
| 6 | CI/CD (GitHub Actions: lint, typecheck, test, build) | ✅ |
| 7 | Refactor Header (NavLinks, DesktopActions, MobileMenu) | ✅ |
| 8 | Eliminar `as any` de authController (usar SignOptions con número) | ✅ |
| 9 | Unificar fetching (axios en AuthContext + api.ts interceptor) | ✅ |
| 10 | Soft-delete en categorías y platos (migración + services) | ✅ |
| 11 | Seed script (seed.ts con `npm run seed`) | ✅ |
| 12 | Estados vacíos (EmptyState componente reusable) | ✅ |
| 13 | Búsqueda platos (ya existía en Menu.tsx ✅) | ✅ ya existente |
| 14 | Fix pre-existing lint errors (ScrollVideo, TestimonialsSection, etc.) | ✅ |
| 15 | **Pendiente**: extraer números mágicos a constantes | ⬜ |
| 16 | **Pendiente**: reemplazar console.error con ToastContext | ⬜ |

---

*Generado automáticamente desde la auditoría del proyecto*
