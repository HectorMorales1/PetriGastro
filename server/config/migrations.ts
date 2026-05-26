import { runMigrations as runMigrationsFn } from '../migrate'
import logger from './logger'

async function runMigrationsWithLogging(): Promise<void> {
  try {
    await runMigrationsFn()
    logger.info('All migrations completed successfully')
  } catch (error) {
    const err = error as Error
    logger.error({ err: err.message, context: 'migrations' }, 'Migration failed')
    throw error
  }
}

export { runMigrationsWithLogging as runMigrations }
