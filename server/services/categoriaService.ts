import pool from '../config/db'
import { AppError } from '../middleware/errorHandler'

export async function getAll() {
  const result = await pool.query('SELECT * FROM categorias WHERE deleted_at IS NULL ORDER BY orden')
  return result.rows
}

export async function create(nombre: string, icono?: string, orden?: number) {
  const result = await pool.query(
    'INSERT INTO categorias (nombre, icono, orden) VALUES ($1, $2, $3) RETURNING *',
    [nombre, icono || '🍽️', orden || 0]
  )
  return result.rows[0]
}

export async function update(id: number, nombre?: string, icono?: string, orden?: number) {
  const result = await pool.query(
    'UPDATE categorias SET nombre = COALESCE($1, nombre), icono = COALESCE($2, icono), orden = COALESCE($3, orden) WHERE id = $4 AND deleted_at IS NULL RETURNING *',
    [nombre, icono, orden, id]
  )
  if (result.rows.length === 0) {
    throw new AppError('Categoría no encontrada', 404)
  }
  return result.rows[0]
}

export async function remove(id: number) {
  const platosAsociados = await pool.query(
    'SELECT COUNT(*) as count FROM platos WHERE categoria_id = $1 AND deleted_at IS NULL',
    [id]
  )
  if (parseInt(platosAsociados.rows[0].count as string, 10) > 0) {
    throw new AppError('No se puede eliminar: hay platos asociados a esta categoría', 400)
  }
  const result = await pool.query(
    'UPDATE categorias SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL RETURNING *',
    [id]
  )
  if (result.rows.length === 0) {
    throw new AppError('Categoría no encontrada', 404)
  }
}
