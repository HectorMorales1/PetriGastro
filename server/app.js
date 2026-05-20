const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const compression = require('compression')
const rateLimit = require('express-rate-limit')
const path = require('path')

const authRoutes = require('./routes/auth')
const platosRoutes = require('./routes/platos')
const categoriasRoutes = require('./routes/categorias')
const pedidosRoutes = require('./routes/pedidos')
const fechasRoutes = require('./routes/fechas')
const configRoutes = require('./routes/config')
const uploadRoutes = require('./routes/upload')
const feedbackRoutes = require('./routes/feedback')
const usuarioRoutes = require('./routes/usuarios')
const logger = require('./config/logger')
const fs = require('fs')
const { Pool } = require('pg')

const app = express()

app.set('trust proxy', 1)

app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://js.stripe.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      imgSrc: ["'self'", "data:", "https://*.supabase.co", "https://images.unsplash.com", "http://localhost:3000"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      connectSrc: ["'self'", "https://*.supabase.co"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"]
    }
  },
  crossOriginEmbedderPolicy: false
}))

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}))

app.use(compression({
  level: 6,
  threshold: 1024
}))

app.use(express.json())
app.use(morgan('combined', { stream: { write: msg => logger.info(msg) } }))

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Demasiadas solicitudes, intenta más tarde'
})

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: 'Demasiados intentos de login, espera 15 minutos'
})

app.use('/api/', generalLimiter)
app.use('/api/auth/', authLimiter)

app.use('/api/auth', authRoutes)
app.use('/api/platos', platosRoutes)
app.use('/api/categorias', categoriasRoutes)
app.use('/api/pedidos', pedidosRoutes)
app.use('/api/fechas', fechasRoutes)
app.use('/api/config', configRoutes)
app.use('/api/upload', uploadRoutes)
app.use('/api/usuarios', usuarioRoutes)
app.use('/api/feedback', feedbackRoutes)

app.use((err, req, res, next) => {
  logger.error(err.stack)
  res.status(500).json({ message: 'Error del servidor' })
})

app.get('/', (req, res) => {
  res.json({ status: 'ok', service: 'PetriGastro API', timestamp: new Date().toISOString() })
})

app.disable('x-powered-by')
app.use((req, res, next) => {
  res.setHeader('X-Frame-Options', 'DENY')
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()')
  next()
})

const seedDb = async (pool) => {
  try {
    logger.info('Iniciando seed...')
    
    await pool.query(`
      INSERT INTO categorias (nombre, icono, orden) VALUES
      ('Entrantes', '🥗', 1),
      ('Principales', '🍽️', 2),
      ('Postres', '🍰', 3),
      ('Bebidas', '🥤', 4)
      ON CONFLICT DO NOTHING
    `)
    logger.info('Categorías insertadas')
    
    const cats = await pool.query('SELECT id, nombre FROM categorias ORDER BY orden')
    logger.info('Categorías obténdas:', cats.rows.length)
    
    const platos = [
      ['Ensalada César', 'Lechuga romana, pollo grille, parmesano, crutones, salsa César', 12.50, cats.rows[0]?.id, true, true],
      ['Croquetas de Jamón', '8 unidades de croquetas caseras de jamón ibérico', 10.00, cats.rows[0]?.id, true, false],
      ['Patatas Bravas', 'Patatas fritas con salsa brava y alioli', 8.50, cats.rows[0]?.id, true, false],
      ['Paella Valenciana', 'Arroz tradicional con marisco, pollo y conejo', 22.00, cats.rows[1]?.id, true, true],
      ['Lomo de Merluza', 'Merluza fresca con verduras y patatas', 19.50, cats.rows[1]?.id, true, false],
      ['Entrecot de Ternera', '300g de entrecot con verduras asadas', 26.00, cats.rows[1]?.id, true, true],
      ['Risotto de Setas', 'Risotto italiano con setas silvestres', 16.00, cats.rows[1]?.id, true, false],
      ['Tiramisú', 'Postre italiano con café, mascarpone y cacao', 9.00, cats.rows[2]?.id, true, false],
      ['Flan de Caramelo', 'Flan casero con crema de vainilla', 7.50, cats.rows[2]?.id, true, false],
      ['Cerveza', 'Cerveza nacional 33cl', 4.00, cats.rows[3]?.id, true, false]
    ]
    
    for (const p of platos) {
      await pool.query(
        'INSERT INTO platos (nombre, descripcion, precio, categoria_id, disponible, destacado) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT DO NOTHING',
        p
      )
    }
    
    await pool.query(`
      INSERT INTO usuarios (nombre, email, password_hash, rol, estado_solicitud, email_verificado) VALUES
      ('Administrador', 'admin@petrigastro.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5eX5J8fG4I6y', 'admin', 'aprobado', true)
      ON CONFLICT DO NOTHING
    `)
    
    await pool.query(`
      INSERT INTO configuracion_pedidos (clave, valor) VALUES
      ('dias_activos', '1,2,3,4,5'),
      ('horarios_defecto', '12:00,13:00,14:00,19:00,20:00,21:00')
      ON CONFLICT DO NOTHING
    `)
    
    logger.info('Seed completado')
  } catch (error) {
    logger.error('Error en seed:', error.message)
  }
}

const startMigration = async () => {
  const pool = new Pool(
    process.env.DATABASE_URL
      ? { connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } }
      : {
          host: process.env.DB_HOST,
          port: parseInt(process.env.DB_PORT) || 5432,
          database: process.env.DB_NAME,
          user: process.env.DB_USER,
          password: process.env.DB_PASSWORD,
          ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
        }
  )
  
  try {
    const migrationsDir = path.join(__dirname, 'database', 'migrations')
    const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort()
    
    for (const file of files) {
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8')
      await pool.query(sql)
      logger.info(`Migración ejecutada: ${file}`)
    }
    
    await seedDb(pool)
  } catch (error) {
    logger.error({ err: error }, 'Error migrando base de datos')
  } finally {
    await pool.end()
  }
}

if (process.env.NODE_ENV === 'production') {
  startMigration()
}

module.exports = app