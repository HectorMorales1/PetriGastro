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

## FASE 0: Seguridad, SEO y Performance

> Esta fase es transversal a todas las demás y debe implementarse desde el inicio.

### 0.1 🔒 SEGURIDAD

#### Dependencias
```bash
# Backend
npm install helmet cors express-rate-limit express-validator bcryptjs jsonwebtoken
npm install -D sqlmap  # Testing de SQL injection
```

#### Implementación de Seguridad

| Categoría | Medida | Detalle |
|-----------|--------|---------|
| **Auth** | bcrypt | Hash de passwords con 12 rounds |
| **Auth** | JWT | Tokens con expiración de 15 min |
| **Auth** | Refresh Tokens | Tokens de larga duración en HTTPOnly cookies |
| **Rate Limiting** | express-rate-limit | 100 req/15min por IP, 5 intentos login/15min |
| **Headers** | helmet | XSS protection, no sniff, hide powered-by, etc. |
| **CORS** | Whitelist | Solo dominios permitidos (production URLs) |
| **Input Validation** | express-validator | Sanitización en todas las rutas |
| **SQL Injection** | Prepared statements | pg con consultas parametrizadas |
| **XSS** | CSP Headers | Content-Security-Policy strict |
| **CSRF** | csurf | Tokens en formularios POST |
| **Passwords** | zxcvbn | Verificar complejidad mínima |
| **Logs** | morgan + pino | Logging de intentos fallidos, IPs sospechosas |
| **HTTPS** | Force SSL | Redirección obligatoria en producción |
| **Secrets** | .env | Nunca hardcodear credenciales |
| **Admin** | 2FA opcional | Google Authenticator/TOTP |

#### Helmet Configuration
```javascript
import helmet from 'helmet';
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://js.stripe.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      imgSrc: ["'self'", "data:", "https://*.supabase.co", "https://images.unsplash.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      connectSrc: ["'self'", "https://*.supabase.co"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"]
    }
  },
  crossOriginEmbedderPolicy: false
}));
```

#### Rate Limiting
```javascript
import rateLimit from 'express-rate-limit';

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100,
  message: 'Demasiadas solicitudes, intenta más tarde'
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Demasiados intentos de login, espera 15 minutos'
});

app.use('/api/', generalLimiter);
app.use('/api/auth/', authLimiter);
```

#### Validación de Inputs
```javascript
import { body, validationResult } from 'express-validator';

const registerValidation = [
  body('email').isEmail().normalizeEmail().trim(),
  body('password').isLength({ min: 8 }).matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),
  body('nombre').trim().escape().isLength({ min: 2, max: 100 })
];

app.post('/api/auth/register', registerValidation, (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  // procesar registro
});
```

#### Seguridad Adicional
```javascript
// Prevenir clickjacking
app.disable('x-powered-by');
app.use((req, res, next) => {
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  next();
});
```

---

### 0.2 🔍 SEO

#### Dependencias
```bash
cd client
npm install react-helmet-async react-router-dom
```

#### Meta Tags con React Helmet
```javascript
import { Helmet } from 'react-helmet-async';

function MenuPage() {
  return (
    <>
      <Helmet>
        <title>Menú | PetriGastro - Restaurante Gastronómico</title>
        <meta name="description" content="Descubre nuestro menú de gastronomía mediterránea. Platos elaborados con productos frescos y de temporada. Reserva tu mesa hoy." />
        <meta name="keywords" content="restaurante, menú, gastronomía, mediterráneo, paella, tapas" />
        <link rel="canonical" href="https://petrigastro.com/menu" />

        {/* Open Graph */}
        <meta property="og:title" content="Menú | PetriGastro" />
        <meta property="og:description" content="Descubre nuestro menú de gastronomía mediterránea." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://petrigastro.com/menu" />
        <meta property="og:image" content="https://petrigastro.com/og-image.jpg" />
        <meta property="og:locale" content="es_ES" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Menú | PetriGastro" />
        <meta name="twitter:description" content="Descubre nuestro menú de gastronomía mediterránea." />
        <meta name="twitter:image" content="https://petrigastro.com/og-image.jpg" />

        {/* Robots */}
        <meta name="robots" content="index, follow, max-image-preview:large" />
      </Helmet>
      {/* contenido */}
    </>
  );
}
```

#### Schema.org JSON-LD
```javascript
// client/src/utils/schema.js
export const restaurantSchema = {
  "@context": "https://schema.org",
  "@type": "Restaurant",
  "name": "PetriGastro",
  "image": "https://petrigastro.com/logo.jpg",
  "url": "https://petrigastro.com",
  "telephone": "+34600123456",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Calle Ejemplo 123",
    "addressLocality": "Valencia",
    "addressRegion": "Valencia",
    "postalCode": "46001",
    "addressCountry": "ES"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 39.4699,
    "longitude": -0.3763
  },
  "openingHoursSpecification": [
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      "opens": "12:00",
      "closes": "23:00"
    }
  ],
  "servesCuisine": "Mediterranean",
  "priceRange": "€€",
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "reviewCount": "156"
  },
  "menu": "https://petrigastro.com/menu"
};

// Usar en App.js o Layout
<script type="application/ld+json">{JSON.stringify(restaurantSchema)}</script>
```

#### SEO Técnico

| Técnica | Implementación |
|---------|----------------|
| **Sitemap.xml** | Generado con `react-router-sitemap` o manualmente |
| **robots.txt** | Configurar crawling allowed/disallowed |
| **URLs amigables** | `/menu`, `/reservas`, `/login` |
| **Lang attribute** | `<html lang="es">` en `index.html` |
| **Semántica HTML** | header, main, article, section, footer, nav, aside |
| **Alt text** | Obligatorio en todas las imágenes |
| **Breadcrumbs** | Schema.org BreadcrumbList |
| **Canonical URLs** | Evitar contenido duplicado |
| **Hreflang** | Para múltiples idiomas |
| **Core Web Vitals** | LCP < 2.5s, FID < 100ms, CLS < 0.1 |

#### Sitemap.xml
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://petrigastro.com/</loc>
    <lastmod>2024-01-15</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://petrigastro.com/menu</loc>
    <lastmod>2024-01-15</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://petrigastro.com/reservas</loc>
    <lastmod>2024-01-15</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
</urlset>
```

#### robots.txt
```
User-agent: *
Allow: /
Disallow: /admin
Disallow: /api

Sitemap: https://petrigastro.com/sitemap.xml
```

---

### 0.3 ⚡ PERFORMANCE

#### Dependencias
```bash
# Frontend
cd client
npm install vite-plugin-compression vite-plugin-pwa @vitejs/plugin-react
npm install @tanstack/react-query # ya incluido en FASE 1
npm install lucide-react          # iconos optimizados
```

#### Configuración de Vite
```javascript
// client/vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import compression from 'vite-plugin-compression';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'robots.txt'],
      manifest: {
        name: 'PetriGastro',
        short_name: 'PetriGastro',
        theme_color: '#1a1a2e',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          { src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,avif}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 }
            }
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|avif)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 * 30 }
            }
          }
        ]
      }
    }),
    compression({ algorithm: 'gzip', ext: '.gz' })
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          utils: ['axios', 'lucide-react']
        }
      }
    },
    chunkSizeWarningLimit: 500
  },
  server: {
    port: 3000,
    open: true
  }
});
```

#### Code Splitting
```javascript
// client/src/App.jsx
import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

const Home = lazy(() => import('./pages/Home'));
const Menu = lazy(() => import('./pages/Menu'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Reservas = lazy(() => import('./pages/Reservas'));
const Admin = lazy(() => import('./pages/Admin'));
const NotFound = lazy(() => import('./pages/NotFound'));

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/reservas" element={<Reservas />} />
          <Route path="/admin/*" element={<Admin />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
```

#### Optimización de Imágenes
```javascript
// client/src/components/OptimizedImage.jsx
import { lazy, Suspense } from 'react';

export function OptimizedImage({ src, alt, className, width, height }) {
  return (
    <picture>
      <source srcSet={src.replace(/\.\w+$/, '.avif')} type="image/avif" />
      <source srcSet={src.replace(/\.\w+$/, '.webp')} type="image/webp" />
      <img
        src={src}
        alt={alt}
        className={className}
        width={width}
        height={height}
        loading="lazy"
        decoding="async"
      />
    </picture>
  );
}
```

#### React Query para Caching
```javascript
// client/src/services/api.js
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
});

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,    // 5 minutos
      cacheTime: 30 * 60 * 1000,   // 30 minutos
      refetchOnWindowFocus: false,
      retry: 2
    }
  }
});

export default api;
```

#### Memoización
```javascript
// useMemo para cálculos costosos
const filteredPlatos = useMemo(() => {
  return platos.filter(p => p.categoria === activeCategory);
}, [platos, activeCategory]);

// useCallback para funciones de callback
const handleAddToCart = useCallback((plato) => {
  dispatch({ type: 'ADD_ITEM', payload: plato });
}, [dispatch]);

// React.memo para componentes
const MenuCard = memo(({ plato, onAdd }) => (
  <div className="card">
    <img src={plato.imagen} alt={plato.nombre} />
    <h3>{plato.nombre}</h3>
    <button onClick={() => onAdd(plato)}>Añadir</button>
  </div>
));
```

#### Optimización de Fuentes
```html
<!-- index.html - preload fuentes críticas -->
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet" />
```

#### Backend Compression
```javascript
// server/config/compression.js
import compression from 'compression';
import express from 'express';

export const applyCompression = (app) => {
  app.use(compression({
    level: 6,
    threshold: 1024,
    filter: (req, res) => {
      if (req.headers['x-no-compression']) return false;
      return compression.filter(req, res);
    }
  }));
};
```

#### CDN y Storage
| Recurso | Servicio | Notas |
|---------|----------|-------|
| Imágenes | Supabase Storage | CDN incluido |
| Fuentes | Google Fonts | Preconnect |
| Iconos | Lucide React | SVG inline, no icon fonts |

#### Core Web Vitals Targets

| Métrica | Target | Cómo optimizar |
|---------|--------|----------------|
| **LCP** (< 2.5s) | Preload imagen hero, CSS crítico inline | |
| **FID** (< 100ms) | Code splitting, defer JS no crítico | |
| **CLS** (< 0.1) | Reserved space para imágenes, no FOUC | |

#### Lighthouse Targets

| Categoría | Target |
|-----------|--------|
| Performance | > 90 |
| Accessibility | > 95 |
| Best Practices | > 90 |
| SEO | > 95 |

---

### 0.4 📊 MONITORING

#### Dependencias
```bash
# Backend
npm install pino pino-pretty

# Frontend
npm install web-vitals
```

#### Web Vitals Tracking
```javascript
// client/src/index.jsx
import { getCLS, getFID, getLCP, getTTFB, getFCP } from 'web-vitals';

function sendToAnalytics({ name, value, id }) {
  fetch('/api/analytics', {
    method: 'POST',
    body: JSON.stringify({ metric: name, value, id })
  });
}

getCLS(sendToAnalytics);
getFID(sendToAnalytics);
getLCP(sendToAnalytics);
getTTFB(sendToAnalytics);
getFCP(sendToAnalytics);
```

#### Logging en Backend
```javascript
// server/config/logger.js
import pino from 'pino';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: process.env.NODE_ENV === 'development' ? {
    target: 'pino-pretty',
    options: { colorize: true }
  } : undefined
});
```

---

### 0.5 Checklist de Seguridad, SEO y Performance

#### Seguridad
- [ ] bcrypt con 12 rounds implementado
- [ ] JWT con expiración de 15 min
- [ ] Refresh tokens HTTPOnly
- [ ] Rate limiting configurado
- [ ] Helmet con CSP strict
- [ ] Validación de inputs en todas las rutas
- [ ] Prepared statements (no concatenación SQL)
- [ ] CORS whitelist configurado
- [ ] Tokens CSRF en formularios
- [ ] HTTPS obligatorio en producción
- [ ] Secrets en .env (no hardcoded)
- [ ] Logs de intentos fallidos
- [ ] X-Frame-Options: DENY
- [ ] Validación de complejidad de passwords

#### SEO
- [ ] React Helmet en todas las páginas
- [ ] Meta descriptions únicas por página
- [ ] Open Graph tags configurados
- [ ] Twitter cards configurados
- [ ] Schema.org JSON-LD (Restaurant)
- [ ] sitemap.xml creado y actualizado
- [ ] robots.txt configurado
- [ ] URLs amigables
- [ ] Lang="es" en HTML
- [ ] Alt text en todas las imágenes
- [ ] Breadcrumbs implementados
- [ ] Canonical URLs configurados
- [ ] Semantic HTML (header, main, nav, etc.)

#### Performance
- [ ] Code splitting con lazy()
- [ ] Images en AVIF + WebP
- [ ] Lazy loading de imágenes
- [ ] Google Fonts con preconnect + display=swap
- [ ] Compression gzip/brotli en Express
- [ ] React Query caching configurado
- [ ] useMemo/useCallback implementados
- [ ] PWA con Service Worker
- [ ] Preload de recursos críticos
- [ ] Bundle < 200KB inicial
- [ ] LCP < 2.5s
- [ ] FID < 100ms
- [ ] CLS < 0.1
- [ ] Lighthouse Performance > 90

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

# 3. Frontend (React + Vite)
cd client
npm create vite@latest . -- --template react
npm install react-router-dom @tanstack/react-query axios
npm install react-helmet-async lucide-react web-vitals
npm install -D tailwindcss postcss autoprefixer vite-plugin-pwa vite-plugin-compression
npx tailwindcss init -p

# 4. Backend (Node.js + Express)
cd ../server
npm init -y
npm install express cors dotenv pg bcryptjs jsonwebtoken express-validator helmet morgan compression express-rate-limit
npm install -D nodemon

# 5. Configurar Supabase
# Ir a supabase.com, crear proyecto, copiar credenciales

# 6. Ejecutar migraciones SQL en Supabase

# 7. Ejecutar seeders

# 8. Probar localmente
# Terminal 1: cd server && npm run dev
# Terminal 2: cd client && npm run dev

# 9. Testing de seguridad
# Instalar sqlmap y probar endpoints
npm install -D sqlmap
```

---

## Checklist Pre-Producción

### Seguridad
- [ ] bcrypt con 12 rounds implementado
- [ ] JWT con expiración de 15 min + refresh tokens
- [ ] Rate limiting (100 req/15min, 5 login/15min)
- [ ] Helmet con CSP strict
- [ ] Validación de inputs en todas las rutas
- [ ] CORS whitelist configurado
- [ ] Logs de intentos fallidos
- [ ] X-Frame-Options: DENY
- [ ] HTTPS obligatorio

### SEO
- [ ] React Helmet en todas las páginas
- [ ] Meta descriptions + Open Graph por página
- [ ] Schema.org Restaurant JSON-LD
- [ ] sitemap.xml creado
- [ ] robots.txt configurado
- [ ] URLs amigables
- [ ] Alt text en imágenes
- [ ] Semantic HTML

### Performance
- [ ] Code splitting con lazy()
- [ ] Imágenes AVIF + WebP
- [ ] Lazy loading
- [ ] Google Fonts optimizado
- [ ] Compression gzip/brotli
- [ ] PWA con Service Worker
- [ ] React Query caching

### Core Web Vitals
- [ ] LCP < 2.5s
- [ ] FID < 100ms
- [ ] CLS < 0.1

### Lighthouse
- [ ] Performance > 90
- [ ] Accessibility > 95
- [ ] Best Practices > 90
- [ ] SEO > 95

### Funcionalidad
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