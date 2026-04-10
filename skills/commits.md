---
name: Commits
trigger: ["commit", "git", "versionar"]
scope: "global"
tools: ["read", "bash"]
---

# Skill: Commits

## Propósito
Crear commits limpios, atómicos y con mensajes profesionales.

## Reglas de Commits

1. **Atómico**: Un cambio = un commit
2. **Mensaje claro**: Imperativo, primero persona (Add, Fix, Update)
3. **No commits grandes**: Máximo 400 caracteres en mensaje
4. **Referencia issues**: Si existe, incluir #[número]

## Conventional Commits

```
<tipo>(<alcance>): <descripción>

[tuerpo opcional]

[footer opcional]
```

### Tipos

| Tipo | Uso |
|------|-----|
| **feat** | Nueva funcionalidad |
| **fix** | Bug fix |
| **docs** | Documentación |
| **style** | Formato (no lógica) |
| **refactor** | Reescritura sin cambios funcionales |
| **perf** | Optimización de rendimiento |
| **test** | Tests |
| **chore** | Mantenimiento (deps, config) |

## Ejemplos Buenos

```bash
feat(seo): añadir Schema.org Restaurant

Añade JSON-LD con información del restaurante:
- Nombre, dirección, horarios
- Geolocalización
- Aggregate rating

Fixes #12
```

```bash
fix(lcp): optimizar imagen hero

- Convirtir a WebP
- Añadir fetchpriority="high"
- Especificar dimensiones exactas
```

```bash
docs(readme): actualizar instrucciones SEO
```

## Errors a Evitar

- ❌ " Arreglos", "Updates", "WIP"
- ❌ Commits con múltiples cambios no relacionados
- ❌ Commitear secrets (.env, credentials)
- ❌ CommitsSin mensaje

## Flujo Recomendado

```bash
git status
git add .
git diff --staged
git commit -m "type(scope): description"
git push
```