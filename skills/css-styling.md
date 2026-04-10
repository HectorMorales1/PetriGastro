---
name: CSS Styling
trigger: ["estilo", "css", "diseño", "responsive", "flexbox", "grid"]
scope: "*.css"
tools: ["read", "glob", "grep", "edit", "write"]
---

# Skill: CSS Styling

## Propósito
Crear estilos CSS profesionales, responsive y optimizados para Core Web Vitals.

## Reglas CSS Moderno

1. **Mobile-first**: Estilos base para móvil, luego `@media (min-width: ...)` para desktop
2. **Variables CSS**: Usar custom properties para colores, spacing
3. **Reset básico**: Normalizar box-sizing y márgenes
4. **Unidades relativas**: rem/em para tipografía, % para contenedores
5. **No usar !important**: Salvo excepciones muy controladas

## Estructura Recomendada

```css
:root {
  --color-primary: #1a1a1a;
  --color-accent: #c9a227;
  --color-bg: #ffffff;
  --color-text: #333333;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 2rem;
  --spacing-xl: 4rem;
  --font-main: 'Inter', sans-serif;
  --font-display: 'Playfair Display', serif;
}

*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  scroll-behavior: smooth;
}

body {
  font-family: var(--font-main);
  color: var(--color-text);
  background: var(--color-bg);
  line-height: 1.6;
}

img {
  max-width: 100%;
  height: auto;
  display: block;
}
```

## Responsive (Mobile-First)

```css
/* Móvil por defecto */
.container {
  width: 100%;
  padding: 0 var(--spacing-md);
}

/* Tablet */
@media (min-width: 768px) {
  .container {
    max-width: 720px;
    margin: 0 auto;
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .container {
    max-width: 1200px;
  }
}
```

## SEO CSS Considerations

- **LCP (Largest Contentful Paint)**: Minimizar CSS crítico above-the-fold
- **CLS (Cumulative Layout Shift)**: Definir dimensiones de imágenes
- **Critical CSS**: Estilos inline en `<head>`, resto en archivo externo
- **Font loading**: Usar `font-display: swap` para evitar FOIT