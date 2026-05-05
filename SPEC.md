# SPEC.md - PetriGastro 2026
## Landing Page Vanguardista - Minimalismo Cálido Premium

---

## 1. Concepto & Visión

**PetriGastro** se reinventa como una experiencia digital inmersiva donde la gastronomía artesanal cobra vida. El diseño fusiona la calidez de los ingredientes frescos con la sofisticación de las interfaces de 2026: espacios que respiran, tipografía que emociona, y microinteracciones que hacen sentir cada plato como una obra de arte.

La página no es un catálogo, es un **viaje sensorial** donde cada scroll revela una nueva capa de la experiencia gastronómica.

---

## 2. Design Language

### 2.1 Paleta de Colores (5 colores)
```
--color-crema:       #F5F0E8    (Fondo principal - calidez orgánica)
--color-terracota:   #C4785A    (Primario - fuego artesanal)
--color-verde-oliva: #6B7B5E    (Secundario - ingrediente fresco)
--color-oro:         #D4A853    (Acento vibrante - premium/lujo)
--color-carbon:      #2D2A26    (Texto/contraste - tierra)
```

### 2.2 Tipografía
```
Display/Headlines: "Playfair Display" (Serif elegante, impacto emocional)
Body/Copy:         "Inter" (Sans-serif neutral, legibilidad máxima)
Accent:            "Caveat" (Manuscrita para firmas/call-to-action especiales)
```

### 2.3 Sistema Espacial (8pt Grid)
```
--space-xs:   0.5rem   (8px)
--space-sm:   1rem      (16px)
--space-md:   1.5rem    (24px)
--space-lg:   2.5rem    (40px)
--space-xl:   4rem      (64px)
--space-2xl:  6rem      (96px)
--space-3xl:  8rem      (128px)
```

### 2.4 Filosofía de Movimiento
- **Entrada**: Fade-up suave (opacity 0→1, translateY 30px→0, 600ms ease-out)
- **Hover**: Scale sutil (1→1.02), sombra que se eleva
- **Scroll**: Parallax suave en backgrounds (0.3x speed)
- **Transiciones**: 300-400ms ease-out para todo
- **Stagger**: 100ms entre elementos de grupo

### 2.5 Assets & Efectos
- **Sombras**: Suaves, cálidas (box-shadow con tinte amarillento)
- **Bordes**: Radio generoso (16-24px) - Soft UI
- **Imágenes**: Fotografía inmersiva, bordes suaves
- **Texturas**: Subtle grain overlay en secciones clave

---

## 3. Arquitectura Visual - Bento Grid System

### Above The Fold (100vh)
```
┌─────────────────────────────────────────────────────┐
│                    HEADER (sticky)                   │
├─────────────────────────────────────────────────────┤
│  HERO - Bento Grid 2x2                              │
│  ┌─────────────────┬───────────────────────────────┤
│  │                 │                               │
│  │  TITULAR GRANDE │    IMAGEN HERO               │
│  │  (3 columnas)   │    (Clip-path orgánico)      │
│  │                 │                               │
│  │  CTA Principal  ├───────────────────────────────┤
│  │  Badge Social   │    MINI BENTO: 3 features     │
│  └─────────────────┴───────────────────────────────┤
└─────────────────────────────────────────────────────┘
```

### Secciones Posteriores (Scrollytelling)
```
┌─────────────────────────────────────────────────────┐
│  PROCESO - Bento Horizontal 4 pasos                  │
│  [1] → [2] → [3] → [4]  (line timeline animada)    │
├─────────────────────────────────────────────────────┤
│  MENÚ - Bento Grid Mixto                            │
│  ┌───────────┬───────────┬───────────┐             │
│  │ PLATO     │ PLATO     │ PLATO     │             │
│  │ GRANDE    │ GRANDE    │ GRANDE    │             │
│  │ (2 cols)  │           │           │             │
│  ├───────────┼───────────┼───────────┤             │
│  │ PLATO     │ PLATO     │ PLATO     │             │
│  │           │           │           │             │
│  └───────────┴───────────┴───────────┘             │
├─────────────────────────────────────────────────────┤
│  CHEF - Split Asimétrico                           │
│  [IMAGEN 60%] [CONTENIDO 40%]                       │
├─────────────────────────────────────────────────────┤
│  TESTIMONIOS - Carousel 3D con Glassmorphism       │
│  [ Card ] [ Card ] [ Card ]                        │
├─────────────────────────────────────────────────────┤
│  CTA FINAL - Full-width con Video Background        │
├─────────────────────────────────────────────────────┤
│  FOOTER - Minimalista                              │
└─────────────────────────────────────────────────────┘
```

---

## 4. Secciones Detalladas

### 4.1 HEADER (Sticky, Glassmorphism sutil)
- **Logo**: Texto con Caveat font + icono fuego SVG animado
- **Nav**: Links con underline animado en hover
- **CTA**: Botón "Reservar" con pulse animation sutil
- **Carrito**: Icono con badge animado
- **Scroll behavior**: Background blur al hacer scroll (backdrop-filter)

### 4.2 HERO SECTION (Above the fold - 100vh)
**Copywriting:**
```
Tag: "Cocina Artesanal · Madrid"
H1: "Sabores que 
     cuentan historias"
Subtitle: "Platos preparados con pasión, 
           ingredientes de temporada y 
           el toque inconfundible de Chef Petri"
CTA: "Descubre el Menú" (primario)
CTA2: "Hace tu pedido" (outline)
```

**Layout Bento:**
- Grid CSS 12 columnas
- Título ocupa cols 1-5
- Imagen hero ocupa cols 6-12 (con clip-path orgánico)
- Mini-bento inferior: 3 feature cards

**Animaciones:**
- Título: Letters que entran con stagger
- Imagen: Fade-in desde derecha con parallax sutil
- Features: Fade-up escalonado

### 4.3 PROCESO (4 pasos horizontales)
**Copywriting:**
```
"Elige → Personaliza → Reservamos → Disfrutas"
```

**Layout:**
- 4 cards en línea horizontal
- Línea de timeline animada entre cards
- Iconos con micro-animación continua (float)

**Animaciones:**
- Cards aparecen con stagger al scroll
- Línea se dibuja progresivamente
- Iconos flotan suavemente (loop)

### 4.4 MENÚ (Bento Grid Mixto)
**Estructura:**
- Filtros de categoría (chips estilo pill)
- Grid con variación de tamaños:
  - Platos destacados: 2x1
  - Platos normales: 1x1
- Card hover: Elevación + imagen zoom suave

**Card Producto:**
```
[Imagen 16:9 con overlay gradient]
[Tag categoría - pill]
[Nombre plato - Playfair]
[Descripción - 2 líneas max]
[Precio | Botón añadir]
```

### 4.5 CHEF (Split Asimétrico)
**Copywriting:**
```
Tag: "El Artista"
H2: "Pasión hereda
     de generaciones"
Bio: "Desde los fogones de casa hasta 
      las cocinas más exigentes..."
[Estadísticas: años exp, platos creados, premios]
[Firma manuscrita animada]
```

**Layout:**
- Imagen 60% con parallax
- Contenido 40% con alineación vertical centrada
- Badge experiencia superpuesto en imagen

### 4.6 TESTIMONIOS (Carousel 3D)
**Card:**
- Glassmorphism (backdrop-blur, fondo semi-transparente)
- Avatar + Nombre + Rol
- Estrellas con animación de llenado
- Quote con comillas decorativas grandes
- Touch/drag enabled en móvil

### 4.7 CTA FINAL
**Copywriting:**
```
H2: "Tu próxima comida 
     es una historia por escribir"
Sub: "Reserva hoy y recibe 15% de descuento 
      en tu primer pedido"
CTA: "Reclamar Descuento"
```

**Diseño:**
- Background: Video/Imagen con overlay oscuro
- Texto centrado con glassmorphism
- Formulario de email inline

### 4.8 FOOTER
- Minimalista: Logo + Links + Social + Copyright
- Dark mode con texto claro
- Iconos sociales con hover glow

---

## 5. Microinteracciones Detalladas

### Botones
- Hover: Scale 1.02 + sombra eleva + color shift
- Active: Scale 0.98 (tactile feedback)
- Loading: Spinner integrado
- Success: Checkmark con bounce

### Cards de Menú
- Hover: translateY(-8px) + shadow aumenta
- Imagen: scale 1.05 con overflow hidden
- Badge de categoría: glow sutil al hover

### Navegación
- Links: Underline que crece de izquierda a derecha
- Active section: Indicador visual
- Mobile: Menu slide desde derecha con stagger

### Formularios
- Focus: Border color shift + label float
- Error: Shake animation + color rojo
- Success: Border verde + checkmark

### Scroll
- Progress bar en top (color terracota)
- Scroll-triggered animations (IntersectionObserver)
- Parallax en backgrounds (requestAnimationFrame)

---

## 6. UX Conversacional (Zero UI Elements)

### Formulario Progresivo
- Solo 3 campos iniciales: Nombre, Fecha, Email
- Campos adicionales se revelan según respuesta
- Microcopy motivacional entre campos
- Progress indicator visual

### Chat Widget (Opcional)
- Launcher flotante esquina inferior
- Primer mensaje automático: "¿En qué podemos ayudarte?"
- Respuestas predefinidas rápidas

### Voice Input
- Botón de micrófono en buscador
- Transcripción en tiempo real

---

## 7. Personalización Predictiva (IA)

### Adaptaciones en Tiempo Real:
```
- Hora del día → Hero message:
  * 8-12h: "Buenos días, ¿desayuno?"
  * 12-16h: "Hora de comer"
  * 19-23h: "Cena especial"

- Ubicación → Ajustar CTA urgencia:
  * Cerca: "Recoge en 15 min"
  * Lejos: "Delivery disponible"

- Historial → Personalizar menú:
  * returning visitor: "Tu favorito de nuevo?"

- Dispositivo → Optimizar layout:
  * Móvil: CTA sticky bottom
  * Desktop: Más whitespace
```

---

## 8. Accesibilidad (WCAG 2.1 AA+)

### Requisitos Obligatorios:
- [ ] Ratio contraste mínimo 4.5:1 (texto) / 3:1 (UI grande)
- [ ] Focus visible en todos los interactivos
- [ ] Navegación por teclado completa
- [ ] Skip to content link
- [ ] ARIA labels en iconos
- [ ] Alt text descriptivo en imágenes
- [ ] Reduced motion media query
- [ ] Preferencias de usuario respetadas (colorScheme)

### Neurodiversidad:
- [ ] Tamaños de fuente ajustables
- [ ] Spacing controlable
- [ ] Animaciones reducibles
- [ ] Alto contraste toggle

---

## 9. Dark Mode Inteligente

### Implementación:
```css
@media (prefers-color-scheme: dark) {
  :root {
    --color-bg: #1A1815;
    --color-surface: #252220;
    --color-text: #F5F0E8;
    --color-text-muted: #A89F94;
  }
}
```

### Toggle Manual:
- Icono sol/luna en header
- Preferencia guardada en localStorage
- Transición suave 300ms

### Beneficios OLED:
- Fondos #000000 puro en modo oscuro
- Elementos con opacity para ahorro real
- Imágenes con filter para ajuste

---

## 10. Optimización SEO 2026

### Core Web Vitals:
- LCP < 2.0s (imágenes next-gen + preload)
- FID < 100ms (código crítico inline)
- CLS < 0.05 (aspect-ratio en imágenes)

### Schema.org (JSON-LD):
```json
{
  "@type": "Restaurant",
  "servesCuisine": ["Spanish", "Mediterranean"],
  "priceRange": "€€-€€€",
  "hasMenu": {...},
  "aggregateRating": {...}
}
```

### Open Graph 2026:
- Meta tags optimizados
- Twitter Cards v2
- Pinterest rich pins
- WhatsApp link preview

---

## 11. Tech Stack

### Archivos:
```
index.html      → Estructura semántica completa
styles.css      → CSS moderno (variables, grid, clamp)
script.js       → Vanilla JS (módulo, defer)
```

### CDN/External:
- Google Fonts: Playfair Display, Inter, Caveat
- Font Awesome 6 (solo iconos necesarios)
- Intersection Observer polyfill (si necesario)

### Imágenes:
- Formato: WebP con fallback JPEG
- Lazy loading: Native + blur placeholder
- Srcset para responsive

---

## 12. Checklist de Implementación

### Fase 1: HTML + CSS Base
- [ ] Estructura semántica HTML5
- [ ] Variables CSS completas
- [ ] Reset + normalize
- [ ] Grid system base
- [ ] Dark mode implementation

### Fase 2: Componentes UI
- [ ] Header sticky + glassmorphism
- [ ] Hero bento grid
- [ ] Feature cards
- [ ] Menu grid + filters
- [ ] Chef split section
- [ ] Testimonials carousel
- [ ] Footer

### Fase 3: Interacciones
- [ ] Scroll animations
- [ ] Parallax effects
- [ ] Microinteractions
- [ ] Cart functionality
- [ ] Form progressive

### Fase 4: UX + Accesibilidad
- [ ] Keyboard navigation
- [ ] Focus states
- [ ] Reduced motion
- [ ] ARIA labels
- [ ] Skip links

### Fase 5: SEO + Performance
- [ ] Schema.org
- [ ] Meta tags
- [ ] Image optimization
- [ ] Critical CSS inline
- [ ] Lazy loading

---

## 13. Copywriting Final

### Headlines:
1. "Sabores que cuentan historias"
2. "Del fuego a tu mesa"
3. "Tradición con carácter propio"

### CTAs:
- "Descubre el menú" / "Explorar"
- "Haz tu pedido" / "Reservar ahora"
- "Llámanos" / "Escríbenos"

### Microcopy:
- Carrito vacío: "Tu cesta espera..."
- Añadir producto: "¡Añadido! Sigue explorando"
- Error: "Ups, algo salió mal. Inténtalo de nuevo"
- Success reserva: "¡Reserva confirmada! Te esperamos"

---

*Documento vivo - Actualizar según feedback y testing*
