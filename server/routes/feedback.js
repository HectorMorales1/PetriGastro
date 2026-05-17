const express = require('express')
const pool = require('../config/db')
const { authMiddleware } = require('../middleware/auth')

const router = express.Router()

// Crear feedback de un pedido
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { pedido_id, calificacion, comentario } = req.body
    const usuario_id = req.user.id

    const pedidoCheck = await pool.query(
      'SELECT id, usuario_id FROM pedidos WHERE id = $1',
      [pedido_id]
    )

    if (pedidoCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Pedido no encontrado' })
    }

    if (pedidoCheck.rows[0].usuario_id !== usuario_id) {
      return res.status(403).json({ message: 'No puedes valorar este pedido' })
    }

    const result = await pool.query(
      `INSERT INTO pedido_feedback (pedido_id, usuario_id, calificacion, comentario)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (pedido_id) DO UPDATE SET calificacion = $3, comentario = $4
       RETURNING *`,
      [pedido_id, usuario_id, calificacion, comentario || null]
    )

    res.status(201).json(result.rows[0])
  } catch (error) {
    console.error('Error creating feedback:', error)
    res.status(500).json({ message: 'Error del servidor' })
  }
})

// Obtener feedback de un pedido
router.get('/pedido/:pedido_id', async (req, res) => {
  try {
    const { pedido_id } = req.params
    const result = await pool.query(
      'SELECT * FROM pedido_feedback WHERE pedido_id = $1',
      [pedido_id]
    )
    res.json(result.rows[0] || null)
  } catch (error) {
    console.error('Error getting feedback:', error)
    res.status(500).json({ message: 'Error del servidor' })
  }
})

// Obtener mis pedidos con feedback
router.get('/mis-pedidos', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT p.*, pf.calificacion, pf.comentario as feedback_comentario
      FROM pedidos p
      LEFT JOIN pedido_feedback pf ON p.id = pf.pedido_id
      WHERE p.usuario_id = $1
      ORDER BY p.created_at DESC
    `, [req.user.id])
    res.json(result.rows)
  } catch (error) {
    console.error('Error getting my pedidos:', error)
    res.status(500).json({ message: 'Error del servidor' })
  }
})

module.exports = router