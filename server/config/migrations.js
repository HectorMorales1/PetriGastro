const { Pool } = require('pg')
const logger = require('./logger')

async function runMigrations() {
  const pool = new Pool(
    process.env.DATABASE_URL
      ? { connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } }
      : {
          host: process.env.DB_HOST || 'localhost',
          port: parseInt(process.env.DB_PORT) || 5432,
          database: process.env.DB_NAME || 'petrigastro',
          user: process.env.DB_USER || 'postgres',
          password: process.env.DB_PASSWORD
        }
  )

  try {
    await pool.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'usuarios' AND column_name = 'token_version'
        ) THEN
          ALTER TABLE usuarios ADD COLUMN token_version INTEGER DEFAULT 0;
        END IF;
      END $$;
    `)
    logger.info('Migration: token_version column ready')
  } catch (error) {
    logger.error({ err: error.message, context: 'migrations' }, 'Migration failed')
  } finally {
    await pool.end()
  }
}

module.exports = { runMigrations }