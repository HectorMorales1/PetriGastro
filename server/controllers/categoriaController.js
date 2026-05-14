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