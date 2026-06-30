# Plan de Mejoras de Seguridad - PetriGastro

> Estado: revisado — se eliminan los puntos ya corregidos, se mantienen los pendientes.

---

## Priorización: CRÍTICO

### C1. Rotar credenciales restantes (DB + Cloudinary)

**Archivo:** `server/.env`

**Hecho:** JWT_SECRET rotado.

**Pendiente:** Las credenciales de base de datos (`DB_USER=postgres`, `DB_PASSWORD=postgres`) y Cloudinary siguen siendo valores de desarrollo/placeholders. En producción deben ser secretos reales gestionados por variables de entorno del sistema o un secrets manager.

---

### C2. Verificar propiedad del pedido en feedback

**Archivo:** `server/routes/feedback.ts:14`

**Hecho:** Se agregó `authMiddleware` a la ruta.

**Pendiente:** `feedbackService.getByPedido` no verifica que el usuario autenticado sea el dueño del pedido o un admin. Cualquier usuario autenticado puede consultar feedback de cualquier pedido.

**Cambio requerido:**

```diff
// server/services/feedbackService.ts
export async function getByPedido(pedido_id: number, usuario_id: number, rol: string) {
+ if (rol !== 'admin') {
+   const pedido = await pool.query('SELECT usuario_id FROM pedidos WHERE id = $1', [pedido_id])
+   if (pedido.rows.length === 0 || pedido.rows[0].usuario_id !== usuario_id) {
+     throw new AppError('No tienes permiso para ver este feedback', 403)
+   }
+ }
  const result = await pool.query('SELECT * FROM pedido_feedback WHERE pedido_id = $1', [pedido_id])
  return result.rows[0] || null
}
```

---

## Priorización: MEDIA

### M2. Migrar tokens JWT a cookies httpOnly

**Archivos:** `server/controllers/authController.ts`, `client/src/context/AuthContext.tsx`, `client/src/services/api.ts`

**Problema:** Los tokens JWT se almacenan en `sessionStorage` en el cliente, vulnerables a XSS.

**Cambio requerido:**

1. **Servidor** — Al hacer login/refresh, setear cookie `httpOnly`:
```typescript
res.cookie('petri_token', token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 15 * 60 * 1000
})
res.cookie('petri_refresh_token', refreshToken, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/api/auth/refresh'
})
```

2. **Servidor** — Middleware `auth.ts`: leer token de cookie si no hay header Bearer.

3. **Cliente** — Eliminar `safeSetItem`/`safeGetItem` para tokens, depender de cookies + refresco automático vía interceptor de axios.

---

### M5. Middleware de verificación de existencia de recursos

**Archivos:** Múltiples rutas

**Problema:** Aunque se valida que los IDs sean enteros con `isInt()`, no se verifica que el recurso exista antes de operar. Esto puede generar errores 500 internos o mensajes genéricos.

**Solución (ejemplo para platos):**
```typescript
// middleware/exists.ts
export function platoExists(req: Request, _res: Response, next: NextFunction) {
  const { id } = req.params
  const result = await pool.query('SELECT id FROM platos WHERE id = $1', [id])
  if (result.rows.length === 0) {
    return next(new AppError('Plato no encontrado', 404))
  }
  next()
}
```

Aplicar a rutas PUT/DELETE de: platos, categorías, fechas, usuarios.

---

## Priorización: BAJA

### B2. Agregar integridad de subrecursos (SRI)

Si se sirven assets desde CDNs en el frontend, agregar atributos `integrity` a los tags `<link>` y `<script>`.

---

### B3. Monitoreo de dependencias

```bash
npm audit                    # Auditoría básica
npm install -g snyk          # Alternativa más completa
snyk test
```

Agregar `npm audit` al pipeline de CI/CD.

---

## Resumen de acciones pendientes por archivo

| Archivo | Cambio pendiente |
|---------|-----------------|
| `server/.env` | Rotar credenciales DB y Cloudinary |
| `server/services/feedbackService.ts` | Verificar ownership del pedido |
| `server/controllers/authController.ts` | Setear cookies httpOnly en login/refresh |
| `server/middleware/auth.ts` | Leer token de cookie como fallback |
| `client/src/context/AuthContext.tsx` | Eliminar almacenamiento manual de tokens |
| `client/src/services/api.ts` | Depender de cookies + interceptor |
| `server/middleware/exists.ts` (nuevo) | Crear middleware de verificación de existencia |
| `server/routes/platos.ts` | Aplicar middleware de existencia |
| `server/routes/categorias.ts` | Aplicar middleware de existencia |
| `server/routes/fechas.ts` | Aplicar middleware de existencia |
| `server/routes/usuarios.ts` | Aplicar middleware de existencia |
| Cliente | Agregar SRI a assets CDN |
| CI/CD | Agregar `npm audit` |
