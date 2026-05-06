---
name: Performance Optimization
trigger: ["optimizar", "rendimiento", "performance", "rapidez", "velocidad", "lighthouse", "web vitals", "core web"]
scope: "*.html, *.css, *.js"
tools: ["read", "glob", "grep", "edit", "write"]
---

# Skill: Performance Optimization

## Propósito
Garantizar que todo código creado cumpla con las mejores prácticas de rendimiento web para maximizar velocidad y Core Web Vitals.

## Reglas de Rendimiento

### 1. Imágenes

**HTML - Siempre incluir:**
```html
<img 
  src="imagen.jpg"
  srcset="imagen-400.jpg 400w, imagen-600.jpg 600w, imagen-800.jpg 800w"
  alt="Descripción"
  width="600" height="400"
  loading="lazy" 
  decoding="async"
  fetchpriority="low"
>
```

**Reglas:**
- `loading="eager"` + `fetchpriority="high"` para above-the-fold
- `loading="lazy"` + `fetchpriority="low"` para imágenes below-fold
- SIEMPRE incluir `width` y `height` para evitar CLS
- `decoding="async"` para imágenes no críticas
- Usar `srcset` para imágenes responsive

### 2. Fuentes

**HTML - Carga asíncrona:**
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preload" as="style" href="fuentes.css">
<link href="fuentes.css" rel="stylesheet" media="print" onload="this.media='all'">
<noscript><link href="fuentes.css" rel="stylesheet"></noscript>
```

**CSS:**
- NUNCA usar `@import` - bloquea renderizado
- Usar `font-display: swap` (ya viene por defecto en Google Fonts)

### 3. CSS Crítico

**HTML - NO usar:**
```html
<!-- MALO - bloquea renderizado -->
<link rel="stylesheet" href="index.css">
```

**HTML - Optimizado:**
```html
<!-- Mejor - carga no bloqueante -->
<link rel="stylesheet" href="index.css" media="print" onload="this.media='all'">
```

**CSS - NUNCA usar:**
```css
/* MALO */
@import url('fuentes.css');
```

### 4. JavaScript Rendimiento

**Eventos de scroll/throttle con requestAnimationFrame:**
```javascript
function initScrollHandler() {
  let ticking = false;
  
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        // Tu lógica aquí
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
}
```

**IntersectionObserver para animaciones - SIEMPRE unobserve:**
```javascript
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target); // Importante!
    }
  });
}, { rootMargin: '0px 0px -50px 0px' });
```

**Evitar operaciones costosas en scroll:**
- NO calcular layout dentro de scroll handler
- Usar `transform` en lugar de `top/left` para animaciones
- Usar `translate3d` para forzar aceleración GPU

### 5. Recursos Externos

**Preconnect a dominios críticos:**
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preconnect" href="https://images.unsplash.com">
<link rel="preconnect" href="https://cdnjs.cloudflare.com">
```

**第三方 scripts - defer o async:**
```html
<script src="analytics.js" defer></script>
```

### 6. CSS Optimizaciones

**content-visibility para secciones below-fold:**
```css
section.below-fold {
  content-visibility: auto;
  contain-intrinsic-size: 1px 600px;
}
```

**will-change para elementos animados:**
```css
.animate {
  will-change: opacity, transform;
}
```

**Usar translate3d para GPU:**
```css
.animate-fade-up {
  transform: translate3d(0, 30px, 0); /* Mejor que translateY */
}
```

### 7. Accesibilidad - Reduced Motion

**JavaScript - Detectar preferencia:**
```javascript
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (prefersReducedMotion) {
  document.documentElement.classList.add('reduce-motion');
}

window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => {
  document.documentElement.classList.toggle('reduce-motion', e.matches);
});
```

**CSS - Deshabilitar animaciones:**
```css
.reduce-motion * {
  animation-duration: 0.01ms !important;
  animation-iteration-count: 1 !important;
  transition-duration: 0.01ms !important;
}
```

## Checklist de Optimización

Antes de hacer commit, verificar:

- [ ] Imágenes tienen `width`, `height`, `loading`, `decoding`
- [ ] Above-the-fold tiene `loading="eager" fetchpriority="high"`
- [ ] Below-the-fold tiene `loading="lazy" fetchpriority="low"`
- [ ] Fuentes cargan asíncronamente (no bloquean render)
- [ ] CSS NO tiene `@import`
- [ ] Preconnect a recursos externos (fonts, imágenes, CDNs)
- [ ] JS usa `requestAnimationFrame` en scroll
- [ ] IntersectionObserver hace `unobserve` en elementos
- [ ] Soporte `reduced-motion` implementado
- [ ] `will-change` y `translate3d` donde aplica

## Core Web Vitals Targets

| Métrica | Target | Cómo optimizar |
|---------|--------|----------------|
| LCP | < 2.5s | preload imagen hero, font-display: swap |
| FID | < 100ms | defer JS no crítico,IntersectionObserver |
| CLS | < 0.1 | width/height en imágenes, content-visibility |
| TBT | < 200ms | minimal main-thread work, code-split |