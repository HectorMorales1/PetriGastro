---
name: SEO Basics
trigger: ["seo", "google", "ranking", "meta", "schema"]
scope: "*.html"
tools: ["read", "glob", "grep", "websearch", "edit", "write"]
---

# Skill: SEO Basics

## Propósito
Optimizar página para máximo posicionamiento en Google.

## Factores de Ranking Críticos 2026

| Factor | Peso | Implementación |
|--------|------|----------------|
| **Contenido relevante** | Alto | Keywords en h1, primeros 100 palabras |
| **Backlinks** | Alto | Calidad sobre cantidad |
| **E-E-A-T** | Alto | Experiencia, autoridad, confianza |
| **Core Web Vitals** | Medio | LCP < 2.5s, CLS < 0.1, INP < 200ms |
| **Mobile-first** | Alto | Diseño responsive |
| **Schema.org** | Medio | Rich snippets en SERP |
| **URLs amigables** | Bajo | clean-url.com/pagina |

## Meta Tags Obligatorios

```html
<title>Chef Juan García - Cocina Italiana en Madrid | Restaurante</title>
<meta name="description" content="Chef Juan García ofrece cocina italiana auténtica en Madrid. 
Especialidades: pasta fresca, risotto, tortillas. Reservas: 912 345 678.">
<meta name="author" content="Chef Juan García">
<meta name="robots" content="index, follow">

<link rel="canonical" href="https://chefjuangarcia.com/">
<link rel="alternate" hreflang="es" href="https://chefjuangarcia.com/">
```

## Open Graph (Redes Sociales)

```html
<meta property="og:type" content="restaurant.restaurant">
<meta property="og:title" content="Chef Juan García - Cocina Italiana en Madrid">
<meta property="og:description" content="Experiencia gastronómica italiana auténtica">
<meta property="og:image" content="https://chefjuangarcia.com/img/og-image.jpg">
<meta property="og:url" content="https://chefjuangarcia.com/">
<meta property="og:site_name" content="Chef Juan García">
```

## Schema.org (JSON-LD)

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Restaurant",
  "name": "Chef Juan García",
  "image": "https://chefjuangarcia.com/img/restaurant.jpg",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Calle Mayor 45",
    "addressLocality": "Madrid",
    "postalCode": "28013",
    "addressCountry": "ES"
  },
  "telephone": "+34912345678",
  "priceRange": "€€-€€€",
  "servesCuisine": "Italian",
  "openingHoursSpecification": [
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      "opens": "13:00",
      "closes": "23:00"
    }
  ],
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "reviewCount": "127"
  }
}
</script>
```

## Local SEO (Google Business Profile)

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FoodEstablishment",
  "name": "Chef Juan García",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Madrid"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": "40.416775",
    "longitude": "-3.703790"
  }
}
</script>
```

## Keywords Strategy

1. **Primary**: "[especialidad] en [ciudad]" (ej: "cocina italiana en Madrid")
2. **Secondary**: "chef [especialidad]", "restaurante [tipo]"
3. **Long-tail**: "donde comer [comida] cerca de [barrio]"

## ERRORES SEO Graves

- ❌ Title duplicado en múltiples páginas
- ❌ Description vacía o > 160 caracteres
- ❌ sin Canonical URL
- ❌ Contenido thin (poco contenido)
- ❌ Imágenes sin alt text
- ❌ Links rotos (404)