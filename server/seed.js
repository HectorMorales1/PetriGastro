require('dotenv').config()
const fs = require('fs')
const path = require('path')
const { Pool } = require('pg')

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'petrigastro',
  user: 'postgres',
  password: 'password'
})

async function runSeeders() {
  const client = await pool.connect()
  
  try {
    console.log('🚀 Ejecutando seeders...')
    
    // Seed 001 - Datos básicos
    const seed1 = fs.readFileSync(path.join(__dirname, '..', 'database', 'seeders', '001_sample_data.sql'), 'utf8')
    await client.query(seed1)
    console.log('✅ Datos básicos insertados')
    
    // Seed 002 - Fechas disponibles
    const seed2 = fs.readFileSync(path.join(__dirname, '..', 'database', 'seeders', '002_fechas_demo.sql'), 'utf8')
    await client.query(seed2)
    console.log('✅ Fechas disponibles insertadas')

    // Seed 003 - Pedidos de ejemplo
    const seed3 = fs.readFileSync(path.join(__dirname, '..', 'database', 'seeders', '003_pedidos_demo.sql'), 'utf8')
    await client.query(seed3)
    console.log('✅ Pedidos de ejemplo insertados')
    
    console.log('\n🎉 Seeders completados correctamente!')
    console.log('\n📋 Credenciales de prueba:')
    console.log('   Admin: admin@petrigastro.com / admin123')
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    client.release()
    await pool.end()
  }
}

runSeeders()