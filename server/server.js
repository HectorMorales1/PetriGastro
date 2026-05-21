require('dotenv').config()
const app = require('./app')
const logger = require('./config/logger')
const { runMigrations } = require('./config/migrations')

const PORT = process.env.PORT || 3000

process.on('unhandledRejection', (reason) => {
  logger.error({ err: reason, context: 'unhandledRejection' }, 'Unhandled Promise Rejection')
})

process.on('uncaughtException', (error) => {
  logger.fatal({ err: error, context: 'uncaughtException' }, 'Uncaught Exception')
  process.exit(1)
})

runMigrations().then(() => {
  app.listen(PORT, () => {
    logger.info(`Servidor corriendo en puerto ${PORT}`)
    logger.info(`Entorno: ${process.env.NODE_ENV || 'development'}`)
  })
})