import pool from '../config/db'
import { AppError } from '../middleware/errorHandler'
import { attachItemsToPedidos } from '../utils/pedidoHelper'

export async function create(pedido_id: number, usuario_id: number, calificacion: number, comentario?: string) {
  const commentSanitized = comentario
    ? comentario.replace(/<[^>]*>/g, '').trim()
    : null

  const pedidoCheck = await pool.query('SELECT id, usuario_id FROM pedidos WHERE id = $1', [pedido_id])

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

  return result.rows[0]
}

export async function getByPedido(pedido_id: number) {
  const result = await pool.query('SELECT * FROM pedido_feedback WHERE pedido_id = $1', [pedido_id])
  return result.rows[0] || null
}

export async function getMisPedidos(usuario_id: number) {
  const result = await pool.query(`
    SELECT p.*, pf.calificacion, pf.comentario as feedback_comentario
    FROM pedidos p
    LEFT JOIN pedido_feedback pf ON p.id = pf.pedido_id
    WHERE p.usuario_id = $1
    ORDER BY p.created_at DESC
  `, [usuario_id])

  const pedidos = result.rows as unknown as Record<string, unknown>[]
  await attachItemsToPedidos(pedidos)
  return pedidos
}
