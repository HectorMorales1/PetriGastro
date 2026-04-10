# Skill: Pull Requests

## Metadata
- **Nombre**: GitHub Pull Requests
- **Trigger**: Automático - cuando se finalice una característica completa
- **Scope**: Push y creación de Pull Request en GitHub
- **Tools**: git push, gh pr create
- **Última actualización**: 2026-04-10

---

## 1. Descripción

Esta skill se encarga de hacer el push y crear la Pull Request en GitHub de forma automática cuando una característica está completa.

---

## 2. Configuración Obligatoria

### Credenciales
El usuario y correo configurados deben ser:
- **Usuario**: HectorMorales1
- **Correo**: hectro.moralescampana@gmail.com

---

## 3. Flujo de Ejecución

### 3.1 Pre-requisitos
1. Verificar que hay commits pendientes: `git status`
2. Verificar rama actual: `git branch`
3. Asegurar que user.name y user.email están configurados

### 3.2 Push
```bash
git push -u origin <rama-actual>
```

### 3.3 Creación de Pull Request
```bash
gh pr create --title "<título>" --body "<cuerpo>"
```

---

## 4. Título y Cuerpo de PR

### Título (máximo 72 caracteres)
Formato: `[Tipo] Descripción corta`

Tipos permitidos:
- `feat:` - Nueva funcionalidad
- `fix:` - Corrección
- `refactor:` - Refactorización
- `docs:` - Documentación
- `perf:` - Optimización

### Cuerpo de PR
Estructura obligatoria:
```markdown
## Resumen
- <punto 1>
- <punto 2>
- <punto 3>

## Cambios realizados
- <cambio 1>
- <cambio 2>

## Testing
- <cómo se probó>

## Notas adicionales
- <opcional>
```

---

## 5. Reglas de Autoinvocación

Esta skill se autoinvoca cuando:
- ✅ Se completa una funcionalidad completa
- ✅ Se marca un ticket como "done"
- ✅ El usuario indica que quiere hacer PR
- ✅ Se hace merge de feature branch a develop/main
- ✅ Se cumplen todos los items de un milestone

---

## 6. Validación Pre-PR

Antes de crear PR, verificar:
- [ ] No hay conflictos con la rama base
- [ ] Todos los tests pasan
- [ ] Código sigue convenciones del proyecto
- [ ] Documentación actualizada
- [ ] No hay archivos sensibiles en commit

---

## 7. Ramas

### Convenciones de nomenclatura
- `feature/` - Nuevas funcionalidades
- `bugfix/` - Corrección de bugs
- `hotfix/` - Correcciones urgentes
- `refactor/` - Refactorización
- `docs/` - Documentación

### Ramas principales
- `main` - Producción
- `develop` - Desarrollo

---

## 8. Registro en Engram

Guardar en Engram:
- PRs creados
- Links a PRs
- Feedback recibido
- Cambios solicitados

---

## 9. Notas

- No hacer PR sin antes haber hecho commits
- Siempre verificar que el push fue exitoso
- Hacer PR de ramas feature, no de main/develop directamente
- Revisar diff antes de crear PR
- Asignar reviewers apropiados