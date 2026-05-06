---
name: SEO Expert
trigger: ["seo", "google", "ranking", "meta", "schema", "interfaz", "contenido", "estructura web"]
scope: "*.html"
tools: ["read", "glob", "grep", "websearch", "edit", "write"]
---

# Skill: SEO Expert

## Propósito
Optimizar página para máximo posicionamiento en Google. Autoinvocada siempre que se modifique interfaz/contenido/estructura.

## Factores Ranking 2026

| Factor | Peso | Implementación |
|--------|------|----------------|
| Contenido relevante | Alto | Keywords en h1, primeros 100 palabras |
| Backlinks | Alto | Calidad sobre cantidad |
| E-E-A-T | Alto | Experiencia, autoridad, confianza |
| Core Web Vitals | Medio | LCP < 2.5s, CLS < 0.1, INP < 200ms |
| Mobile-first | Alto | Diseño responsive |
| Schema.org | Medio | Rich snippets en SERP |

## Meta Tags Obligatorios

```html
<title>Chef [Nombre] - [Especialidad] en [Ciudad] | Restaurante</title>
<meta name="description" content="[150-160 chars con keywords]">
<meta name="author" content="Chef [Nombre]">
<meta name="robots" content="index, follow">
<link rel="canonical" href="https://[dominio]/">
```

## Open Graph

```html
<meta property="og:type" content="restaurant.restaurant">
<meta property="og:title" content="Chef [Nombre] - [Especialidad] en [Ciudad]">
<meta property="og:description" content="[Descripción experiencia]">
<meta property="og:image" content="https://[dominio]/img/og-image.jpg">
<meta property="og:url" content="https://[dominio]/">
```

## Schema.org (JSON-LD)

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Restaurant",
  "name": "Chef [Nombre]",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "[Calle]",
    "addressLocality": "[Ciudad]",
    "postalCode": "[CP]",
    "addressCountry": "ES"
  },
  "telephone": "+34[telefono]",
  "priceRange": "€€-€€€",
  "servesCuisine": "[Tipo cocina]",
  "openingHoursSpecification": [...],
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "[X.X]",
    "reviewCount": "[N]"
  }
}
</script>
```

## Estructura Semántica

- ✅ Un solo `<h1>` con keyword principal
- ✅ Jerarquía h1 → h2 → h3 (sin saltos)
- ✅ `<header>`, `<nav>`, `<main>`, `<footer>` semánticos
- ✅ `lang="es"` en `<html>`
- ✅ Imágenes con `alt` descriptivo

## Checklist

- [ ] Title único (50-60 chars)
- [ ] Meta description (150-160 chars)
- [ ] Canonical URL
- [ ] Open Graph tags
- [ ] Schema markup
- [ ] Un solo H1
- [ ] Imágenes con alt
- [ ] URLs amigables
- [ ] WebP + lazy loading
- [ ] CSS/JS minificado

## Errores Graves

- ❌ Title duplicado
- ❌ Description vacía o > 160 chars
- ❌ Sin canonical
- ❌ Contenido thin
- ❌ Imágenes sin alt
- ❌ Links rotos

## Autoinvocación

Se activa cuando:
- ✅ Se modifica index.html u otro HTML
- ✅ Se añade contenido textual
- ✅ Se cambia estructura DOM
- ✅ Se modifica title o meta description
- ✅ Se crea nueva página
