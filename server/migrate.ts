import dns from 'dns'
dns.setDefaultResultOrder('ipv4first')
import fs from 'fs'
import path from 'path'
import { Pool, PoolConfig } from 'pg'
import logger from './config/logger'

function getPoolConfig(): PoolConfig {
  return process.env.DATABASE_URL
    ? { connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } }
    : {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432', 10) || 5432,
        database: process.env.DB_NAME || 'petrigastro',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD
      }
}

async function runMigrations(): Promise<void> {
  const pool = new Pool(getPoolConfig())

  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        name VARCHAR(255) PRIMARY KEY,
        run_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `)

    const migrationsDir = path.join(__dirname, 'migrations')
    let files: string[] = []
    if (fs.existsSync(migrationsDir)) {
      files = fs.readdirSync(migrationsDir)
        .filter(f => f.endsWith('.sql'))
        .sort()
    }

    for (const file of files) {
      const { rows } = await pool.query(
        'SELECT 1 FROM migrations WHERE name = $1',
        [file]
      )

      if (rows.length > 0) {
        logger.info(`Migration ${file} already run, skipping`)
        continue
      }

      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf-8')

      try {
        await pool.query('BEGIN')
        await pool.query(sql)
        await pool.query('INSERT INTO migrations (name) VALUES ($1)', [file])
        await pool.query('COMMIT')
        logger.info(`Migration ${file} applied successfully`)
      } catch (err) {
        await pool.query('ROLLBACK')
        const error = err as Error
        logger.error({ err: error.message, context: `migration:${file}` })
        throw err
      }
    }

    logger.info('All migrations completed')
  } finally {
    await pool.end()
  }
}

export { runMigrations }

if (require.main === module) {
  runMigrations()
    .then(() => process.exit(0))
    .catch(() => process.exit(1))
}
