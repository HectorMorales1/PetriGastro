const pool = require('../config/db')

exports.getAll = async (req, res) => {
  try {
    const { categoria, busqueda, destacado, todas } = req.query
    let query = 'SELECT p.*, c.nombre as categoria FROM platos p LEFT JOIN categorias c ON p.categoria_id = c.id'
    const params = []
    const conditions = []

    if (todas !== 'true') {
      conditions.push('p.disponible = true')
    }

    if (categoria && categoria !== 'todas') {
      params.push(categoria)
      conditions.push(`c.nombre = $${params.length}`)
    }

    if (busqueda) {
      params.push(`%${busqueda}%`)
      conditions.push(`(p.nombre ILIKE $${params.length} OR p.descripcion ILIKE $${params.length})`)
    }

    if (destacado === 'true') {
      conditions.push('p.destacado = true')
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ')
    }

    query += ' ORDER BY p.nombre'

    const result = await pool.query(query, params)
    res.json(result.rows)
  } catch (error) {
    console.error('Error getting platos:', error)
    res.status(500).json({ message: 'Error del servidor' })
  }
}

exports.getById = async (req, res) => {
  try {
    const { id } = req.params
    const result = await pool.query('SELECT p.*, c.nombre as categoria FROM platos p LEFT JOIN categorias c ON p.categoria_id = c.id WHERE p.id = $1', [id])

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Plato no encontrado' })
    }

    res.json(result.rows[0])
  } catch (error) {
    console.error('Error getting plato:', error)
    res.status(500).json({ message: 'Error del servidor' })
  }
}

exports.create = async (req, res) => {
  try {
    const { nombre, descripcion, precio, categoria_id, imagen_url, disponible, destacado } = req.body

    const result = await pool.query(
      'INSERT INTO platos (nombre, descripcion, precio, categoria_id, imagen_url, disponible, destacado) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [nombre, descripcion, precio, categoria_id, imagen_url, disponible ?? true, destacado ?? false]
    )

    res.status(201).json(result.rows[0])
  } catch (error) {
    console.error('Error creating plato:', error)
    res.status(500).json({ message: 'Error del servidor' })
  }
}

exports.update = async (req, res) => {
  try {
    const { id } = req.params
    const { nombre, descripcion, precio, categoria_id, imagen_url, disponible, destacado } = req.body

    const result = await pool.query(
      'UPDATE platos SET nombre = $1, descripcion = $2, precio = $3, categoria_id = $4, imagen_url = $5, disponible = $6, destacado = $7 WHERE id = $8 RETURNING *',
      [nombre, descripcion, precio, categoria_id, imagen_url, disponible, destacado, id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Plato no encontrado' })
    }

    res.json(result.rows[0])
  } catch (error) {
    console.error('Error updating plato:', error)
    res.status(500).json({ message: 'Error del servidor' })
  }
}

exports.delete = async (req, res) => {
  try {
    const { id } = req.params
    const result = await pool.query('DELETE FROM platos WHERE id = $1 RETURNING *', [id])

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Plato no encontrado' })
    }

    res.json({ message: 'Plato eliminado' })
  } catch (error) {
    console.error('Error deleting plato:', error)
    res.status(500).json({ message: 'Error del servidor' })
  }
}
