# Skill: SEO Expert

## Metadata
- **Nombre**: Experto SEO
- **Trigger**: Automático - cuando se haga cualquier modificación que afecte interfaces, contenido o estructura web
- **Scope**: SEO on-page, meta tags, estructura semántica, rendimiento web
- **Tools**: Análisis HTML, optimización de contenido, auditoría SEO
- **Última actualización**: 2026-04-10

---

## 1. Descripción

Esta skill actúa como un experto en SEO y debe evaluar y aplicar optimizaciones automáticamente para garantizar que el SEO mejore sin que el usuario lo pida.

---

## 2. Áreas de Optimización

### 2.1 Meta Tags
- ✅ Title optimizado (50-60 caracteres)
- ✅ Meta description (150-160 caracteres)
- ✅ Canonical URL
- ✅ Open Graph tags
- ✅ Twitter Card tags

### 2.2 Estructura Semántica
- ✅ Header semántico (`<header>`, `<h1>`, `<h2>`, etc.)
- ✅ Navigation semántica (`<nav>`)
- ✅ Main content (`<main>`, `<article>`, `<section>`)
- ✅ Footer semántico (`<footer>`)
- ✅ Uso correcto de headings (jerarquía h1 → h6)

### 2.3 Rendimiento
- ✅ Imágenes optimizadas (WebP, lazy loading)
- ✅ Minificación de CSS/JS
- ✅ Critical CSS inline
- ✅ Preload de recursos críticos
- ✅ Defer/async de scripts

### 2.4 Contenido
- ✅ URLs amigables (slug)
- ✅ Texto alternativo en imágenes (`alt`)
- ✅ Links internos coherentes
- ✅ Schema markup (JSON-LD)
- ✅ Vocabulario semántico

### 2.5 Accesibilidad
- ✅ Atributos ARIA donde sea necesario
- ✅ Contraste de colores adecuado
- ✅ Navegación por teclado
- ✅ Etiquetas de formulario

---

## 3. Flujo de Ejecución

### 3.1 Análisis Inicial
1. Leer archivo HTML actual
2. Detectar problemas SEO existentes
3. Evaluar estructura semántica
4. Identificar oportunidades de mejora

### 3.2 Optimización
Para cada área identificada:
1. Generar propuesta de mejora
2. Implementar cambios
3. Verificar que no rompan funcionalidad

### 3.3 Validación
- ✅ Validar HTML semántico
- ✅ Verificar meta tags
- ✅ Comprobar rendimiento
- ✅ Probar en dispositivos

---

## 4. Reglas de Autoinvocación

Esta skill se autoinvoca cuando:
- ✅ Se modifica `index.html` o cualquier archivo de interfaz
- ✅ Se añade nuevo contenido textual
- ✅ Se cambia la estructura del DOM
- ✅ Se добавляет nuevos scripts o estilos
- ✅ Se crea nueva página
- ✅ Se modifica el título o meta descripción

---

## 5. Checklist de Optimización

### Always Check:
- [ ] Title tag presente y único
- [ ] Meta description presente (150-160 chars)
- [ ] Un solo H1 por página
- [ ] Imágenes tienen atributo alt
- [ ] Links tienen texto descriptivo
- [ ] URLs son amigables (sin parámetros largos)

### Performance:
- [ ] Imágenes usan formato moderno (WebP)
- [ ] Imágenes tienen lazy loading
- [ ] CSS minificado en producción
- [ ] JS diferido o asíncrono

### Estructura:
- [ ] Header semántico
- [ ] Nav para navegación principal
- [ ] Main para contenido principal
- [ ] Footer con información relevante
- [ ] Breadcrumbs si aplica

---

## 6. Schema Markup (JSON-LD)

Siempre que sea aplicable, añadir:
- Organization schema
- WebSite schema
- Product/Service schema (si aplica)
- FAQ schema (si aplica)

---

## 7. Registro en Engram

Guardar en Engram:
- Problemas SEO detectados
- Optimizaciones aplicadas
- Mejoras de rendimiento
- Suggestions para futuro

---

## 8. Notas

- Priorizar impacto: meta tags > contenido > estructura > rendimiento
- No sobre-optimizar (evitar keyword stuffing)
- Mantener balance entre SEO y usabilidad
- Documentar cambios para referencia futura