# Plan de Mejoras de Seguridad - PetriGastro

## Priorización: CRÍTICO (Corregir inmediatamente)

### C1. Rotar credenciales y proteger `.env`

**Archivos:** `server/.env`, `.gitignore`

**Problema:** El `.env` con credenciales reales está commiteado en el repo.

**Acciones:**
1. Agregar `server/.env` a `.gitignore` en la raíz
2. Rotar todas las credenciales expuestas (DB, JWT, Cloudinary)
3. Generar nuevo JWT_SECRET con `crypto.randomBytes(32).toString('hex')`
4. Usar secrets management externo en producción (variables de entorno del sistema / Docker secrets / Vault)

```bash
# .gitignore
server/.env
```

---

### C2. Agregar autenticación a feedback por pedido

**Archivo:** `server/routes/feedback.ts:14`

**Problema:** `GET /api/feedback/pedido/:pedido_id` expone feedback de cualquier pedido sin autenticación.

**Cambio requerido:**

```diff
- router.get('/pedido/:pedido_id', validate([
+ router.get('/pedido/:pedido_id', authMiddleware, validate([
    param('pedido_id').isInt({ min: 1 }).withMessage('ID de pedido inválido')
  ]), feedbackController.getByPedido)
```

Adicionalmente, verificar en `feedbackService.getByPedido` que el usuario autenticado sea el dueño del pedido o un admin.

---

### C3. Validar tipo real de archivo subido (magic bytes)

**Archivo:** `server/routes/upload.ts:9-15`

**Problema:** Solo se verifica el MIME type del header HTTP, fácilmente falsificable.

**Cambio requerido:**

Instalar `file-type`:
```bash
npm install file-type
```

Modificar el `fileFilter` para validar magic bytes:

```typescript
import { fileTypeFromBuffer } from 'file-type'

const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp']
const ALLOWED_MIMES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']

const fileFilter = async (_req: Request, file: Express.Multer.File, cb: FileFilterCallback): Promise<void> => {
  if (!ALLOWED_MIMES.includes(file.mimetype)) {
    return cb(new Error('Solo se permiten imágenes (jpeg, jpg, png, gif, webp)'))
  }
  cb(null, true)
}

// En el handler, validar magic bytes antes de subir a Cloudinary
if (req.file) {
  const type = await fileTypeFromBuffer(req.file.buffer)
  if (!type || !ALLOWED_EXTENSIONS.includes(type.ext)) {
    res.status(400).json({ message: 'El archivo no es una imagen válida' })
    return
  }
}
```

---

### C4. Limitar tamaño del body JSON

**Archivo:** `server/app.ts:65`

**Problema:** Sin límite de tamaño en `express.json()`, permitiendo DoS por payload enorme.

**Cambio requerido:**

```diff
- app.use(express.json())
+ app.use(express.json({ limit: '1mb' }))
```

---

## Priorización: ALTA (Corregir en el sprint actual)

### A1. Cambiar verificación de email a POST

**Archivos:** `server/routes/auth.ts:34`, `server/controllers/authController.ts:173-208`, `client/src/services/api.ts:111`

**Problema:** Token de verificación en query string (GET) → expuesto en logs, referrer, historial.

**Cambio requerido:**

```diff
// server/routes/auth.ts
- router.get('/verificar', authController.verificarEmail)
+ router.post('/verificar', validate([
+   body('token').notEmpty().withMessage('Token requerido')
+ ]), authController.verificarEmail)
```

```diff
// server/controllers/authController.ts
- const token = req.query.token as string
+ const { token } = req.body
```

```diff
// client/src/services/api.ts
- verificarEmail: (token) => api.get(`/auth/verificar?token=${token}`).then(r => r.data),
+ verificarEmail: (token) => api.post('/auth/verificar', { token }).then(r => r.data),
```

---

### A2. Sanitizar `motivo_rechazo` en respuestas

**Archivo:** `server/controllers/authController.ts:145-147`

**Problema:** XSS reflejado si el frontend renderiza `motivo_rechazo` sin escapado.

**Cambio requerido:**

```diff
- const motivo = user.motivo_rechazo ? ` Motivo: ${user.motivo_rechazo}` : ''
+ const motivo = user.motivo_rechazo
+   ? ` Motivo: ${user.motivo_rechazo.replace(/[<>"'&]/g, '')}`
+   : ''
```

O mejor, sanitizar al guardar en `usuarioService.ts:92-93`:
```typescript
const motivoSanitizado = motivo ? motivo.replace(/[<>"'&]/g, '') : ''
```

---

### A3. Validar `categoria_id` en creación de platos

**Archivo:** `server/routes/platos.ts:12-20`

**Problema:** Falta validación de `categoria_id`, permitiendo IDs inválidos.

**Cambio requerido:**

```diff
router.post('/', authMiddleware, adminMiddleware, validate([
  body('nombre').trim().notEmpty().withMessage('Nombre del plato requerido'),
  body('precio').isFloat({ min: 0 }).withMessage('Precio debe ser un número positivo'),
+ body('categoria_id').isInt({ min: 1 }).withMessage('Categoría inválida'),
  body('descripcion').optional().trim(),
  body('ingredientes').optional().trim(),
  body('imagen_url').optional().trim(),
  body('disponible').optional().isBoolean(),
  body('destacado').optional().isBoolean()
]), platoController.create)
```

---

### A4. Validar longitud máxima en búsqueda de platos

**Archivo:** `server/services/platoService.ts:19-21`

**Problema:** Sin límite de longitud en el parámetro `busqueda`.

**Cambio requerido:**

Agregar validación en la ruta:
```typescript
body('busqueda').optional().isString().isLength({ max: 100 }).trim().escape()
```

---

## Priorización: MEDIA (Corregir en el próximo sprint)

### M1. SSL/TLS con verificación para DB

**Archivo:** `server/config/db.ts:10-12`

**Problema:** Conexión SSL sin verificar certificado del servidor.

**Cambio requerido:**

```diff
const sslConfig = process.env.DB_CA_CERT
  ? { rejectUnauthorized: true, ca: process.env.DB_CA_CERT }
- : { rejectUnauthorized: false }
+ : process.env.NODE_ENV === 'production'
+   ? { rejectUnauthorized: true }
+   : { rejectUnauthorized: false }
```

---

### M2. Usar cookies httpOnly para tokens (AuthContext + API)

**Archivos:** `client/src/context/AuthContext.tsx`, `client/src/services/api.ts`

**Problema:** Tokens JWT en `sessionStorage`: vulnerables a XSS.

**Cambio requerido:**

En el servidor, crear endpoint que setee cookies:
```typescript
// middleware/cookieAuth.ts
res.cookie('petri_token', token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 15 * 60 * 1000  // 15 min
})
```

En el frontend, eliminar almacenamiento manual de tokens y depender de cookies + interceptor.

---

### M3. Reducir rate limiting en login

**Archivo:** `server/app.ts:73-77`

**Problema:** 20 intentos de login por 15 minutos es demasiado permisivo.

**Cambio requerido:**

```diff
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
- max: 20,
+ max: 5,
  message: 'Demasiados intentos de login, espera 15 minutos'
})
```

---

### M4. Agregar report-uri a CSP

**Archivo:** `server/app.ts:31-53`

**Problema:** Sin reporting de violaciones CSP.

**Cambio requerido:**

```diff
contentSecurityPolicy: {
  directives: {
+   reportUri: '/api/csp-report',
    ...
  }
}
```

Opcional: endpoint para recibir reports:
```typescript
app.post('/api/csp-report', (req, res) => {
  logger.warn({ csp: req.body }, 'CSP Violation')
  res.status(204).end()
})
```

---

### M5. Validación de sanidad en IDs numéricos

**Archivos:** Múltiples rutas

**Problema:** Aunque se usa `isInt()`, no se valida que el ID exista antes de operar en varios endpoints.

**Solución:** Agregar middleware de verificación de existencia de recursos, por ejemplo:
```typescript
async function platoExists(req: Request, _res: Response, next: NextFunction) {
  const { id } = req.params
  const result = await pool.query('SELECT id FROM platos WHERE id = $1', [id])
  if (result.rows.length === 0) {
    return next(new AppError('Plato no encontrado', 404))
  }
  next()
}
```

---

## Priorización: BAJA (Mejora continua)

### B1. Minimizar payload del JWT

**Archivo:** `server/controllers/authController.ts:27-28`

```typescript
// Reducir a solo lo necesario:
{ id: user.id, rol: user.rol, token_version: user.token_version || 0 }
```

### B2. Agregar integridad de subrecursos (SRI) en HTML

Si se sirven assets desde CDNs en el frontend, agregar atributos `integrity`.

### B3. Monitoreo de dependencias

```bash
npm audit                    # Auditoría básica
npm install -g snyk          # Alternativa más completa
snyk test
```

Agregar `npm audit` al CI/CD.

---

## Resumen de acciones por archivo

| Archivo | Cambios necesarios |
|---------|-------------------|
| `.gitignore` | Agregar `server/.env` |
| `server/.env` | Rotar credenciales |
| `server/app.ts:65` | `express.json({ limit: '1mb' })` |
| `server/app.ts:73-77` | Login max: 20 → 5 |
| `server/routes/feedback.ts:14` | Agregar `authMiddleware` |
| `server/routes/auth.ts:34` | GET → POST |
| `server/routes/platos.ts` | Validar `categoria_id` |
| `server/routes/upload.ts:9-15` | Validar magic bytes |
| `server/controllers/authController.ts:94` | Body en vez de query param |
| `server/controllers/authController.ts:145-147` | Sanitizar HTML |
| `server/config/db.ts:10-12` | `rejectUnauthorized: true` en prod |
| `server/middleware/auth.ts` | Considerar cookies httpOnly |
| `client/src/services/api.ts:111` | POST en vez de GET |
| `client/src/context/AuthContext.tsx` | Migrar a cookies httpOnly |
| `server/services/platoService.ts:19-21` | Validar longitud búsqueda |
| `server/app.ts:31-53` | Agregar `reportUri` a CSP |
| `server/controllers/authController.ts:27-28` | Minimizar JWT payload |
