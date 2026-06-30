import { Pool } from 'pg'
import logger from './logger'

if (!process.env.DATABASE_URL && !process.env.DB_PASSWORD) {
  throw new Error(
    'Configuración de base de datos requerida. Define DATABASE_URL o DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD en .env'
  )
}

const sslConfig = process.env.DB_CA_CERT
  ? { rejectUnauthorized: true, ca: process.env.DB_CA_CERT }
  : { rejectUnauthorized: false }

const poolMax = parseInt(process.env.DB_POOL_MAX || '20', 10)

const pool = new Pool(
  process.env.DATABASE_URL
    ? { connectionString: process.env.DATABASE_URL, ssl: sslConfig, max: poolMax }
    : {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432', 10) || 5432,
        database: process.env.DB_NAME || 'petrigastro',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD,
        ssl: sslConfig,
        max: poolMax
      }
)

pool.on('error', (err: Error) => {
  logger.error({ err, context: 'db-pool' }, 'Unexpected error on idle client')
})

export default pool
