import 'dotenv/config'
import dns from 'dns'
dns.setDefaultResultOrder('ipv4first')
import https from 'https'
import fs from 'fs'
import path from 'path'
import app from './app'
import logger from './config/logger'
import { runMigrations } from './migrate'

const REQUIRED_ENV_VARS = ['JWT_SECRET']
for (const envVar of REQUIRED_ENV_VARS) {
  if (!process.env[envVar]) {
    logger.fatal({ err: `Missing required environment variable: ${envVar}` }, 'Environment validation failed')
    process.exit(1)
  }
}

const PORT = process.env.PORT || 3000
const NODE_ENV = process.env.NODE_ENV || 'development'

process.on('unhandledRejection', (reason: unknown) => {
  logger.error({ err: reason, context: 'unhandledRejection' }, 'Unhandled Promise Rejection')
})

process.on('uncaughtException', (error: Error) => {
  logger.fatal({ err: error, context: 'uncaughtException' }, 'Uncaught Exception')
  process.exit(1)
})

runMigrations().then(() => {
  const certPath = process.env.SSL_CERT_PATH
  const keyPath = process.env.SSL_KEY_PATH

  if (NODE_ENV === 'production' && certPath && keyPath) {
    const sslOptions: https.ServerOptions = {
      cert: fs.readFileSync(path.resolve(certPath)),
      key: fs.readFileSync(path.resolve(keyPath))
    }
    https.createServer(sslOptions, app).listen(PORT as number, '0.0.0.0', () => {
      logger.info(`Servidor HTTPS corriendo en puerto ${PORT}`)
      logger.info(`Entorno: ${NODE_ENV}`)
    })
  } else {
    app.listen(PORT as number, '0.0.0.0', () => {
      logger.info(`Servidor HTTP corriendo en puerto ${PORT}`)
      logger.info(`Entorno: ${NODE_ENV}`)
      if (NODE_ENV === 'production') {
        logger.warn('⚠️  Producción sin HTTPS. Configura SSL_CERT_PATH y SSL_KEY_PATH en .env')
      }
    })
  }
})
