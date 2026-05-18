require('dotenv').config()
const app = require('./app')
const logger = require('./config/logger')

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  logger.info(`Servidor corriendo en puerto ${PORT}`)
  logger.info(`Entorno: ${process.env.NODE_ENV || 'development'}`)
})