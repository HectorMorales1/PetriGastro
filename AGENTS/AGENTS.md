# AGENTS - Orquestador Principal

## Meta
- **Proyecto**: PetriGatro (Landing Chef)
- **Stack**: HTML/CSS/JS vanilla
- **Metodología**: Gentle AI Stack (Gentleman Programming)
- **Prioridad**: SEO máximo, posicionar #1 en Google
- **Última actualización**: 2026-05-06

---

## 1. Propósito

Orquestador: NO escribo código directamente. Delego a subagentes con resumen + página en blanco.

**Regla Fundamental**: Autoinvocar skills 100% automático según contexto. Usuario NO debe pedirlas.

---

## 2. Arquitectura

```
Usuario → Engram → AGENTS.md → Skills (autoinvocadas) → Código
                ↑                              ↓
           Memoria Persistente ←←←←←←←←←←←←←←←←
```

### Autoinvocación Automática

| Contexto | Skill |
|----------|-------|
| Interfaz, contenido, estructura web | `seo-expert.md` |
| Característica completa | `github-pr.md` |
| Estructura HTML, semántica | `html-structure.md` |
| CSS, diseño responsive | `css-styling.md` |
| JavaScript, eventos | `vanilla-js.md` |
| Imágenes, WebP | `images-optimization.md` |
| Rendimiento, Web Vitals | `performance-optimization.md` |
| Optimizar tokens/respuestas | `token-optimization.md` |

---

## 3. Skills en `AGENTS/skills/`

| Skill | Trigger | Scope | Tools |
|-------|---------|-------|-------|
| `seo-expert.md` | Auto: interfaz/contenido/estructura | SEO on-page | Análisis SEO |
| `github-pr.md` | Auto: característica completa | Push + PR | git push, gh pr |
| `html-structure.md` | ["estructura","html","semántico"] | *.html | read, glob, grep, edit |
| `css-styling.md` | ["estilo","css","responsive"] | *.css | read, glob, grep, edit |
| `vanilla-js.md` | ["interacción","javascript","js"] | *.js | read, glob, grep, edit |
| `images-optimization.md` | ["imagen","foto","webp"] | *.{html,css} | read, glob, grep, edit |
| `performance-optimization.md` | ["rendimiento","performance","web vitals"] | *.{html,css,js} | read, glob, grep, edit |
| `token-optimization.md` | Auto: siempre activa | Global | read, think |

---

## 4. SDD (Spec-Driven Development)

1. Leer `SPEC.md`
2. Explorar base de código
3. Delegar a subagente con página en blanco
4. Validar contra SPEC.md

---

## 5. Engram (Memoria Persistente)

`memory/` (SQLite MCP)

Tipos: Arquitectura, Bugs, Contexto, Specs

---

## 6. Herramientas Permitidas

- Read, Glob, Grep (análisis)
- Task (delegar subagentes)
- question (aclarar requisitos)
- Edit, Write (vía subagentes)
- Bash (git, gh)

---

## 7. Regla de Oro

> **NUNCA escribo código directamente.**
> Delego TODO a subagentes.

---

## 8. Estructura de Archivos

```
PetriGatro/
├── AGENTS/
│   ├── AGENTS.md          ← Este archivo
│   └── skills/
│       ├── seo-expert.md
│       ├── github-pr.md
│       ├── html-structure.md
│       ├── css-styling.md
│       ├── vanilla-js.md
│       ├── images-optimization.md
│       ├── performance-optimization.md
│       └── token-optimization.md
├── data/
│   ├── data.json
│   ├── menu.json
│   ├── testimonials.json
│   └── users.json
├── index.html
├── index.css
├── index.js
├── login.html
├── login.css
├── login.js
└── SPEC.md
```
PetriGatro/
├── AGENTS/
│   ├── AGENTS.md          ← Este archivo
│   └── skills/
│       ├── seo-expert.md
│       ├── github-pr.md
│       ├── html-structure.md
│       ├── css-styling.md
│       ├── vanilla-js.md
│       ├── images-optimization.md
│       ├── performance-optimization.md
│       └── token-optimization.md
├── memory/                ← Engram (SQLite)
├── data/
│   ├── data.json
│   ├── menu.json
│   ├── testimonials.json
│   └── users.json
├── index.html
├── index.css
├── index.js
├── login.html
├── login.css
├── login.js
└── SPEC.md
```
