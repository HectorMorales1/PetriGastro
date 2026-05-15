# Errores Pendientes de Corregir

## Críticos

### 1. Auth en memoria en el servidor
- **Archivo**: `server/controllers/authController.js`
- **Problema**: Los usuarios se almacenan en un array JS en memoria en vez de en PostgreSQL. Los registros se pierden al reiniciar el servidor.
- **Solución**: Migrar el `authController` para usar la tabla `usuarios` de PostgreSQL.

### 2. `data/users.json` con contraseñas en texto plano
- **Archivo**: `data/users.json`
- **Problema**: Contiene usuarios con contraseñas en texto plano. Sigue en el repositorio.
- **Solución**: Eliminar o ignorar el archivo del proyecto.

---

## Moderados

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
