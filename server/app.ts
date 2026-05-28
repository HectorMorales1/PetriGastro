import express, { Request, Response, NextFunction } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import rateLimit from 'express-rate-limit'
import crypto from 'crypto'
import pool from './config/db'

import authRoutes from './routes/auth'
import platosRoutes from './routes/platos'
import categoriasRoutes from './routes/categorias'
import pedidosRoutes from './routes/pedidos'
import fechasRoutes from './routes/fechas'
import configRoutes from './routes/config'
import uploadRoutes from './routes/upload'
import feedbackRoutes from './routes/feedback'
import usuarioRoutes from './routes/usuarios'
import { globalErrorHandler } from './middleware/errorHandler'

const app = express()

app.set('trust proxy', 1)

const nonce = crypto.randomBytes(16).toString('base64')

app.use((req: Request, res: Response, next: NextFunction) => {
  res.locals.nonce = nonce
  next()
})

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      scriptSrc: ["'self'", `'nonce-${nonce}'`],
      styleSrc: ["'self'", `'nonce-${nonce}'`, "https://fonts.googleapis.com"],
      imgSrc: ["'self'", "data:", "https://res.cloudinary.com", "https://images.unsplash.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      connectSrc: ["'self'"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: []
    }
  },
  crossOriginEmbedderPolicy: false,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
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

const writeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: 'Demasiadas solicitudes, intenta más tarde'
})

const verificarLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Demasiados intentos de verificación, espera 15 minutos'
})

app.use('/api/', generalLimiter)
app.use('/api/auth/login', loginLimiter)
app.use('/api/auth/register', loginLimiter)
app.use('/api/auth/refresh', refreshLimiter)
app.use('/api/auth/verificar', verificarLimiter)
app.use('/api/feedback', writeLimiter)
app.use('/api/usuarios', writeLimiter)
app.use('/api/fechas', writeLimiter)
app.use('/api/upload', writeLimiter)

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

app.get('/', async (req: Request, res: Response) => {
  let dbStatus = 'disconnected'
  try {
    await pool.query('SELECT 1')
    dbStatus = 'connected'
  } catch {
    dbStatus = 'error'
  }
  res.json({
    status: 'ok',
    service: 'PetriGastro API',
    version: '1.0.0',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    database: dbStatus
  })
})

app.disable('x-powered-by')
app.use((req: Request, res: Response, next: NextFunction) => {
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()')
  next()
})

app.use((req: Request, res: Response) => {
  res.status(404).json({ message: 'Ruta no encontrada' })
})

export default app
