const pool = require('../config/db')

exports.create = async (req, res) => {
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
    console.error('Error creating pedido:', error)
    res.status(500).json({ message: 'Error del servidor' })
  } finally {
    client.release()
  }
}

exports.getAll = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT p.*, u.nombre as usuario_nombre, u.email as usuario_email, u.telefono as usuario_telefono
      FROM pedidos p
      LEFT JOIN usuarios u ON p.usuario_id = u.id
      ORDER BY 
        CASE WHEN p.fecha_recogida IS NULL THEN 1 ELSE 0 END,
        p.fecha_recogida ASC, 
        p.created_at ASC
    `)
    res.json(result.rows)
  } catch (error) {
    console.error('Error getting pedidos:', error)
    res.status(500).json({ message: 'Error del servidor' })
  }
}

exports.getMine = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM pedidos WHERE usuario_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    )
    res.json(result.rows)
  } catch (error) {
    console.error('Error getting my pedidos:', error)
    res.status(500).json({ message: 'Error del servidor' })
  }
}

exports.updateEstado = async (req, res) => {
  try {
    const { id } = req.params
    const { estado } = req.body

    const ESTADOS_VALIDOS = ['pendiente', 'confirmado', 'preparando', 'preparado', 'entregado', 'cancelado']
    
    if (!estado || !ESTADOS_VALIDOS.includes(estado)) {
      return res.status(400).json({ 
        message: `Estado inválido. Estados válidos: ${ESTADOS_VALIDOS.join(', ')}` 
      })
    }

    const result = await pool.query(
      'UPDATE pedidos SET estado = $1 WHERE id = $2 RETURNING *',
      [estado, id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Pedido no encontrado' })
    }

    res.json(result.rows[0])
  } catch (error) {
    console.error('Error updating pedido:', error)
    res.status(500).json({ message: 'Error del servidor' })
  }
}

exports.getStats = async (req, res) => {
  try {
    const { filter } = req.query

    let whereClause = "ped.estado NOT IN ('cancelado')"
    if (filter === 'pendientes') {
      whereClause = "ped.estado IN ('pendiente', 'confirmado', 'preparando', 'preparado')"
    } else if (filter === 'terminados') {
      whereClause = "ped.estado = 'entregado'"
    }

    // Obtener platos más pedidos con cantidades
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

    // Obtener totales
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
  } catch (error) {
    console.error('Error getting stats:', error)
    res.status(500).json({ message: 'Error del servidor' })
  }
}