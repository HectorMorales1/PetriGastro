const pool = require('../config/db')

exports.getAll = async (req, res) => {
  try {
    const { categoria, busqueda } = req.query
    let query = 'SELECT * FROM platos WHERE disponible = true'
    const params = []

    if (categoria && categoria !== 'todas') {
      params.push(categoria)
      query += ` AND categoria_id = $${params.length}`
    }

    if (busqueda) {
      params.push(`%${busqueda}%`)
      query += ` AND (nombre ILIKE $${params.length} OR descripcion ILIKE $${params.length})`
    }

    query += ' ORDER BY nombre'

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
    const result = await pool.query('SELECT * FROM platos WHERE id = $1', [id])

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
    const { nombre, descripcion, precio, categoria_id, imagen_url, disponible } = req.body

    const result = await pool.query(
      'INSERT INTO platos (nombre, descripcion, precio, categoria_id, imagen_url, disponible) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [nombre, descripcion, precio, categoria_id, imagen_url, disponible ?? true]
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
    const { nombre, descripcion, precio, categoria_id, imagen_url, disponible } = req.body

    const result = await pool.query(
      'UPDATE platos SET nombre = $1, descripcion = $2, precio = $3, categoria_id = $4, imagen_url = $5, disponible = $6 WHERE id = $7 RETURNING *',
      [nombre, descripcion, precio, categoria_id, imagen_url, disponible, id]
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