---
name: Secret Scanner
trigger: ["siempre activa - automática"]
scope: "global"
tools: ["read", "glob", "grep", "edit", "bash"]
---

# Skill: Secret Scanner

## Propósito
Detectar automáticamente contraseñas, API keys, tokens y datos sensibles en los cambios de código antes de que se commiteen. Si se encuentra algo sensible, corregirlo automáticamente.

## Reglas de Detección

### Patrones de alto riesgo (bloquean commit)
| Patrón | Ejemplo |
|--------|---------|
| `password\s*[:=]["']?[^"'\s]{6,}` | `password: "supersecreto"` |
| `secret\s*[:=]["']?[^"'\s]{6,}` | `secret: "mi-clave-secreta"` |
| `api[_-]?key\s*[:=]["']?[^"'\s]{8,}` | `api_key: "sk-abc123..."` |
| `api[_-]?secret\s*[:=]["']?[^"'\s]{8,}` | `api_secret: "abc123..."` |
| `AKIA[0-9A-Z]{16}` | AWS Access Key |
| `-----BEGIN (RSA|OPENSSH|DSA|EC) PRIVATE KEY-----` | Private key |
| `JWT_SECRET\s*[:=]` | JWT secret assignment |
| `passwd\s*[:=]["']?[^"'\s]{8,}` | Password field |
| `postgres://\w+:\w+@` | DB URL with credentials |
| `mongodb://\w+:\w+@` | MongoDB URL with credentials |
| `redis://:\w+@` | Redis URL with credentials |
| `ghp_[0-9A-Za-z]{36,}` | GitHub personal token |
| `gho_[0-9A-Za-z]{36,}` | GitHub OAuth token |
| `xox[parb]-[0-9A-Za-z-]{24,}` | Slack token |
| `sk-[0-9A-Za-z]{20,}` | OpenAI/Stripe API key |

### Archivos bloqueados (no deben commitearte)
- `.env` (a menos que sea `.env.example`)
- `*.key` (archivos de clave privada)
- `*.pem` (certificados)
- `secrets.yml`
- `credentials.json`

## Flujo de Actuación

1. Al detectar cambios staged, ejecutar scan automáticamente
2. Si encuentra un patrón de alto riesgo:
   - Identificar el archivo y línea exacta
   - Mostrar advertencia con el problema
   - Reemplazar el valor sensible con `[REDACTED]` o `[ELIMINADO]`
   - Hacer un `git add` del archivo corregido
3. Si encuentra un `.env` (no `.env.example`):
   - Eliminar el archivo del stage: `git rm --cached .env`
   - Añadir `.env` a `.gitignore` si no está
4. Si es un falso positivo (test, mock, ejemplo), ignorar

## Patrones seguros (NO disparar alerta)
- `password_digest` o `password_hash` (solo mencionan el campo, no el valor)
- Variables de entorno: `process.env.*`, `import.meta.env.*`
- Archivos de ejemplo: `*.example.*`, `*.sample.*`
- Código en `test/`, `__tests__/`, `spec/` con valores mock explícitos
- `password: ""` o `password: null` (valores vacíos)

## Autoinvocación
Esta skill se autoinvoca:
- ✅ Antes de cada commit (pre-commit hook)
- ✅ Al detectar un archivo nuevo con extensión sensible
- ✅ Cuando se modifica `.env`, `*.key`, `*.pem`
- ✅ Al hacer `git add` de archivos con datos sensibles
