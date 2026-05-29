import 'dotenv/config'
import { Pool, PoolConfig } from 'pg'
import bcrypt from 'bcryptjs'
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

async function seed() {
  const pool = new Pool(getPoolConfig())

  try {
    logger.info('Seeding database...')

    const adminPassword = await bcrypt.hash('admin123', 10)
    const clientPassword = await bcrypt.hash('cliente123', 10)

    await pool.query('BEGIN')

    await pool.query(`
      INSERT INTO usuarios (nombre, apellidos, email, password_hash, rol, estado_solicitud, email_verificado, fecha_solicitud)
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
      ON CONFLICT (email) DO NOTHING
    `, ['Admin', 'PetriGastro', 'admin@petrigastro.com', adminPassword, 'admin', 'aprobado', true])

    const clientResult = await pool.query(`
      INSERT INTO usuarios (nombre, apellidos, email, password_hash, rol, estado_solicitud, email_verificado, fecha_solicitud)
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
      ON CONFLICT (email) DO NOTHING
      RETURNING id
    `, ['Juan', 'Pérez', 'juan@email.com', clientPassword, 'cliente', 'aprobado', true])

    await pool.query(`
      INSERT INTO categorias (nombre, icono, orden) VALUES
      ('Entrantes', '🥗', 1),
      ('Principales', '🍝', 2),
      ('Postres', '🍰', 3),
      ('Bebidas', '🥤', 4)
      ON CONFLICT DO NOTHING
    `)

    const catResult = await pool.query('SELECT id FROM categorias WHERE nombre = $1', ['Principales'])
    const principalesId = catResult.rows[0]?.id
    const postresResult = await pool.query('SELECT id FROM categorias WHERE nombre = $1', ['Postres'])
    const postresId = postresResult.rows[0]?.id
    const bebidasResult = await pool.query('SELECT id FROM categorias WHERE nombre = $1', ['Bebidas'])
    const bebidasId = bebidasResult.rows[0]?.id

    if (principalesId && postresId && bebidasId) {
      const exists = await pool.query('SELECT 1 FROM platos WHERE nombre = $1', ['Spaghetti Bolognese'])
      if (exists.rows.length === 0) {
        await pool.query(`
          INSERT INTO platos (nombre, descripcion, precio, categoria_id, disponible, destacado, ingredientes) VALUES
          ('Ensalada César', 'Lechuga, pollo, croutons y parmesano', 9.50, ${principalesId}, TRUE, FALSE, 'Lechuga, pollo, croutons, queso parmesano, aderezo César'),
          ('Spaghetti Bolognese', 'Pasta con salsa de carne tradicional', 12.00, ${principalesId}, TRUE, TRUE, 'Spaghetti, carne molida, tomate, cebolla, ajo, hierbas'),
          ('Tiramisú', 'Postre italiano clásico de café', 6.50, ${postresId}, TRUE, FALSE, 'Café, mascarpone, bizcochos, cacao, huevos'),
          ('Agua mineral', 'Botella 500ml', 2.00, ${bebidasId}, TRUE, FALSE, 'Agua mineral natural')
        `)

        if (clientResult.rows[0]?.id) {
          const userId = clientResult.rows[0].id
          const platoResult = await pool.query('SELECT id, precio FROM platos WHERE nombre LIKE $1', ['Spaghetti%'])
          const plato2Result = await pool.query('SELECT id, precio FROM platos WHERE nombre = $1', ['Tiramisú'])
          const plato3Result = await pool.query('SELECT id, precio FROM platos WHERE nombre = $1', ['Agua mineral'])

          if (platoResult.rows[0] && plato2Result.rows[0] && plato3Result.rows[0]) {
            const total = 12.00 + 6.50 + 2.00
            const pedidoResult = await pool.query(`
              INSERT INTO pedidos (usuario_id, total, notas, fecha_recogida, estado)
              VALUES ($1, $2, 'Sin cebolla', CURRENT_DATE + 1, 'pendiente')
              RETURNING id
            `, [userId, total])

            const pedidoId = pedidoResult.rows[0].id
            await pool.query(`
              INSERT INTO pedido_detalles (pedido_id, plato_id, cantidad, precio_unitario) VALUES
              ($1, $2, 1, $3),
              ($1, $4, 1, $5),
              ($1, $6, 1, $7)
            `, [pedidoId, platoResult.rows[0].id, platoResult.rows[0].precio,
                plato2Result.rows[0].id, plato2Result.rows[0].precio,
                plato3Result.rows[0].id, plato3Result.rows[0].precio])

            await pool.query(`
              INSERT INTO pedido_feedback (pedido_id, usuario_id, calificacion, comentario)
              VALUES ($1, $2, 5, 'Todo excelente, muy buena comida')
              ON CONFLICT (pedido_id) DO NOTHING
            `, [pedidoId, userId])
          }
        }
      }
    }

    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const dayAfter = new Date()
    dayAfter.setDate(dayAfter.getDate() + 2)

    const fmtDate = (d: Date) => d.toISOString().split('T')[0]

    await pool.query(`
      INSERT INTO fechas_disponibles (fecha, activo) VALUES
      ($1::date, TRUE),
      ($2::date, TRUE)
      ON CONFLICT (fecha) DO NOTHING
    `, [fmtDate(tomorrow), fmtDate(dayAfter)])

    const times = ['12:00', '13:00', '14:00', '19:00', '20:00', '21:00']
    for (const fechaStr of [fmtDate(tomorrow), fmtDate(dayAfter)]) {
      for (const hora of times) {
        await pool.query(`
          INSERT INTO horarios_disponibles (fecha, hora, disponible)
          VALUES ($1::date, $2::time, TRUE)
          ON CONFLICT DO NOTHING
        `, [fechaStr, hora])
      }
    }

    await pool.query(`
      INSERT INTO configuracion_pedidos (clave, valor) VALUES
      ('dias_activos', '1,2,3,4,5,6'),
      ('horarios_defecto', '12:00,13:00,14:00,19:00,20:00,21:00')
      ON CONFLICT (clave) DO NOTHING
    `)

    await pool.query('COMMIT')
    logger.info('Seed completed successfully')
  } catch (err) {
    await pool.query('ROLLBACK')
    logger.error({ err }, 'Seed failed')
    throw err
  } finally {
    await pool.end()
  }
}

seed()
  .then(() => process.exit(0))
  .catch(() => process.exit(1))
