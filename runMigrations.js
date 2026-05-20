require('dotenv').config()
const fs = require('fs')
const path = require('path')
const { Pool } = require('pg')

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: { rejectUnauthorized: false }
})

async function runMigrations() {
  const client = await pool.connect()
  const migrationsDir = path.join(__dirname, 'server', 'database', 'migrations')
  
  try {
    const files = fs.readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort()
    
    console.log(`Encontradas ${files.length} migraciones`)
    
    for (const file of files) {
      console.log(`Ejecutando ${file}...`)
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8')
      await client.query(sql)
      console.log(`  ✅ ${file}`)
    }
    
    console.log('\n🎉 Migraciones completadas!')
  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    client.release()
    await pool.end()
  }
}

runMigrations()