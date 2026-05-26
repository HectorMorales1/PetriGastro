# Plan: Implementar mejoras de Mejoras.md

## 1. 🔴 Correos duplicados — Validación temprana en ruta

**Problema**: El backend ya detecta emails duplicados en el controlador, pero no hay validación en el middleware de express-validator. Un usuario rechazado que se registra de nuevo **reutiliza silenciosamente** el registro antiguo en vez de crear uno nuevo.

**Archivo**: `server/routes/auth.ts`

**Cambio**: Agregar custom validator en el POST `/register`:
```typescript
body('email').custom(async (email) => {
  const pool = require('../config/db')
  const { rows } = await pool.query(
    'SELECT id FROM usuarios WHERE email = $1 AND estado_solicitud IN ($2, $3, $4)',
    [email, 'aprobado', 'pendiente', 'pendiente_verificacion']
  )
  if (rows.length > 0) throw new Error('El email ya está registrado')
})
```

---

## 2. 🔴 Contraste de colores en modo claro

**Problema**: `--color-carbon: #F5F0E8` (beige claro) se usa como color de texto (`text-carbon`) sobre fondos blancos (#FFFFFF) o beige (#F5F0E8), haciendo el texto **invisible** en modo claro.

**Archivo**: `client/src/index.css`

**Cambio**: Cambiar `--color-carbon` en `:root` de `#F5F0E8` a `#1C1917` (marrón oscuro, igual que `--color-text`) para que sea visible en fondos claros. En `.dark` dejarlo como `#F5F0E8` (beige, visible sobre fondo oscuro).

```css
:root {
  --color-carbon: #1C1917;       /* Cambiado de #F5F0E8 a dark */
  --color-carbon-light: #3A3A3A; /* Ajustado para coherencia */
}

.dark {
  --color-carbon: #F5F0E8;       /* Se mantiene beige para fondo oscuro */
  --color-carbon-light: #E8E0D0;
}
```

---

## 3. 🔴 Links no scrolean al inicio

**Problema**: React Router `<Link>` no hace scroll al top al navegar entre rutas. No hay componente `ScrollToTop`.

**Archivos**: `client/src/App.tsx`, `client/src/components/Header.tsx`

**Cambio 1**: Crear componente `client/src/components/ScrollToTop.tsx`:
```tsx
import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

export default function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}
```

**Cambio 2**: En `App.tsx`, agregar `<ScrollToTop />` dentro del `<BrowserRouter>` antes de `<Layout>`:
```tsx
<BrowserRouter>
  <ScrollToTop />
  <Layout>
    ...
  </Layout>
</BrowserRouter>
```

---

## 4. 🔴 Admin UsuariosManager — Pantalla en negro

**Problema**: La respuesta de `usuariosApi.getAll()` devuelve `{ data: [...], pagination: {...} }`, pero el `useQuery` asigna el objeto completo a la variable `usuarios`. Llamar `.map()` sobre un objeto lanza un TypeError que rompe el render → pantalla en negro.

**Archivo**: `client/src/pages/Admin.tsx` (UsuariosManager)

**Cambio**: Reemplazar:
```tsx
const { data: usuarios = [], isLoading } = useQuery({
  queryKey: ['usuarios'],
  queryFn: () => usuariosApi.getAll({ limit: 100 })
})
```
Por:
```tsx
const { data: usuariosResp, isLoading } = useQuery({
  queryKey: ['usuarios'],
  queryFn: () => usuariosApi.getAll({ limit: 100 })
})
const usuarios = usuariosResp?.data ?? []
```

---

## 5. 🟡 Menú móvil — Fondos de secciones poco visibles

**Problema**: Los items del nav móvil usan `bg-white/10` (10% blanco sobre negro), lo que los hace casi indistinguibles del fondo negro.

**Archivo**: `client/src/components/Header.tsx`

**Cambio**: Reemplazar `bg-white/10` por un fondo más visible. Dos opciones:

**Opción A (más visible)**: Usar fondo grase oscuro con borde sutil:
```tsx
className="... bg-neutral-800 hover:bg-neutral-700 ..."
```

**Opción B (manteniendo estética)**: Aumentar opacidad y agrupar secciones:
```tsx
// Items de navegación
className="... bg-white/10 hover:bg-white/20 ..."  // se mantiene
// Separar secciones con color de fondo distinto
<div className="bg-neutral-900 rounded-xl p-2 space-y-1">
  {/* Nav links aquí */}
</div>
<div className="bg-neutral-900 rounded-xl p-2 space-y-1 mt-3">
  {/* Cart y user links aquí */}
</div>
```

**Recomendación**: Opción B — agrupar en contenedores `bg-neutral-900 rounded-xl` para dar estructura visual sin cambiar demasiado el diseño.

---

## Archivos afectados (resumen)

| # | Archivo | Cambio |
|---|---------|--------|
| 1 | `server/routes/auth.ts` | Agregar `body('email').custom()` validator |
| 2 | `client/src/index.css` | Cambiar `--color-carbon` en `:root` a oscuro |
| 3 | `client/src/components/ScrollToTop.tsx` | **Nuevo** componente |
| 3 | `client/src/App.tsx` | Agregar `<ScrollToTop />` |
| 4 | `client/src/pages/Admin.tsx` | Corregir destructuring de `usuarios` |
| 5 | `client/src/components/Header.tsx` | Mejorar visibilidad de fondos en nav móvil |
