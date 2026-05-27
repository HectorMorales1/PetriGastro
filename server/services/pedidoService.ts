import pool from '../config/db'
import { AppError } from '../middleware/errorHandler'
import { attachItemsToPedidos } from '../utils/pedidoHelper'

const ESTADOS_VALIDOS = ['pendiente', 'confirmado', 'preparando', 'preparado', 'entregado', 'cancelado']

export async function create(usuario_id: number, items: { id: number; cantidad: number }[], notas?: string, fecha_recogida?: string) {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    let total = 0
    const detalles: { plato_id: number; cantidad: number; precio_unitario: number }[] = []

    for (const item of items) {
      const platoResult = await client.query('SELECT precio FROM platos WHERE id = $1', [item.id])
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
    return { ...pedidoResult.rows[0], items }
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

export async function getAll(page = 1, limit = 50) {
  const pageNum = Math.max(1, page)
  const limitNum = Math.min(100, Math.max(1, limit))
  const offset = (pageNum - 1) * limitNum

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
  `, [limitNum, offset])

  const pedidos = result.rows as unknown as Record<string, unknown>[]
  await attachItemsToPedidos(pedidos)

  return {
    data: result.rows,
    pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) }
  }
}

export async function getMine(usuario_id: number) {
  const result = await pool.query(
    'SELECT * FROM pedidos WHERE usuario_id = $1 ORDER BY created_at DESC',
    [usuario_id]
  )
  return result.rows
}

export async function updateEstado(id: number, estado: string) {
  if (!estado || !ESTADOS_VALIDOS.includes(estado)) {
    throw new AppError(`Estado inválido. Estados válidos: ${ESTADOS_VALIDOS.join(', ')}`, 400)
  }

  const result = await pool.query(
    'UPDATE pedidos SET estado = $1 WHERE id = $2 RETURNING *',
    [estado, id]
  )

  if (result.rows.length === 0) {
    throw new AppError('Pedido no encontrado', 404)
  }

  return result.rows[0]
}

export async function getStats(filter?: string) {
  let whereClause = "ped.estado NOT IN ('cancelado')"
  if (filter === 'pendientes') {
    whereClause = "ped.estado IN ('pendiente', 'confirmado', 'preparando', 'preparado')"
  } else if (filter === 'terminados') {
    whereClause = "ped.estado = 'entregado'"
  }

  const result = await pool.query(`
    SELECT p.id, p.nombre, p.imagen_url, p.precio,
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
    SELECT COUNT(*) as total_pedidos, SUM(total) as suma_total
    FROM pedidos
    WHERE ${totalsWhere}
  `)

  return {
    platos: result.rows,
    totales: {
      pedidos: parseInt(totales.rows[0].total_pedidos as string, 10) || 0,
      ingresos: parseFloat(totales.rows[0].suma_total as string) || 0
    }
  }
}
