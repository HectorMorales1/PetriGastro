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
const logger = require('./config/logger')
const fs = require('fs')
const { Pool } = require('pg')

const app = express()

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
app.use('/api/feedback', feedbackRoutes)

app.use((err, req, res, next) => {
  logger.error(err.stack)
  res.status(500).json({ message: 'Error del servidor' })
})

app.disable('x-powered-by')
app.use((req, res, next) => {
  res.setHeader('X-Frame-Options', 'DENY')
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()')
  next()
})

const migrateDb = async () => {
  const pool = new Pool({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  })
  
  try {
    const migrationsDir = path.join(__dirname, '..', 'database', 'migrations')
    const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort()
    
    for (const file of files) {
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8')
      await pool.query(sql)
      logger.info(`Migración ejecutada: ${file}`)
    }
    logger.info('Base de datos migrada exitosamente')
  } catch (error) {
    logger.error('Error migrando base de datos:', error.message)
  } finally {
    await pool.end()
  }
}

if (process.env.NODE_ENV === 'production') {
  migrateDb()
}

module.exports = app