# Plan: Corrección de contraste de texto

## Resumen del análisis

Se auditaron **23 archivos**. Se encontraron **6 problemas sistémicos** que afectan a todo el frontend:

| # | Problema | Ratio actual | Instancias | Severidad |
|---|---------|-------------|-----------|-----------|
| C1 | `text-carbon` (#1C1917) sobre header oscuro (#1E1E1E) | **1.2:1** | ~20 (solo Header.tsx) | 🔴 CRÍTICO |
| C2 | `text-white` sobre `bg-accent` (gold #D4A853) | **2.34:1** | ~30 (todos los botones CTA) | 🔴 ALTO |
| C3 | `text-accent` (#D4A853) sobre fondo blanco/beige | **2.04-2.34:1** | ~35 (precios, badges, spinners, enlaces) | 🔴 ALTO |
| C4 | `text-text-muted` (#78716C) sobre beige/tertiary | **4.10-4.34:1** | ~15 (subtítulos, descripciones) | 🟡 MEDIO |
| C5 | `text-error` (#C75D5D) / `text-success` (#6B8F6B) | **2.5-4.2:1** | ~12 (alertas, iconos, badges) | 🟡 MEDIO |
| C6 | Colores hardcodeados de Tailwind (no variables CSS) | Varía | ~15 (badges de estado, estrellas) | 🟢 BAJO |

---

## Propuestas de cambio

### 🔴 C1: Header — texto invisible en modo claro

**Causa**: El header usa fondos oscuros hardcodeados (`bg-[#1E1E1E]`, `bg-neutral-900`, `bg-black`) que no cambian con el tema, pero `text-carbon` cambia a #1C1917 (oscuro) en modo claro → texto invisible.

**Solución**: Los textos del header deben ser siempre claros. En `Header.tsx`, cambiar `text-carbon` por `text-white` o `text-gray-200` en TODOS los elementos que están sobre fondos oscuros.

**Archivo**: `client/src/components/Header.tsx`

**Cambios** (buscar y reemplazar):
| Línea | Texto actual | Cambiar a |
|-------|-------------|-----------|
| 56 | `text-carbon` (logo) | `text-white` |
| 59 | `fill-carbon` (svg path) | `fill-white` |
| 69 | `text-carbon` (nav links) | `text-gray-200` + hover `text-accent` |
| 80,85 | `text-carbon` (links desktop) | `text-gray-200` |
| 93 | `text-carbon` (logout icon) | `text-gray-200` |
| 97 | `text-carbon` (login link) | `text-gray-200` |
| 108 | `text-carbon` (theme icon) | `text-gray-200` |
| 116 | `text-carbon` (cart icon) | `text-gray-200` |
| 148,149 | `text-carbon` (menú título, X) | `text-white` |
| 158-174,181,185 | `text-carbon` (nav móvil) | `text-gray-200` |
| 212 | `text-carbon` (nombre usuario) | `text-gray-200` |
| 216 | `text-carbon` (mis pedidos móvil) | `text-gray-200` |
| 228 | `text-error` (logout btn) → mismo bg oscuro | Cambiar hover: mantiene `text-error`, añadir `text-gray-200` para icon |
| 235 | `text-carbon` (login móvil) | `text-gray-200` |
| 245 | `text-carbon` (theme toggle) | `text-gray-200` |

---

### 🔴 C2: Botones gold — texto blanco ilegible

**Causa**: `text-white` (#FFFFFF) sobre `bg-accent` (#D4A853) da 2.34:1.

**Solución**: Cambiar el texto de los botones gold a oscuro. Como los botones son `large text` (≥14px bold), con ~3.54:1 pasan WCAG AA para large text.

**Opción recomendada**: Usar `text-carbon` (#1C1917) sobre `bg-accent` en todos los botones primarios.

**Archivos afectados**: Header.tsx, Home.tsx, Login.tsx, Menu.tsx, CartDrawer.tsx, Admin.tsx, MisPedidos.tsx, NotFound.tsx, VerificarEmail.tsx, HeroSection.tsx, ScrollVideo.tsx.

**Cambio**: Buscar `bg-accent text-white` y reemplazar por `bg-accent text-carbon` en TODOS los botones y CTAs.

---

### 🔴 C3: Texto accent (#D4A853) sobre fondos claros

**Causa**: `text-accent` da solo 2.04-2.34:1 sobre blanco/beige. Se usa para precios, badges, spinners, enlaces.

**Solución**: Donde sea texto informativo (precios, enlaces, números), usar `text-carbon` (#1C1917) en modo claro. Mantener `text-accent` solo para elementos decorativos/iconos.

**Archivo**: `client/src/index.css`

**Cambio**: Agregar una variable `--color-accent-dark: #A08030` para casos donde se necesite accent legible sobre fondo claro. O mejor: simplemente cambiar los usos de `text-accent` que son contenido a `text-carbon`.

Ejemplos de cambios en componentes:
| Archivo | Líneas | Cambio |
|---------|--------|--------|
| MenuCard.tsx:58 | `text-accent` precio → `text-carbon` |
| CartDrawer.tsx:144 | `text-accent` precio → `text-carbon` |
| CartDrawer.tsx:232 | `text-accent` total → `text-carbon` |
| Login.tsx:158,251,259 | `text-accent` enlaces → `text-carbon` con hover `text-accent` |
| Menu.tsx:73 | `text-accent` precio modal → `text-carbon` |
| Admin.tsx:170,389,... | `text-accent` stats → `text-carbon` |
| Home.tsx:366,410 | `text-accent` badge → `text-carbon` |

**Importante**: En los casos de "spinner" (Loader2), mantener `text-accent` porque es un elemento decorativo sobre fondo claro o usar el color secundario (#C4785A, terracota) que tiene mejor contraste.

---

### 🟡 C4: text-muted (#78716C) sobre beige (#F5F0E8, #F0EBE0)

**Causa**: Ratio 4.10-4.34:1, justo por debajo de 4.5:1.

**Solución**: Oscurecer ligeramente `--color-text-muted` de #78716C a **#6B635E** en `:root` (modo claro). En `.dark` mantener #A8A29E.

**Archivo**: `client/src/index.css`
```css
:root {
  --color-text-muted: #6B635E;  /* Cambiado de #78716C */
}
```

Esto da ~4.6:1 sobre #F5F0E8 y ~5.2:1 sobre #FFFFFF. En modo oscuro se mantiene igual.

---

### 🟡 C5: Error (#C75D5D) y Success (#6B8F6B) — bajo contraste

**Problema**:
- `text-error` (#C75D5D) sobre blanco: 4.2:1 — FAIL
- `text-error` sobre dark (#1E1E1E): 3.5:1 — FAIL
- `text-success` (#6B8F6B) sobre blanco: 2.5:1 — FAIL
- `text-success` sobre dark (#1E1E1E): 4.8:1 — borderline

**Solución**: Oscurecer colores para modo claro, mantener para modo oscuro:

```css
:root {
  --color-error: #B84545;      /* Cambiado de #C75D5D → ~5.0:1 sobre blanco */
  --color-success: #5A7A5A;    /* Cambiado de #6B8F6B → ~3.5:1 sobre blanco */
}

.dark {
  --color-error: #E07070;      /* Más claro para dark → ~4.8:1 sobre #1E1E1E */
  --color-success: #7FA07F;    /* Más claro para dark → ~6.0:1 sobre #1E1E1E */
}
```

**Archivo**: `client/src/index.css`

---

### 🟢 C6: Hardcoded Tailwind colors (unthemed)

**Problema**: Colores como `bg-green-100 text-green-800`, `text-gray-600`, `text-red-500` no usan variables CSS y no se adaptan al modo oscuro.

**Solución**: Reemplazar con clases que usen las variables del tema:

**Archivo**: `client/src/pages/Admin.tsx`

Badges de estado de pedidos (líneas 157-163):
```tsx
// Actual: hardcoded Tailwind
<span className={`... bg-yellow-100 text-yellow-800`}>

// Propuesta: usar variables CSS
<span className={`... bg-accent/15 text-accent`}>
```

Badges de rol de usuario (línea 1330):
```tsx
// Actual
<span className={`${user.rol === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>

// Propuesta
<span className={`px-2 py-0.5 rounded text-xs font-medium ${
  user.rol === 'admin' 
    ? 'bg-accent/20 text-accent' 
    : 'bg-secondary/20 text-secondary'
}`}>
```

**Archivo**: `client/src/pages/MisPedidos.tsx`

Estrellas (línea 127):
```tsx
// Actual: text-yellow-400
// Propuesta: text-accent (ya es gold, y en dark bg es legible)
```

---

## Resumen de archivos a modificar

| Archivo | Cambios |
|---------|---------|
| `client/src/index.css` | C4: oscurecer `--color-text-muted` a `#6B635E`. C5: cambiar `--color-error` y `--color-success` con variantes dark |
| `client/src/components/Header.tsx` | C1: reemplazar TODOS los `text-carbon` sobre dark bg por `text-white`/`text-gray-200`. C2: botón carrito gold `text-white` → `text-carbon` |
| `client/src/components/MenuCard.tsx` | C3: precio `text-accent` → `text-carbon` |
| `client/src/components/CartDrawer.tsx` | C2: botón "Realizar Pedido" gold → `text-carbon`. C3: precios `text-accent` → `text-carbon`. C5: `text-error` usar variable |
| `client/src/pages/Home.tsx` | C2: botones gold del modal → `text-carbon`. C3: badgets accent → `text-carbon`. LoginModal botones |
| `client/src/pages/Menu.tsx` | C2: botón "Añadir" gold, tab activo → `text-carbon`. C3: precio modal → `text-carbon` |
| `client/src/pages/Login.tsx` | C2: botones login/register → `text-carbon`. C3: enlaces accent → `text-carbon` con hover |
| `client/src/pages/Admin.tsx` | C2: tabs, botones, acciones → `text-carbon`. C3: stats, fechas → `text-carbon`. C6: badges → variables CSS |
| `client/src/pages/MisPedidos.tsx` | C2: botones → `text-carbon`. C3: precios accent → `text-carbon`. C6: estrellas → `text-accent` |
| `client/src/pages/NotFound.tsx` | C2: botón gold → `text-carbon` |

| `client/src/pages/VerificarEmail.tsx` | C2: botones gold → `text-carbon`. C3: spinner accent |
| `client/src/components/HeroSection.tsx` | C2: botón gold → `text-carbon`. C3: badge accent → `text-carbon` |
| `client/src/components/AuthGuard.tsx` | C3: spinner accent → mantener (decorativo) |
| `client/src/components/StatsSection.tsx` | C3: números accent → `text-carbon` |

## Total estimado: ~15 archivos, ~100+ reemplazos de clases
