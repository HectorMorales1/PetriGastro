---
name: Vanilla JS
trigger: ["interacción", "javascript", "js", "evento", "dom"]
scope: "*.js"
tools: ["read", "glob", "grep", "edit", "write"]
---

# Skill: Vanilla JS

## Propósito
Crear interactividad con JavaScript vanilla optimizado y performante.

## Reglas JavaScript

1. **Vanilla only**: Sin frameworks (jQuery, etc.)
2. **Deferred loading**: `<script defer>` al final de `<body>`
3. **ES6+**: Usar const/let, arrow functions, template literals
4. **Event delegation**: Un listener en parent para múltiples elementos
5. **Lazy loading**: Para scripts no críticos

## Estructura Recomendada

```javascript
(function() {
  'use strict';

  document.addEventListener('DOMContentLoaded', () => {
    init();
  });

  function init() {
    initSmoothScroll();
    initMobileMenu();
    initLazyLoading();
  }

  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });
  }

  function initMobileMenu() {
    const menuToggle = document.querySelector('.menu-toggle');
    const nav = document.querySelector('nav');
    
    if (menuToggle && nav) {
      menuToggle.addEventListener('click', () => {
        nav.classList.toggle('active');
        menuToggle.setAttribute('aria-expanded', 
          nav.classList.contains('active')
        );
      });
    }
  }

  function initLazyLoading() {
    if ('IntersectionObserver' in window) {
      const images = document.querySelectorAll('img[data-src]');
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
            observer.unobserve(img);
          }
        });
      });
      images.forEach(img => observer.observe(img));
    }
  }
})();
```

## SEO JavaScript Considerations

- **Progressive Enhancement**: Funcionalidad debe existir sin JS
- **Core Web Vitals**: Minimizar JS que bloquee render
- **CLS Prevention**: No insertar contenido que cause shift
- **No redirect con JS**: Usar server-side redirect

## Patterns Comunes

| Pattern | Uso |
|--------|-----|
| Event delegation | Múltiples items en lista |
| Intersection Observer | Lazy loading, animaciones al scroll |
| Debounce | Resize, scroll events |
| Template literals | HTML dinámico |