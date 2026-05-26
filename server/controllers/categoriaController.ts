import { Request, Response } from 'express'
import pool from '../config/db'
import { AppError, asyncHandler } from '../middleware/errorHandler'

const getAll = asyncHandler(async (req: Request, res: Response) => {
  const result = await pool.query('SELECT * FROM categorias ORDER BY orden')
  res.json(result.rows)
})

const create = asyncHandler(async (req: Request, res: Response) => {
  const { nombre, icono, orden } = req.body
  const result = await pool.query(
    'INSERT INTO categorias (nombre, icono, orden) VALUES ($1, $2, $3) RETURNING *',
    [nombre, icono || '🍽️', orden || 0]
  )
  res.status(201).json(result.rows[0])
})

const update = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params
  const { nombre, icono, orden } = req.body
  const result = await pool.query(
    'UPDATE categorias SET nombre = COALESCE($1, nombre), icono = COALESCE($2, icono), orden = COALESCE($3, orden) WHERE id = $4 RETURNING *',
    [nombre, icono, orden, id]
  )
  if (result.rows.length === 0) {
    throw new AppError('Categoría no encontrada', 404)
  }
  res.json(result.rows[0])
})

const deleteCat = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params
  const platosAsociados = await pool.query('SELECT COUNT(*) as count FROM platos WHERE categoria_id = $1', [id])
  if (parseInt(platosAsociados.rows[0].count as string, 10) > 0) {
    throw new AppError('No se puede eliminar: hay platos asociados a esta categoría', 400)
  }
  const result = await pool.query('DELETE FROM categorias WHERE id = $1 RETURNING *', [id])
  if (result.rows.length === 0) {
    throw new AppError('Categoría no encontrada', 404)
  }
  res.json({ message: 'Categoría eliminada' })
})

export = { getAll, create, update, delete: deleteCat }
