require('dotenv').config()
const { Pool } = require('pg')

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
})

async function setup() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS configuracion_pedidos (
        id SERIAL PRIMARY KEY,
        clave VARCHAR(50) UNIQUE NOT NULL,
        valor TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)
    console.log('✅ Tabla creada')
    
    await pool.query(`
      INSERT INTO configuracion_pedidos (clave, valor) VALUES 
      ('dias_activos', '1,2,3,4,5,6'),
      ('horarios_defecto', '12:00,13:00,14:00,19:00,20:00,21:00')
      ON CONFLICT (clave) DO NOTHING
    `)
    console.log('✅ Datos iniciales insertados')
    
  } catch (e) {
    console.error('Error:', e.message)
  } finally {
    pool.end()
  }
}

setup()