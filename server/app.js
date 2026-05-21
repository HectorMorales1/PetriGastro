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
const { globalErrorHandler } = require('./middleware/errorHandler')

const app = express()

app.set('trust proxy', 1)

app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

const crypto = require('crypto')

const nonce = crypto.randomBytes(16).toString('base64')

app.use((req, res, next) => {
  res.locals.nonce = nonce
  next()
})

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", `'nonce-${nonce}'`, "https://js.stripe.com"],
      styleSrc: ["'self'", `'nonce-${nonce}'`, "https://fonts.googleapis.com"],
      imgSrc: ["'self'", "data:", "https://*.supabase.co", "https://images.unsplash.com"],
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

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: 'Demasiados intentos de login, espera 15 minutos'
})

const refreshLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  message: 'Demasiadas solicitudes de refresco, intenta más tarde'
})

app.use('/api/', generalLimiter)
app.use('/api/auth/login', loginLimiter)
app.use('/api/auth/register', loginLimiter)
app.use('/api/auth/refresh', refreshLimiter)

app.use('/api/auth', authRoutes)
app.use('/api/platos', platosRoutes)
app.use('/api/categorias', categoriasRoutes)
app.use('/api/pedidos', pedidosRoutes)
app.use('/api/fechas', fechasRoutes)
app.use('/api/config', configRoutes)
app.use('/api/upload', uploadRoutes)
app.use('/api/usuarios', usuarioRoutes)
app.use('/api/feedback', feedbackRoutes)

app.use(globalErrorHandler)

app.get('/', (req, res) => {
  res.json({ status: 'ok', service: 'PetriGastro API', timestamp: new Date().toISOString() })
})

app.disable('x-powered-by')
app.use((req, res, next) => {
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()')
  next()
})

module.exports = app