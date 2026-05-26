import { Request, Response } from 'express'
import pool from '../config/db'
import { AppError, asyncHandler } from '../middleware/errorHandler'

const getAll = asyncHandler(async (req: Request, res: Response) => {
  const { categoria, busqueda, destacado, todas } = req.query as Record<string, string | undefined>
  const conditions: string[] = []
  const params: string[] = []

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

  const whereClause = conditions.length > 0 ? ' WHERE ' + conditions.join(' AND ') : ''

  const result = await pool.query(
    `SELECT p.*, c.nombre as categoria FROM platos p
     LEFT JOIN categorias c ON p.categoria_id = c.id${whereClause}
     ORDER BY p.nombre`,
    params
  )
  res.json(result.rows)
})

const getById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params
  const result = await pool.query('SELECT p.*, c.nombre as categoria FROM platos p LEFT JOIN categorias c ON p.categoria_id = c.id WHERE p.id = $1', [id])

  if (result.rows.length === 0) {
    throw new AppError('Plato no encontrado', 404)
  }

  res.json(result.rows[0])
})

const create = asyncHandler(async (req: Request, res: Response) => {
  const { nombre, descripcion, precio, categoria_id, imagen_url, disponible, destacado } = req.body

  const result = await pool.query(
    'INSERT INTO platos (nombre, descripcion, precio, categoria_id, imagen_url, disponible, destacado) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
    [nombre, descripcion, precio, categoria_id, imagen_url, disponible ?? true, destacado ?? false]
  )

  res.status(201).json(result.rows[0])
})

const update = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params
  const { nombre, descripcion, precio, categoria_id, imagen_url, disponible, destacado } = req.body

  const result = await pool.query(
    `UPDATE platos SET
      nombre = COALESCE($1, nombre),
      descripcion = COALESCE($2, descripcion),
      precio = COALESCE($3, precio),
      categoria_id = COALESCE($4, categoria_id),
      imagen_url = COALESCE($5, imagen_url),
      disponible = COALESCE($6, disponible),
      destacado = COALESCE($7, destacado)
    WHERE id = $8 RETURNING *`,
    [nombre, descripcion, precio, categoria_id, imagen_url, disponible, destacado, id]
  )

  if (result.rows.length === 0) {
    throw new AppError('Plato no encontrado', 404)
  }

  res.json(result.rows[0])
})

const deletePlato = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params
  const result = await pool.query('DELETE FROM platos WHERE id = $1 RETURNING *', [id])

  if (result.rows.length === 0) {
    throw new AppError('Plato no encontrado', 404)
  }

  res.json({ message: 'Plato eliminado' })
})

export = { getAll, getById, create, update, delete: deletePlato }
