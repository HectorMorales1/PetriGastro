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
    ORDER BY p.id DESC
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
    'SELECT * FROM pedidos WHERE usuario_id = $1 ORDER BY id DESC',
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

export async function update(
  id: number,
  usuario_id: number,
  items: { id: number; cantidad: number }[],
  notas?: string,
  fecha_recogida?: string
) {
  const pedidoResult = await pool.query('SELECT * FROM pedidos WHERE id = $1', [id])
  if (pedidoResult.rows.length === 0) {
    throw new AppError('Pedido no encontrado', 404)
  }

  const pedido = pedidoResult.rows[0] as { usuario_id: number; estado: string }
  if (pedido.usuario_id !== usuario_id) {
    throw new AppError('No tienes permiso para modificar este pedido', 403)
  }
  if (pedido.estado !== 'pendiente') {
    throw new AppError('Solo puedes modificar pedidos pendientes de confirmación', 400)
  }

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

    await client.query(
      'UPDATE pedidos SET total = $1, notas = $2, fecha_recogida = $3 WHERE id = $4',
      [total, notas || null, fecha_recogida || null, id]
    )

    await client.query('DELETE FROM pedido_detalles WHERE pedido_id = $1', [id])

    for (const det of detalles) {
      await client.query(
        'INSERT INTO pedido_detalles (pedido_id, plato_id, cantidad, precio_unitario) VALUES ($1, $2, $3, $4)',
        [id, det.plato_id, det.cantidad, det.precio_unitario]
      )
    }

    await client.query('COMMIT')

    const updated = await pool.query('SELECT * FROM pedidos WHERE id = $1', [id])
    return { ...updated.rows[0], items }
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

export async function remove(id: number, usuario_id: number) {
  const pedidoResult = await pool.query('SELECT * FROM pedidos WHERE id = $1', [id])
  if (pedidoResult.rows.length === 0) {
    throw new AppError('Pedido no encontrado', 404)
  }

  const pedido = pedidoResult.rows[0] as { usuario_id: number; estado: string }
  if (pedido.usuario_id !== usuario_id) {
    throw new AppError('No tienes permiso para eliminar este pedido', 403)
  }
  if (pedido.estado !== 'pendiente') {
    throw new AppError('Solo puedes eliminar pedidos pendientes de confirmación', 400)
  }

  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    await client.query('DELETE FROM pedido_detalles WHERE pedido_id = $1', [id])
    await client.query('DELETE FROM pedidos WHERE id = $1', [id])
    await client.query('COMMIT')
    return { message: 'Pedido eliminado correctamente' }
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
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
