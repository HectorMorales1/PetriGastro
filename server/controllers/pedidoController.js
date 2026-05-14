const pool = require('../config/db')

exports.create = async (req, res) => {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    const { items, notas } = req.body
    const usuario_id = req.user?.id || null

    let total = 0
    for (const item of items) {
      total += item.precio * item.cantidad
    }

    const pedidoResult = await client.query(
      'INSERT INTO pedidos (usuario_id, total, notas) VALUES ($1, $2, $3) RETURNING *',
      [usuario_id, total, notas]
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
      SELECT p.*, u.nombre as usuario_nombre
      FROM pedidos p
      LEFT JOIN usuarios u ON p.usuario_id = u.id
      ORDER BY p.created_at DESC
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