const pool = require('../config/db')
const logger = require('../config/logger')
const { AppError, asyncHandler } = require('../middleware/errorHandler')

const ESTADOS_VALIDOS = ['pendiente', 'confirmado', 'cancelado']

exports.create = asyncHandler(async (req, res) => {
  const { nombre, email, telefono, fecha, hora, personas, notas } = req.body

  const result = await pool.query(
    'INSERT INTO reservas (nombre, email, telefono, fecha, hora, personas, notas) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
    [nombre, email, telefono, fecha, hora, personas, notas]
  )

  res.status(201).json(result.rows[0])
})

exports.getAll = asyncHandler(async (req, res) => {
  const result = await pool.query('SELECT * FROM reservas ORDER BY fecha DESC, hora DESC')
  res.json(result.rows)
})

exports.updateEstado = asyncHandler(async (req, res) => {
  const { id } = req.params
  const { estado } = req.body

  if (!estado || !ESTADOS_VALIDOS.includes(estado)) {
    throw new AppError(`Estado inválido. Estados válidos: ${ESTADOS_VALIDOS.join(', ')}`, 400)
  }

  const result = await pool.query(
    'UPDATE reservas SET estado = $1 WHERE id = $2 RETURNING *',
    [estado, id]
  )

  if (result.rows.length === 0) {
    throw new AppError('Reserva no encontrada', 404)
  }

  res.json(result.rows[0])
})