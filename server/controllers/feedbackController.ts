import { Request, Response } from 'express'
import pool from '../config/db'
import { AppError, asyncHandler } from '../middleware/errorHandler'

const create = asyncHandler(async (req: Request, res: Response) => {
  const { pedido_id, calificacion, comentario } = req.body
  const usuario_id = (req as Request & { user?: { id: number } }).user!.id

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

  if ((pedidoCheck.rows[0] as { usuario_id: number }).usuario_id !== usuario_id) {
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

const getByPedido = asyncHandler(async (req: Request, res: Response) => {
  const { pedido_id } = req.params
  const result = await pool.query(
    'SELECT * FROM pedido_feedback WHERE pedido_id = $1',
    [pedido_id]
  )
  res.json(result.rows[0] || null)
})

const getMisPedidos = asyncHandler(async (req: Request, res: Response) => {
  const result = await pool.query(`
    SELECT p.*, pf.calificacion, pf.comentario as feedback_comentario
    FROM pedidos p
    LEFT JOIN pedido_feedback pf ON p.id = pf.pedido_id
    WHERE p.usuario_id = $1
    ORDER BY p.created_at DESC
  `, [(req as Request & { user?: { id: number } }).user!.id])
  res.json(result.rows)
})

export = { create, getByPedido, getMisPedidos }
