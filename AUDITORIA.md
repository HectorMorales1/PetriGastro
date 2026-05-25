# Auditoría PetriGastro — Pendientes y mejoras

## 🔴 Críticos (prioridad alta)

- [ ] **Migrar backend a TypeScript** — Actualmente todo en CommonJS, propenso a errores
- [ ] **Agregar tests** (unitarios, integración API, e2e)
- [ ] **Eliminar bloques catch vacíos** — `client/src/services/api.ts:39` traga errores silenciosamente
- [ ] **Asegurar HTTPS en producción** — La ruta de login no está protegida

## 🟡 Importantes

- [ ] **Tipar correctamente handlers del frontend** — `Login.tsx`, `AuthContext.tsx`, `CartDrawer.tsx` tienen `any` implícitos
- [ ] **Sistema de migraciones SQL formal** — Reemplazar `migrations.js` y `setup_config.js` por node-pg-migrate o similar
- [ ] **Agregar validación faltante** en PUT de categorías (`routes/categorias.js`), config y fechas
- [ ] **Configurar CI/CD** (GitHub Actions, scripts de deploy)
- [ ] **Separar variables de entorno** — Usar `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` en lugar de `CLOUDINARY_URL`
- [ ] **Recarga automática al aceptar/rechazar usuario** — Actualmente no se actualiza la lista
- [ ] **Sesión con tiempo de expiración** — Que al cerrar ventana o tras inactividad expire la sesión
- [ ] **Que se vean bien las imágenes** — Gestionar errores de carga y placeholders
- [ ] **Editar platos desde el panel admin** — Solo se puede crear/eliminar
- [ ] **Mostrar mensaje "pedido realizado correctamente"** — Feedback al usuario tras crear pedido

## 🟢 Mejoras

- [ ] **Soportar tema claro** — Actualmente el CSS tiene tema oscuro hardcodeado
- [ ] **Agregar ESLint y Prettier al backend**
- [ ] **Dividir Home.tsx** (~930+ líneas) en componentes más pequeños
- [ ] **Mover ítems de PG Mejoras.md a issues** y eliminar el archivo
- [ ] **Mejorar scripts raíz de package.json** — Que build/start incluyan el cliente
- [ ] **Borrar usuario / cambiar rol desde admin**
- [ ] **Eliminar usuario de BD si es rechazado**
- [ ] **Actualizar tablas automáticamente cuando hay un pedido nuevo**
- [ ] **Info detallada del plato al hacer clic** (ingredientes, descripción)
- [ ] **Ocultar fechas pasadas** — Que no se muestren fechas ya vencidas (dejar margen 1 día)
- [ ] **Quitar "Hecho con ♥ en Madrid"** del footer

## Stack actual

| Capa | Tecnología |
|------|-----------|
| Frontend | React 19, TypeScript, Vite 8, Tailwind CSS 4, React Query 5, React Router 7 |
| Backend | Node.js, Express 5, PostgreSQL, JWT, Cloudinary, Nodemailer |
| Tooling | ESLint, PWA, Compression, Pino logger |
