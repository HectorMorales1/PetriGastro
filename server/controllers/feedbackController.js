const pool = require('../config/db')
const logger = require('../config/logger')
const { AppError, asyncHandler } = require('../middleware/errorHandler')

exports.create = asyncHandler(async (req, res) => {
  const { pedido_id, calificacion, comentario } = req.body
  const usuario_id = req.user.id

  const commentSanitized = comentario
    ? comentario.replace(/<[^>]*>/g, '').trim()
    : null

  const pedidoCheck = await pool.query(
    'SELECT id, usuario_id FROM pedidos WHERE id = $1',
    [pedido_id]
  )

  if (pedidoCheck.rows.length === 0) {
    throw new AppError('Pedido no encontrado', 404)
  }

  if (pedidoCheck.rows[0].usuario_id !== usuario_id) {
    throw new AppError('No puedes valorar este pedido', 403)
  }

  const result = await pool.query(
    `INSERT INTO pedido_feedback (pedido_id, usuario_id, calificacion, comentario)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (pedido_id) DO UPDATE SET calificacion = $3, comentario = $4
     RETURNING *`,
    [pedido_id, usuario_id, calificacion, commentSanitized]
  )

  res.status(201).json(result.rows[0])
})

exports.getByPedido = asyncHandler(async (req, res) => {
  const { pedido_id } = req.params
  const result = await pool.query(
    'SELECT * FROM pedido_feedback WHERE pedido_id = $1',
    [pedido_id]
  )
  res.json(result.rows[0] || null)
})

exports.getMisPedidos = asyncHandler(async (req, res) => {
  const result = await pool.query(`
    SELECT p.*, pf.calificacion, pf.comentario as feedback_comentario
    FROM pedidos p
    LEFT JOIN pedido_feedback pf ON p.id = pf.pedido_id
    WHERE p.usuario_id = $1
    ORDER BY p.created_at DESC
  `, [req.user.id])
  res.json(result.rows)
})
