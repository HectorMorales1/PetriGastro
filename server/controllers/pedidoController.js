const pool = require('../config/db')
const logger = require('../config/logger')
const { AppError, asyncHandler } = require('../middleware/errorHandler')

exports.create = asyncHandler(async (req, res) => {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    const { items, notas, fecha_recogida } = req.body
    const usuario_id = req.user?.id || null

    let total = 0
    for (const item of items) {
      total += item.precio * item.cantidad
    }

    const pedidoResult = await client.query(
      'INSERT INTO pedidos (usuario_id, total, notas, fecha_recogida) VALUES ($1, $2, $3, $4) RETURNING *',
      [usuario_id, total, notas, fecha_recogida || null]
    )

    const pedido_id = pedidoResult.rows[0].id

    for (const item of items) {
      await client.query(
        'INSERT INTO pedido_detalles (pedido_id, plato_id, cantidad, precio_unitario) VALUES ($1, $2, $3, $4)',
        [pedido_id, item.id, item.cantidad, item.precio]
      )
    }

    await client.query('COMMIT')

    res.status(201).json({ ...pedidoResult.rows[0], items })
  } catch (error) {
    await client.query('ROLLBACK')
    logger.error({ err: error.message, context: 'pedidoController.create', userId: req.user?.id })
    throw new AppError('Error del servidor')
  } finally {
    client.release()
  }
})

const ESTADOS_VALIDOS_PEDIDO = ['pendiente', 'confirmado', 'preparando', 'preparado', 'entregado', 'cancelado']

exports.getAll = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1)
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 50))
  const offset = (page - 1) * limit

  const countResult = await pool.query('SELECT COUNT(*) as total FROM pedidos')
  const total = parseInt(countResult.rows[0].total)

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

  res.json({
    data: result.rows,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
  })
})

exports.getMine = asyncHandler(async (req, res) => {
  const result = await pool.query(
    'SELECT * FROM pedidos WHERE usuario_id = $1 ORDER BY created_at DESC',
    [req.user.id]
  )
  res.json(result.rows)
})

exports.updateEstado = asyncHandler(async (req, res) => {
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

exports.getStats = asyncHandler(async (req, res) => {
  const { filter } = req.query

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
      pedidos: parseInt(totales.rows[0].total_pedidos) || 0,
      ingresos: parseFloat(totales.rows[0].suma_total) || 0
    }
  })
})