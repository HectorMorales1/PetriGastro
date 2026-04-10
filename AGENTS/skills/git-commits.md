# Skill: Git Commits

## Metadata
- **Nombre**: Git Commits Automático
- **Trigger**: Automático - cada vez que se complete una acción o modificación en el código
- **Scope**: Gestión de commits Git con configuración específica
- **Tools**: git config, git add, git commit
- **Última actualización**: 2026-04-10

---

## 1. Descripción

Esta skill asegura que cada acción o modificación en el código sea registrada automáticamente en Git con un mensaje claro y conciso en español.

---

## 2. Configuración Obligatoria

### Usuario y Correo
Debe configurarse siempre:
```bash
git config user.name "HectorMorales1"
git config user.email "hectro.moralescampana@gmail.com"
```

---

## 3. Flujo de Ejecución

### 3.1 Detección de Cambios
1. Verificar estado del repositorio: `git status`
2. Identificar archivos modificados
3. Determinar tipo de cambio realizado

### 3.2 Mensaje de Commit
El mensaje debe ser:
- **Claro**: Describir qué se hizo
- **Conciso**: Máximo 72 caracteres
- **En español**: Idioma predeterminado

#### Prefijos permitidos:
- `feat:` - Nueva funcionalidad
- `fix:` - Corrección de bug
- `refactor:` - Refactorización
- `style:` - Estilos (CSS)
- `docs:` - Documentación
- `perf:` - Optimización de rendimiento
- `test:` - Tests

### 3.3 Ejecución de Commit
```bash
git add .
git commit -m "<tipo>: <descripción>"
```

---

## 4. Reglas de Autoinvocación

Esta skill se autoinvoca cuando:
- ✅ Se modifica cualquier archivo de código (`.html`, `.css`, `.js`)
- ✅ Se crea un nuevo archivo
- ✅ Se elimina un archivo
- ✅ Se renombra un archivo
- ✅ Se cambia la estructura del proyecto

---

## 5. Casos de Uso

### Caso 1: Nueva funcionalidad
```bash
git commit -m "feat: añade formulario de contacto"
```

### Caso 2: Corrección de bug
```bash
git commit -m "fix: corrige error en validación de formulario"
```

### Caso 3: Estilos
```bash
git commit -m "style: mejora estilo del header"
```

### Caso 4: Optimización SEO
```bash
git commit -m "perf: optimiza imágenes para mejor rendimiento"
```

---

## 6. Registro en Engram

Después de cada commit, guardar en Engram:
- Tipo de cambio
- Archivos afectados
- Resumen de la acción
- Timestamp

---

## 7. Notas

- No hacer commit de archivos敏感 (`.env`, credenciales)
- Asegurar que `user.name` y `user.email` estén configurados antes de cada commit
- Verificar que no haya commits previos sin hacer antes de continuar