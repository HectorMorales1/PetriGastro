import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import compression from 'vite-plugin-compression'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      // Eliminamos la restricción estricta de assets que tumba el build si falta alguno
      manifest: {
        name: 'PetriGastro',
        short_name: 'PetriGastro',
        theme_color: '#C4785A',
        background_color: '#F5F0E8',
        display: 'standalone',
        icons: [
          { src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' }
        ]
      },
      workbox: {
        // Limitamos la PWA para que solo registre lo que genera Vite en la carpeta dist/assets
        globPatterns: ['assets/**/*.{js,css}', 'index.html'],
        // Protegemos el build bloqueando que intente cachear los comprimidos .gz
        globTransforms: [
          (manifestEntries) => {
            const manifest = manifestEntries.filter(entry => !entry.url.endsWith('.gz'));
            return { manifest, warnings: [] };
          }
        ],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 }
            }
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|avif)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 * 30 }
            }
          }
        ]
      }
    }),
    compression({ algorithm: 'gzip', ext: '.gz' })
  ],
  build: {
    chunkSizeWarningLimit: 1000 // Subimos el límite para evitar alertas molestas de peso
  },
  server: {
    port: 5173,
    open: true
  }
})