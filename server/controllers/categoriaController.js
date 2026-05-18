const pool = require('../config/db')

exports.getAll = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM categorias ORDER BY orden')
    res.json(result.rows)
  } catch (error) {
    console.error('Error getting categorias:', error)
    res.status(500).json({ message: 'Error del servidor' })
  }
}

exports.create = async (req, res) => {
  try {
    const { nombre, icono, orden } = req.body
    const result = await pool.query(
      'INSERT INTO categorias (nombre, icono, orden) VALUES ($1, $2, $3) RETURNING *',
      [nombre, icono || '🍽️', orden || 0]
    )
    res.status(201).json(result.rows[0])
  } catch (error) {
    console.error('Error creating categoria:', error)
    res.status(500).json({ message: 'Error del servidor' })
  }
}

exports.update = async (req, res) => {
  try {
    const { id } = req.params
    const { nombre, icono, orden } = req.body
    const result = await pool.query(
      'UPDATE categorias SET nombre = COALESCE($1, nombre), icono = COALESCE($2, icono), orden = COALESCE($3, orden) WHERE id = $4 RETURNING *',
      [nombre, icono, orden, id]
    )
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Categoría no encontrada' })
    }
    res.json(result.rows[0])
  } catch (error) {
    console.error('Error updating categoria:', error)
    res.status(500).json({ message: 'Error del servidor' })
  }
}

exports.delete = async (req, res) => {
  try {
    const { id } = req.params
    const result = await pool.query('DELETE FROM categorias WHERE id = $1 RETURNING *', [id])
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Categoría no encontrada' })
    }
    res.json({ message: 'Categoría eliminada' })
  } catch (error) {
    console.error('Error deleting categoria:', error)
    res.status(500).json({ message: 'Error del servidor' })
  }
}