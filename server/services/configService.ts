import pool from '../config/db'

export async function get() {
  const result = await pool.query("SELECT clave, valor FROM configuracion_pedidos")
  const config: Record<string, string> = {}
  result.rows.forEach(row => {
    config[row.clave as string] = row.valor as string
  })
  return config
}

export async function update(clave: string, valor: string) {
  await pool.query(
    'INSERT INTO configuracion_pedidos (clave, valor) VALUES ($1, $2) ON CONFLICT (clave) DO UPDATE SET valor = $2, updated_at = CURRENT_TIMESTAMP',
    [clave, valor]
  )
}

export async function generarFechas() {
  const client = await pool.connect()
  try {
    const configResult = await client.query("SELECT clave, valor FROM configuracion_pedidos")
    const config: Record<string, string> = {}
    configResult.rows.forEach(row => {
      config[row.clave as string] = row.valor as string
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
          await client.query('INSERT INTO fechas_disponibles (fecha) VALUES ($1)', [fechaStr])

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
    return fechasCreadas
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}
