# Problema: Service Worker del PWA cachea CSS y no se actualiza en desarrollo

## Síntomas
- Los cambios en `index.css` no se reflejan en el navegador (modo claro/oscuro, colores de cards, etc.)
- Las APIs responden correctamente (304) pero los assets estáticos (CSS, HTML) se sirven desde caché
- En DevTools > Network se ven errores `ERR_INTERNET_DISCONNECTED` en documentos HTML

## Causa
`vite-plugin-pwa` con Workbox registra un Service Worker que cachea todos los estáticos. Si se hizo un `npm run build` anteriormente, el SW queda registrado en el navegador y sigue sirviendo archivos viejos incluso cuando el dev server está corriendo.

## Solución temporal (en el navegador)
1. Abrir DevTools (F12)
2. Ir a **Application** > **Storage**
3. Pulsar **"Clear site data"** (borra SW + toda la caché)
4. Recargar con Ctrl+F5

## Solución definitiva (en código)
Modificar `client/vite.config.ts` para que el PWA solo se active en producción:

```ts
import { defineConfig } from 'vite'

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    tailwindcss(),
    mode === 'production' && VitePWA({
      registerType: 'autoUpdate',
      // ...resto de la config
    }),
    compression({ algorithm: 'gzip', ext: '.gz' })
  ].filter(Boolean),
  // ...
}))
```

Esto evita que el Service Worker se registre durante `npm run dev`.
