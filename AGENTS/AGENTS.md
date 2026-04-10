# AGENTS - Orquestador Principal

## Meta
- **Proyecto**: PetriGatro
- **Metodología**: Gentle AI Stack (Gentleman Programming)
- **Enfoque**: Arquitectura basada en Agentes, Skills, SDD y Engram
- **Última actualización**: 2026-04-10

---

## 1. Propósito

Este documento funciona como el **Orquestador Principal** del proyecto. No escribe código directamente, sino que delega tareas a subagentes pasándoles un resumen y una "página en blanco" para trabajar de forma aislada y eficiente.

**Regla Fundamental**: El orquestador debe **autoinvocar** skills de forma 100% automática y en segundo plano según el contexto del usuario. El usuario NO debe tener que pedir que se ejecuten.

---

## 2. Arquitectura de Agentes

### 2.1 Flujo de Trabajo (SDD)

```
Usuario → Engram → AGENTS.md (Orquestador) → Skills (autoinvocadas) → Código
                ↑                                              ↓
           Memoria Persistente ←←←←←←←←←←←←←←←←←←←←←←←←←←←←
```

### 2.2 Regla de Autoinvocación

El orquestador debe detectar patrones y lanzar skills automáticamente:

| Contexto | Skill a Autoinvocar |
|----------|--------------------|
| Cualquier acción/modificación en código | `git-commits.md` |
| Modificación de interfaz, contenido o estructura web | `seo-expert.md` |
| Finalización de característica completa | `github-pr.md` |

---

## 3. Sistema de Skills

### Ubicación
Todas las skills residen en: `AGENTS/skills/`

### Skills Definidas

#### 3.1 git-commits.md
- **Trigger**: Automático cada vez que se complete una acción o modificación en el código
- **Scope**: Git commits con usuario HectorMorales1 y correo hectro.moralescampana@gmail.com
- **Tools**: git add, git commit, git config

#### 3.2 seo-expert.md
- **Trigger**: Automático cuando se haga cualquier modificación que afecte interfaces, contenido o estructura web
- **Scope**: SEO on-page, meta tags, estructura semántica, rendimiento
- **Tools**: Análisis SEO, optimización de contenido

#### 3.3 github-pr.md
- **Trigger**: Automático cuando se finalice una característica completa
- **Scope**: Push y Pull Request en GitHub
- **Tools**: git push, gh pr create

---

## 4. Engram (Memoria Persistente)

La memoria persistente se almacena en: `memory/` (vía MCP server de SQLite)

### Tipos de memoria:
- **Arquitectura**: Decisiones arquitectónicas importantes
- **Bugs**: Bugs resueltos y soluciones
- **Contexto**: Contexto general del proyecto
- **Specs**: Especificaciones técnicas (OpenSpec)

---

## 5.SDD - Spec-Driven Development

Antes de implementar código:
1. Explorar la base de código
2. Leer especificaciones técnicas (OpenSpec)
3. Validar contra la SPEC.md existente
4. Implementar siguiendo el flujo SDD

---

## 6. Reglas de Ejecución

### Regla de Oro
> **El Orchestrator NUNCA escribe código directamente.**
> Delega TODO a subagentes con un resumen claro y página en blanco.

### Autoinvocación Obligatoria
Cada vez que el usuario realiza una acción que coincida con el trigger de una skill, el orquestador debe:
1. Detectar el contexto
2. Lanzar la skill correspondiente automáticamente
3. Ejecutar en segundo plano
4. Registrar en Engram

---

## 7. Estructura de Archivos

```
PetriGatro/
├── AGENTS/
│   ├── AGENTS.md          ← Orquestador (este archivo)
│   └── skills/
│       ├── git-commits.md
│       ├── seo-expert.md
│       └── github-pr.md
├── memory/                ← Engram (SQLite)
├── index.html
├── styles.css
├── script.js
└── SPEC.md
```

---

## 8. Notas de Uso

- Este archivo actúa como el cerebro central del proyecto
- Todas las decisiones pasan por aquí
- Las skills se autoinvocan según los triggers definidos
- El contexto se guarda en Engram para persistencia