Fase 1: Seguridad
1. Sistema de auth mejorado
   - Eliminar passwords en texto plano de users.json
   - Usar hash SHA-256 en cliente
   - Generar tokens de sesión más seguros
   - Añadir protección contra ataques de fuerza bruta
Fase 2: Funcionalidad
2. Sección CTA Final (falta en el HTML)
   - Añadir section con video/image background
   - Heading: "Tu próxima comida es una historia por escribir"
   - Glassmorphism overlay
3. Búsqueda en menú
   - Input de búsqueda con debounce
   - Filtrado en tiempo real de los platos
   - Tecla ESC para cerrar
4. Formulario de reservas
   - Crear modal/slide-out con formulario
   - Campos: nombre, fecha, hora, personas, teléfono
   - Validación en tiempo real
   - Envío por WhatsApp
5. FAQ
   - Añadir sección collapsible con preguntas frecuentes
   - Preguntas: Horarios, Delivery, Cancelaciones, Alergenos, etc.
6. Galería con Lightbox
   - Click en imágenes → modal拡大
   - Navegación con flechas
   - Cerrar con ESC o click outside
7. Botón llamada directa
   - Añadir en header o footer linktel:+34600123456
   - Icono de teléfono visible
8. Página 404
   - Crear página personalizada
   - Logo, mensaje, botón volver al inicio
Fase 3: Rendimiento y PWA
9. PWA
   - Crear manifest.json
   - Añadir Service Worker para offline
   - Iconos PWA (192x192, 512x512)
   - Theme color configurado
10. Optimización de imágenes
    - Usar formato AVIF con fallback WebP
    - Picture element con srcset completo
    - Blur placeholder para lazy loading
Fase 4: Contenido
11. Menú expandido
    - Añadir más platos (mínimo 12 items)
    - Categoría adicionales: Postres, Bebidas
12. Stats dinámicos
    - Mover a data/stats.json
13. Testimonios mejorados
    - Añadir más testimonios
    - Sistema de rating visual animado
Fase 5: Accesibilidad
14. Mejoras a11y
    - Focus trap en modales
    - Skip links mejorados
    - ARIA live regions para notificaciones
    - Soporte para screen readers