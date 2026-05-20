require('dotenv').config()
const fs = require('fs')
const path = require('path')
const { Pool } = require('pg')

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
})

async function runMigrations() {
  const client = await pool.connect()
  
  try {
    console.log('🔄 Ejecutando migraciones...\n')
    
    // Migration 001 - Schema inicial
    const m1 = fs.readFileSync(path.join(__dirname, 'database', 'migrations', '001_initial_schema.sql'), 'utf8')
    await client.query(m1)
    console.log('✅ Schema inicial')
    
    // Migration 002
    const m2 = fs.readFileSync(path.join(__dirname, 'database', 'migrations', '002_add_destacado.sql'), 'utf8')
    await client.query(m2)
    console.log('✅ Migration 002')
    
    // Migration 003
    const m3 = fs.readFileSync(path.join(__dirname, 'database', 'migrations', '003_add_apellidos.sql'), 'utf8')
    await client.query(m3)
    console.log('✅ Migration 003')
    
    // Migration 004 - Fechas disponibles
    const m4 = fs.readFileSync(path.join(__dirname, 'database', 'migrations', '004_add_fecha_recogida.sql'), 'utf8')
    await client.query(m4)
    console.log('✅ Migration 004 - Fechas')
    
    // Migration 005 - Dias configurables
    const m5 = fs.readFileSync(path.join(__dirname, 'database', 'migrations', '005_dias_disponibles.sql'), 'utf8')
    await client.query(m5)
    console.log('✅ Migration 005 - Días configurables')
    
    console.log('\n🎉 Migraciones completadas!')
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    client.release()
    await pool.end()
  }
}

runMigrations()