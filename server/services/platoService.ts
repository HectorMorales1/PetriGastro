import pool from '../config/db'
import { AppError } from '../middleware/errorHandler'

export async function getAll(filters: {
  categoria?: string; busqueda?: string; destacado?: string; todas?: string
}, pagination?: { page: number; limit: number }) {
  const conditions: string[] = ['p.deleted_at IS NULL']
  const params: string[] = []

  if (filters.todas !== 'true') {
    conditions.push('p.disponible = true')
  }

  if (filters.categoria && filters.categoria !== 'todas') {
    params.push(filters.categoria)
    conditions.push(`c.nombre = $${params.length}`)
  }

  if (filters.busqueda) {
    params.push(`%${filters.busqueda}%`)
    conditions.push(`(p.nombre ILIKE $${params.length} OR p.descripcion ILIKE $${params.length})`)
  }

  if (filters.destacado === 'true') {
    conditions.push('p.destacado = true')
  }

  const whereClause = ' WHERE ' + conditions.join(' AND ')

  const countResult = await pool.query(
    `SELECT COUNT(*) as total FROM platos p LEFT JOIN categorias c ON p.categoria_id = c.id${whereClause}`,
    params
  )
  const total = parseInt(countResult.rows[0].total as string, 10)

  if (pagination) {
    const pageNum = Math.max(1, pagination.page)
    const limitNum = Math.min(100, Math.max(1, pagination.limit))
    const offset = (pageNum - 1) * limitNum

    const result = await pool.query(
      `SELECT p.*, c.nombre as categoria FROM platos p
       LEFT JOIN categorias c ON p.categoria_id = c.id${whereClause}
       ORDER BY p.nombre
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, String(limitNum), String(offset)]
    )

    return {
      data: result.rows,
      pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) }
    }
  }

  const result = await pool.query(
    `SELECT p.*, c.nombre as categoria FROM platos p
     LEFT JOIN categorias c ON p.categoria_id = c.id${whereClause}
     ORDER BY p.nombre`,
    params
  )
  return result.rows
}

export async function getById(id: number) {
  const result = await pool.query(
    'SELECT p.*, c.nombre as categoria FROM platos p LEFT JOIN categorias c ON p.categoria_id = c.id WHERE p.id = $1 AND p.deleted_at IS NULL',
    [id]
  )
  if (result.rows.length === 0) {
    throw new AppError('Plato no encontrado', 404)
  }
  return result.rows[0]
}

export async function create(data: {
  nombre: string; descripcion?: string; ingredientes?: string; precio: number
  categoria_id: number; imagen_url?: string; disponible?: boolean; destacado?: boolean
}) {
  const result = await pool.query(
    'INSERT INTO platos (nombre, descripcion, ingredientes, precio, categoria_id, imagen_url, disponible, destacado) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
    [data.nombre, data.descripcion, data.ingredientes || '', data.precio, data.categoria_id, data.imagen_url, data.disponible ?? true, data.destacado ?? false]
  )
  return result.rows[0]
}

export async function update(id: number, data: Partial<{
  nombre: string; descripcion: string; ingredientes: string; precio: number
  categoria_id: number; imagen_url: string; disponible: boolean; destacado: boolean
}>) {
  const result = await pool.query(
    `UPDATE platos SET
      nombre = COALESCE($1, nombre),
      descripcion = COALESCE($2, descripcion),
      ingredientes = COALESCE($3, ingredientes),
      precio = COALESCE($4, precio),
      categoria_id = COALESCE($5, categoria_id),
      imagen_url = COALESCE($6, imagen_url),
      disponible = COALESCE($7, disponible),
      destacado = COALESCE($8, destacado)
    WHERE id = $9 AND deleted_at IS NULL RETURNING *`,
    [data.nombre, data.descripcion, data.ingredientes, data.precio, data.categoria_id, data.imagen_url, data.disponible, data.destacado, id]
  )
  if (result.rows.length === 0) {
    throw new AppError('Plato no encontrado', 404)
  }
  return result.rows[0]
}

export async function remove(id: number) {
  const result = await pool.query(
    'UPDATE platos SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL RETURNING *',
    [id]
  )
  if (result.rows.length === 0) {
    throw new AppError('Plato no encontrado', 404)
  }
}
