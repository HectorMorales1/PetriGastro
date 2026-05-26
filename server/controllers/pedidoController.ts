import { Request, Response } from 'express'
import pool from '../config/db'
import logger from '../config/logger'
import { AppError, asyncHandler } from '../middleware/errorHandler'

const ESTADOS_VALIDOS_PEDIDO = ['pendiente', 'confirmado', 'preparando', 'preparado', 'entregado', 'cancelado']

interface PedidoItem {
  id: number
  cantidad: number
  precio: number
}

const create = asyncHandler(async (req: Request, res: Response) => {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    const { items, notas, fecha_recogida } = req.body
    const usuario_id = (req as Request & { user?: { id: number } }).user?.id || null

    let total = 0
    const detalles: { plato_id: number; cantidad: number; precio_unitario: number }[] = []
    for (const item of items as PedidoItem[]) {
      const platoResult = await client.query(
        'SELECT precio FROM platos WHERE id = $1',
        [item.id]
      )
      if (platoResult.rows.length === 0) {
        throw new AppError(`Plato con id ${item.id} no encontrado`, 400)
      }
      const precioReal = parseFloat(platoResult.rows[0].precio)
      total += precioReal * item.cantidad
      detalles.push({ plato_id: item.id, cantidad: item.cantidad, precio_unitario: precioReal })
    }

    const pedidoResult = await client.query(
      'INSERT INTO pedidos (usuario_id, total, notas, fecha_recogida) VALUES ($1, $2, $3, $4) RETURNING *',
      [usuario_id, total, notas, fecha_recogida || null]
    )

    const pedido_id = pedidoResult.rows[0].id as number

    for (const det of detalles) {
      await client.query(
        'INSERT INTO pedido_detalles (pedido_id, plato_id, cantidad, precio_unitario) VALUES ($1, $2, $3, $4)',
        [pedido_id, det.plato_id, det.cantidad, det.precio_unitario]
      )
    }

    await client.query('COMMIT')

    res.status(201).json({ ...pedidoResult.rows[0], items })
  } catch (error) {
    await client.query('ROLLBACK')
    const err = error as Error
    logger.error({ err: err.message, context: 'pedidoController.create', userId: (req as Request & { user?: { id: number } }).user?.id })
    throw new AppError('Error del servidor')
  } finally {
    client.release()
  }
})

const getAll = asyncHandler(async (req: Request, res: Response) => {
  const page = Math.max(1, parseInt(req.query.page as string, 10) || 1)
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string, 10) || 50))
  const offset = (page - 1) * limit

  const countResult = await pool.query('SELECT COUNT(*) as total FROM pedidos')
  const total = parseInt(countResult.rows[0].total as string, 10)

  const result = await pool.query(`
    SELECT p.*, u.nombre as usuario_nombre, u.email as usuario_email, u.telefono as usuario_telefono
    FROM pedidos p
    LEFT JOIN usuarios u ON p.usuario_id = u.id
    ORDER BY 
      CASE WHEN p.fecha_recogida IS NULL THEN 1 ELSE 0 END,
      p.fecha_recogida ASC, 
      p.created_at ASC
    LIMIT $1 OFFSET $2
  `, [limit, offset])

  const pedidos = result.rows
  if (pedidos.length > 0) {
    const ids = pedidos.map((p: { id: number }) => p.id)
    const itemsResult = await pool.query(`
      SELECT pd.pedido_id, pd.cantidad, pd.precio_unitario, pl.nombre, pl.imagen_url
      FROM pedido_detalles pd
      JOIN platos pl ON pd.plato_id = pl.id
      WHERE pd.pedido_id = ANY($1::int[])
      ORDER BY pd.pedido_id
    `, [ids])
    const itemsByPedido: Record<number, unknown[]> = {}
    for (const item of itemsResult.rows) {
      const pid = (item as { pedido_id: number }).pedido_id
      if (!itemsByPedido[pid]) itemsByPedido[pid] = []
      itemsByPedido[pid].push(item)
    }
    for (const pedido of pedidos) {
      (pedido as { items: unknown[] }).items = itemsByPedido[(pedido as { id: number }).id] || []
    }
  }

  res.json({
    data: result.rows,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
  })
})

const getMine = asyncHandler(async (req: Request, res: Response) => {
  const result = await pool.query(
    'SELECT * FROM pedidos WHERE usuario_id = $1 ORDER BY created_at DESC',
    [(req as Request & { user?: { id: number } }).user!.id]
  )
  res.json(result.rows)
})

const updateEstado = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params
  const { estado } = req.body

  if (!estado || !ESTADOS_VALIDOS_PEDIDO.includes(estado)) {
    throw new AppError(`Estado inválido. Estados válidos: ${ESTADOS_VALIDOS_PEDIDO.join(', ')}`, 400)
  }

  const result = await pool.query(
    'UPDATE pedidos SET estado = $1 WHERE id = $2 RETURNING *',
    [estado, id]
  )

  if (result.rows.length === 0) {
    throw new AppError('Pedido no encontrado', 404)
  }

  res.json(result.rows[0])
})

const getStats = asyncHandler(async (req: Request, res: Response) => {
  const filter = req.query.filter as string | undefined

  let whereClause = "ped.estado NOT IN ('cancelado')"
  if (filter === 'pendientes') {
    whereClause = "ped.estado IN ('pendiente', 'confirmado', 'preparando', 'preparado')"
  } else if (filter === 'terminados') {
    whereClause = "ped.estado = 'entregado'"
  }

  const result = await pool.query(`
    SELECT
      p.id,
      p.nombre,
      p.imagen_url,
      p.precio,
      SUM(pd.cantidad) as total_vendido,
      COUNT(DISTINCT pd.pedido_id) as num_pedidos
    FROM pedido_detalles pd
    JOIN platos p ON pd.plato_id = p.id
    JOIN pedidos ped ON pd.pedido_id = ped.id
    WHERE ${whereClause}
    GROUP BY p.id, p.nombre, p.imagen_url, p.precio
    ORDER BY total_vendido DESC
  `)

  let totalsWhere = "estado NOT IN ('cancelado')"
  if (filter === 'pendientes') {
    totalsWhere = "estado IN ('pendiente', 'confirmado', 'preparando', 'preparado')"
  } else if (filter === 'terminados') {
    totalsWhere = "estado = 'entregado'"
  }

  const totales = await pool.query(`
    SELECT
      COUNT(*) as total_pedidos,
      SUM(total) as suma_total
    FROM pedidos
    WHERE ${totalsWhere}
  `)

  res.json({
    platos: result.rows,
    totales: {
      pedidos: parseInt(totales.rows[0].total_pedidos as string, 10) || 0,
      ingresos: parseFloat(totales.rows[0].suma_total as string) || 0
    }
  })
})

export = { create, getAll, getMine, updateEstado, getStats }
