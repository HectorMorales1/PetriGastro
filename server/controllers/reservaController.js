const pool = require('../config/db')

exports.create = async (req, res) => {
  try {
    const { nombre, email, telefono, fecha, hora, personas, notas } = req.body

    const result = await pool.query(
      'INSERT INTO reservas (nombre, email, telefono, fecha, hora, personas, notas) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [nombre, email, telefono, fecha, hora, personas, notas]
    )

    res.status(201).json(result.rows[0])
  } catch (error) {
    console.error('Error creating reserva:', error)
    res.status(500).json({ message: 'Error del servidor' })
  }
}

exports.getAll = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM reservas ORDER BY fecha DESC, hora DESC')
    res.json(result.rows)
  } catch (error) {
    console.error('Error getting reservas:', error)
    res.status(500).json({ message: 'Error del servidor' })
  }
}

exports.updateEstado = async (req, res) => {
  try {
    const { id } = req.params
    const { estado } = req.body

    const result = await pool.query(
      'UPDATE reservas SET estado = $1 WHERE id = $2 RETURNING *',
      [estado, id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Reserva no encontrada' })
    }

    res.json(result.rows[0])
  } catch (error) {
    console.error('Error updating reserva:', error)
    res.status(500).json({ message: 'Error del servidor' })
  }
}