---
name: Images Optimization
trigger: ["imagen", "foto", "optimizar", "webp", "lazy"]
scope: "*.{html,css}"
tools: ["read", "glob", "grep", "edit", "write"]
---

# Skill: Images Optimization

## Propósito
Optimizar imágenes para Core Web Vitals (especialmente LCP y CLS).

## Formatos Modernos

| Formato | Uso | Compatibilidad |
|--------|-----|---------------|
| **WebP** | Fotos, imágenes con transparencia | 96%+ |
| **AVIF** | Máxima compresión | 85%+ (fallback a WebP) |
| **SVG** | Logos, iconos, gráficos | 100% |
| **PNG** | Transparencias complejas | 100% |

## Pipeline de Optimización

1. **Redimensionar**: Solo el tamaño necesario (max 1920px para desktop)
2. **Comprimir**: WebP/AVIF con calidad 80%
3. **Generar variantes**: Mobile (640px), Tablet (1024px), Desktop (1920px)
4. **Lazy loading**: `loading="lazy"` para imágenes below-the-fold

## HTML Optimizado

```html
<!-- Hero (Above-the-fold - NO lazy) -->
<img 
  src="img/hero-1920.webp" 
  srcset="img/hero-640.webp 640w,
          img/hero-1024.webp 1024w,
          img/hero-1920.webp 1920w"
  sizes="(max-width: 640px) 100vw, 1920px"
  alt="Chef Juan preparando pasta fresca"
  width="1920" 
  height="1080"
  fetchpriority="high">

<!-- Below-the-fold -->
<img 
  src="img/plato-1024.webp"
  srcset="img/plato-640.webp 640w, img/plato-1024.webp 1024w"
  sizes="(max-width: 640px) 100vw, 1024px"
  alt="Risotto de setas silvestres"
  width="1024"
  height="768"
  loading="lazy"
  decoding="async">
```

## Atributos Obligatorios

- **width/height**: Siempre especificar para evitar CLS
- **alt**: Descripción descriptiva con keywords (si relevante)
- **loading**: "eager" para above-fold, "lazy" para below

## Picture Element (Fallbacks)

```html
<picture>
  <source srcset="img/plato.avif" type="image/avif">
  <source srcset="img/plato.webp" type="image/webp">
  <img 
    src="img/plato.jpg" 
    alt="Paella Valenciana tradicional"
    width="800"
    height="600"
    loading="lazy">
</picture>
```

## Iconos y Logos

```html
<!-- SVG inline para critical -->
<svg>
  <use href="#icon-logo"></use>
</svg>

<!-- O optimizar con picture -->
<picture>
  <source srcset="logo.svg" type="image/svg+xml">
  <img src="logo.png" alt="Logo Chef" width="200" height="60">
</picture>
```

## CDNs y Lazy Loading

- **Cloudflare**: CDN gratuito con auto-optimización
- **Squoosh.app**: Compresión manual
- **Native lazy**: `loading="lazy"` en Chrome/Firefox/Safari

## Errors Graves

- ❌ Imágenes sin dimensiones (causa CLS)
- ❌ JPG > 200KB
- ❌ PNG sin comprimir
- ❌ below-the-fold sin lazy loading
- ❌ Alt texto vacío o genérico ("imagen1")