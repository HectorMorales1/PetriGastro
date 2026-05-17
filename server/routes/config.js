const express = require('express')
const pool = require('../config/db')
const { adminMiddleware } = require('../middleware/auth')

const router = express.Router()

// Get config
router.get('/', async (req, res) => {
  try {
    const result = await pool.query("SELECT clave, valor FROM configuracion_pedidos")
    const config = {}
    result.rows.forEach(row => {
      config[row.clave] = row.valor
    })
    res.json(config)
  } catch (error) {
    console.error('Error getting config:', error)
    res.status(500).json({ message: 'Error del servidor' })
  }
})

// Update config
router.put('/', adminMiddleware, async (req, res) => {
  try {
    const { clave, valor } = req.body
    await pool.query(
      'INSERT INTO configuracion_pedidos (clave, valor) VALUES ($1, $2) ON CONFLICT (clave) DO UPDATE SET valor = $2, updated_at = CURRENT_TIMESTAMP',
      [clave, valor]
    )
    res.json({ message: 'Configuración actualizada' })
  } catch (error) {
    console.error('Error updating config:', error)
    res.status(500).json({ message: 'Error del servidor' })
  }
})

// Generar fechas para los proximos 30 dias
router.post('/generar-fechas', adminMiddleware, async (req, res) => {
  const client = await pool.connect()
  try {
    // Obtener config
    const configResult = await client.query("SELECT clave, valor FROM configuracion_pedidos")
    const config = {}
    configResult.rows.forEach(row => {
      config[row.clave] = row.valor
    })

    const diasActivos = (config.dias_activos || '1,2,3,4,5,6').split(',').map(Number)
    const horariosDefecto = (config.horarios_defecto || '12:00,13:00,14:00,19:00,20:00,21:00').split(',')

    await client.query('BEGIN')

    const hoy = new Date()
    let fechasCreadas = 0

    for (let i = 1; i <= 30; i++) {
      const fecha = new Date(hoy)
      fecha.setDate(fecha.getDate() + i)
      const diaSemana = fecha.getDay()

      if (diasActivos.includes(diaSemana)) {
        const fechaStr = fecha.toISOString().split('T')[0]
        
        const existing = await client.query(
          'SELECT id FROM fechas_disponibles WHERE fecha = $1',
          [fechaStr]
        )
        
        if (existing.rows.length === 0) {
          const fechaResult = await client.query(
            'INSERT INTO fechas_disponibles (fecha) VALUES ($1) RETURNING id',
            [fechaStr]
          )
          
          for (const hora of horariosDefecto) {
            await client.query(
              'INSERT INTO horarios_disponibles (fecha, hora) VALUES ($1, $2)',
              [fechaStr, hora + ':00']
            )
          }
          
          fechasCreadas++
        }
      }
    }
    
    await client.query('COMMIT')
    res.json({ message: `Se generaron ${fechasCreadas} fechas` })
  } catch (error) {
    await client.query('ROLLBACK')
    console.error('Error generating dates:', error)
    res.status(500).json({ message: 'Error del servidor' })
  } finally {
    client.release()
  }
})

module.exports = router