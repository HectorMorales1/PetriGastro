# PetriGastro - Plan de Migración Completo

## Estado Actual
- **Tipo:** PWA estática (HTML/CSS/JS)
- **Almacenamiento:** JSON files + localStorage
- **Auth:** Plain text passwords (riesgo de seguridad)
- **Hosting:** Ninguno configurado

## Tecnologías Elegidas

| Capa | Tecnología | Herramienta |
|------|------------|-------------|
| Frontend | React + Vite | Componentes, Routing, Context API |
| Backend | Node.js + Express | API REST, JWT |
| Base de Datos | PostgreSQL | Supabase (PostgreSQL + Auth + Storage) |
| CSS | **Tailwind CSS** | Estilos utilitarios |
| Deployment | Vercel + Railway/Supabase | Hosting |

> **Nota:** Este documento es un **PLAN A FUTURO**. La implementación se realizará cuando sea necesario escalar el proyecto.

---

## Estructura del Proyecto

```
petrigastro/
├── client/                      # React (Frontend)
│   ├── src/
│   │   ├── components/          # Header, Footer, MenuCard, Cart, Modal
│   │   ├── pages/               # Home, Menu, Login, Register, Reservas, Admin, 404
│   │   ├── context/             # AuthContext, CartContext, ThemeContext
│   │   ├── hooks/               # useAuth, useCart, useFetch
│   │   ├── services/            # api.js (llamadas al backend)
│   │   ├── utils/               # helpers, constants
│   │   └── styles/              # globals.css, index.css
│   ├── public/
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── server/                      # Node.js (Backend)
│   ├── controllers/             # userController, platoController, pedidoController, reservaController
│   ├── routes/                  # /api/users, /api/platos, /api/pedidos, /api/reservas
│   ├── middleware/              # authMiddleware, errorHandler, validation
│   ├── config/                  # db.js, env.js
│   ├── app.js                   # Express app
│   ├── server.js                # Entry point
│   └── package.json
├── database/
│   ├── migrations/              # Scripts SQL para crear tablas
│   └── seeders/                 # Datos iniciales
└── README.md
```

---

## Modelo de Datos (PostgreSQL)

### Tablas

```sql
-- Categorías del menú
CREATE TABLE categorias (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    icono VARCHAR(50),
    orden INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Usuarios
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    telefono VARCHAR(20),
    rol VARCHAR(20) DEFAULT 'cliente', -- cliente, admin
    avatar_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Platos del menú
CREATE TABLE platos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(200) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(10,2) NOT NULL,
    categoria_id INT REFERENCES categorias(id),
    imagen_url TEXT,
    disponible BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Pedidos
CREATE TABLE pedidos (
    id SERIAL PRIMARY KEY,
    usuario_id INT REFERENCES usuarios(id),
    estado VARCHAR(20) DEFAULT 'pendiente', -- pendiente, confirmado, preparando, entregado, cancelado
    total DECIMAL(10,2) NOT NULL,
    notas TEXT,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Detalles del pedido
CREATE TABLE pedido_detalles (
    id SERIAL PRIMARY KEY,
    pedido_id INT REFERENCES pedidos(id),
    plato_id INT REFERENCES platos(id),
    cantidad INT NOT NULL,
    precio_unitario DECIMAL(10,2) NOT NULL
);

-- Reservas
CREATE TABLE reservas (
    id SERIAL PRIMARY KEY,
    usuario_id INT REFERENCES usuarios(id),
    nombre VARCHAR(100) NOT NULL,
    fecha DATE NOT NULL,
    hora TIME NOT NULL,
    personas INT NOT NULL,
    telefono VARCHAR(20),
    estado VARCHAR(20) DEFAULT 'pendiente', -- pendiente, confirmado, cancelado
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Relaciones
```
usuarios 1───M pedidos
usuarios 1───M reservas
categorias 1───M platos
pedidos 1───M pedido_detalles
platos 1───M pedido_detalles
```

---

## FASE 1: Frontend React

### Paso 1.1 - Inicializar proyecto
```bash
npm create vite@latest client -- --template react
cd client
npm install react-router-dom @tanstack/react-query axios tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### Paso 1.2 - Componentes a crear
| Componente | Descripción | Prioridad |
|------------|-------------|-----------|
| `Layout` | Wrapper con Header + Footer | Alta |
| `Header` | Logo, nav, cart icon, auth | Alta |
| `Footer` | Links, redes sociales | Alta |
| `MenuCard` | Tarjeta de plato | Alta |
| `CartDrawer` | Slide-out del carrito | Alta |
| `SearchModal` | Búsqueda con debounce | Media |
| `ReservaModal` | Formulario de reservas | Media |
| `AuthModal` | Login/Register | Alta |
| `Lightbox` | Galería de imágenes | Baja |
| `FAQ` | Preguntas frecuentes | Baja |

### Paso 1.3 - Páginas
| Ruta | Componente | Descripción |
|------|------------|-------------|
| `/` | `Home` | Landing page completa |
| `/menu` | `Menu` | Lista de platos con filtros |
| `/login` | `Login` | Login de usuario |
| `/register` | `Register` | Registro de usuario |
| `/reservas` | `Reservas` | Formulario de reserva |
| `/admin` | `Admin` | Dashboard admin (protegido) |
| `*` | `NotFound` | Página 404 |

### Paso 1.4 - Context API
```javascript
// AuthContext - estado de usuario logueado
// CartContext - productos en carrito
// ThemeContext - modo oscuro/claro
// MenuContext - platos y categorías
```

### Paso 1.5 - Migrar funcionalidades existentes
| Original | React |
|----------|-------|
| `data/menu.json` | API call `/api/platos` |
| `data/users.json` | Supabase Auth |
| `data/testimonials.json` | API `/api/testimonios` |
| localStorage `petriCart` | CartContext |
| WhatsApp checkout | API `/api/pedidos` |

### Paso 1.6 - PWA
- Mantener `manifest.json`
- Crear Service Worker en React
- Configurar vite-plugin-pwa

---

## FASE 2: Backend Node.js + Express

### Paso 2.1 - Inicializar proyecto
```bash
mkdir server && cd server
npm init -y
npm install express cors dotenv pg bcryptjs jsonwebtoken express-validator helmet morgan
npm install -D nodemon
```

### Paso 2.2 - Rutas API
| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| POST | `/api/auth/register` | Registro de usuario | No |
| POST | `/api/auth/login` | Login (devuelve JWT) | No |
| GET | `/api/auth/me` | Usuario actual | Sí |
| GET | `/api/platos` | Listar platos | No |
| GET | `/api/platos/:id` | Detalle plato | No |
| POST | `/api/platos` | Crear plato | Admin |
| PUT | `/api/platos/:id` | Editar plato | Admin |
| DELETE | `/api/platos/:id` | Eliminar plato | Admin |
| GET | `/api/categorias` | Listar categorías | No |
| POST | `/api/pedidos` | Crear pedido | Sí |
| GET | `/api/pedidos` | Mis pedidos | Sí |
| GET | `/api/pedidos/admin` | Todos los pedidos | Admin |
| PUT | `/api/pedidos/:id/estado` | Cambiar estado | Admin |
| POST | `/api/reservas` | Crear reserva | No |
| GET | `/api/reservas` | Listar reservas | Admin |

### Paso 2.3 - Middleware
```javascript
// authMiddleware - verifica JWT
// adminMiddleware - verifica rol admin
// errorHandler - manejo de errores
// validateRequest - validación de inputs
```

### Paso 2.4 - Ejemplo de controlador (login)
```javascript
const login = async (req, res) => {
  const { email, password } = req.body;
  // 1. Buscar usuario por email
  // 2. Verificar password con bcrypt
  // 3. Generar JWT
  // 4. Devolver token + datos de usuario
};
```

---

## FASE 3: Base de Datos (Supabase)

### Paso 3.1 - Configurar Supabase
1. Crear cuenta en [supabase.com](https://supabase.com)
2. Crear nuevo proyecto
3. Copiar **Project URL** y **anon/public key** de Settings > API

### Paso 3.2 - Variables de entorno

**`client/.env`**
```
VITE_SUPABASE_URL=https://tu-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key
```

**`server/.env`**
```
DATABASE_URL=postgresql://user:password@host:5432/dbname
JWT_SECRET=tu-secret-muy-largo
PORT=3000
```

### Paso 3.3 - Ejecutar migraciones
Usar Supabase SQL Editor o pgAdmin para ejecutar los CREATE TABLE del modelo de datos.

### Paso 3.4 - Seeders (datos iniciales)
```sql
-- Categorías
INSERT INTO categorias (nombre, icono, orden) VALUES
('Entrantes', '🥗', 1),
('Principales', '🍽️', 2),
('Postres', '🍰', 3),
('Bebidas', '🥤', 4);

-- Platos de ejemplo
INSERT INTO platos (nombre, descripcion, precio, categoria_id, disponible) VALUES
('Ensalada César', 'Lechuga romana, parmesano, crutones', 8.50, 1, true),
('Paella Valenciana', 'Arroz con marisco, azafrán', 18.00, 2, true),
('Tiramisú', 'Café, mascarpone, cacao', 6.00, 3, true),
('Refresco', 'Coca-Cola, Fanta, Sprite', 2.50, 4, true);
```

---

## FASE 4: Integración y Despliegue

### Paso 4.1 - Conectar cliente con backend
```javascript
// client/src/services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('petri_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
```

### Paso 4.2 - Flujo de usuario
```
1. Usuario abre app → Home (platos desde API)
2. Click "Login" → AuthModal
3. Registro/Login → JWT guardado en localStorage
4. Agregar al carrito → CartContext
5. Checkout → POST /api/pedidos
6. Redirect a Mis Pedidos
```

### Paso 4.3 - Desplegar Backend
**Opción A: Railway**
```bash
npm install -g railway
railway login
railway init
railway up
```

**Opción B: Render**
1. Conectar GitHub repo
2. Crear Web Service
3. Configurar variables de entorno
4. Deploy automático

### Paso 4.4 - Desplegar Frontend
**Vercel:**
```bash
npm install -g vercel
cd client
vercel
```

**Netlify:**
```bash
npm install -g netlify-cli
cd client
netlify deploy --prod
```

### Paso 4.5 - Variables finales
**Vercel (client/.env):**
```
VITE_API_URL=https://tu-backend.railway.app/api
VITE_SUPABASE_URL=https://tu-project.supabase.co
VITE_SUPABASE_ANON_KEY=tu-key
```

---

## Mejoras Incorporadas en la Migración

| # | Mejora | Implementación |
|---|--------|----------------|
| 1 | Auth seguro | bcrypt + JWT (no más passwords en texto plano) |
| 2 | Búsqueda en tiempo real | SearchModal con debounce |
| 3 | Reserva online | ReservaModal + API /api/reservas |
| 4 | Carrito persistente | CartContext + localStorage |
| 5 | Dark mode | ThemeContext + Tailwind |
| 6 | Página 404 | Componente NotFound |
| 7 | FAQ | Componente FAQ collapsible |
| 8 | Lightbox | Componente Lightbox |

---

## Comandos Rápidos de Inicio

```bash
# 1. Clonar/Descargar proyecto actual
git clone https://github.com/tu-usuario/petrigastro.git
cd petrigastro

# 2. Crear estructura
mkdir -p client server database/migrations database/seeders

# 3. Frontend
cd client
npm create vite@latest . -- --template react
npm install react-router-dom @tanstack/react-query axios
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# 4. Backend
cd ../server
npm init -y
npm install express cors dotenv pg bcryptjs jsonwebtoken express-validator helmet morgan
npm install -D nodemon

# 5. Configurar Supabase
# Ir a supabase.com, crear proyecto, copiar credenciales

# 6. Ejecutar migraciones SQL en Supabase

# 7. Ejecutar seeders

# 8. Probar localmente
# Terminal 1: cd server && npm run dev
# Terminal 2: cd client && npm run dev
```

---

## Checklist Pre-Producción

- [ ] Todos los endpoints funcionando
- [ ] Auth (registro, login, logout) funcionando
- [ ] Carrito con persistencia
- [ ] Pedidos guardados en BD
- [ ] Reservas guardadas en BD
- [ ] Responsive en móvil
- [ ] Dark mode funcionando
- [ ] PWA instalable
- [ ] 404 page creada
- [ ] Variables de entorno configuradas
- [ ] Backend deployado
- [ ] Frontend deployado
- [ ] SSL habilitado
- [ ] Tests básicos pasados

---

## Recursos

- [Documentación React](https://react.dev)
- [Documentación Vite](https://vitejs.dev)
- [Documentación Express](https://expressjs.com)
- [Documentación Supabase](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com)
- [React Router](https://reactrouter.com)