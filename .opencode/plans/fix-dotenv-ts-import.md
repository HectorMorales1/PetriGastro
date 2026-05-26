# Plan: Corregir carga de dotenv en server.ts

## Problema
En `server.ts`, los `import` estáticos de TypeScript se evalúan antes del código del cuerpo del módulo. Esto significa que `dotenv.config()` (línea 2) se ejecuta DESPUÉS de que `import app from './app'` ya haya cargado `db.ts`, que necesita las variables de entorno.

## Solución

### `server/server.ts`
Reemplazar:
```typescript
import dotenv from 'dotenv'
dotenv.config()
import https from 'https'
```
Por:
```typescript
import 'dotenv/config'
import https from 'https'
```

`import 'dotenv/config'` es un side-effect import que ejecuta `dotenv.config()` automáticamente cuando el módulo es evaluado, ANTES de que se carguen los módulos dependientes.

## Impacto
- No hay cambios de funcionalidad
- `dotenv` seguirá estando disponible como dependencia
- Las variables de entorno estarán disponibles cuando `db.ts` se cargue
