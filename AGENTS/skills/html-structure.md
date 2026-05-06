---
name: HTML Structure
trigger: ["estructura", "html", "semántico", "header", "nav", "main"]
scope: "*.html"
tools: ["read", "glob", "grep", "edit", "write"]
---

# Skill: HTML Structure

## Propósito
Crear estructura HTML semántica optimizada para SEO y accesibilidad.

## Reglas de Semántica HTML5

| Etiqueta | Uso |
|---------|-----|
| `<header>` | Navegación principal y logo |
| `<nav>` | Menú de navegación |
| `<main>` | Contenido principal (solo uno por página) |
| `<article>` | Contenido independiente (platos, reseñas) |
| `<section>` | Secciones temáticas |
| `<aside>` | Contenido relacionado/barra lateral |
| `<footer>` | Pie de página con contacto |
| `<h1>`-`<h6>` | Jerarquía de encabezados (un solo h1) |

## Reglas SEO

1. **Un solo `<h1>`** por página con keyword principal
2. **Jerarquía correcta**: h1 → h2 → h3 (no saltarse niveles)
3. **Atributos alt** en todas las imágenes
4. **Lang attribute** en `<html>`: `<html lang="es">`
5. **Meta charset**: UTF-8
6. **Viewports**: Meta viewport para mobile

## Plantilla Base SEO

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Chef [Nombre] - [Especialidad] en [Ciudad]</title>
  <meta name="description" content="[Descripción de 150-160 caracteres con keywords]">
</head>
<body>
  <header>
    <nav>
      <a href="/">Logo</a>
      <ul>
        <li><a href="#sobre">Sobre Mí</a></li>
        <li><a href="#menu">Menú</a></li>
        <li><a href="#contacto">Contacto</a></li>
      </ul>
    </nav>
  </header>
  <main>
    <section id="hero">
      <h1>Chef [Nombre]</h1>
      <p>[Keyword principal] en [Ciudad]</p>
    </section>
    <section id="sobre">
      <h2>Sobre Mí</h2>
    </section>
    <section id="menu">
      <h2>Menú</h2>
    </section>
    <section id="contacto">
      <h2>Contacto</h2>
    </section>
  </main>
  <footer>
    <p>&copy; 2026 Chef [Nombre]. Todos los derechos reservados.</p>
  </footer>
</body>
</html>
```

## Errores Comunes a Evitar

- ❌ Usar `<div>` para todo
- ❌ Multiples `<h1>` en una página
- ❌ Saltar niveles de heading (h1 → h4)
- ❌ Imágenes sin atributo alt
- ❌ Olvidar lang="es"