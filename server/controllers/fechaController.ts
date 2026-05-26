import { Request, Response } from 'express'
import pool from '../config/db'
import logger from '../config/logger'
import { AppError, asyncHandler } from '../middleware/errorHandler'

const getAll = asyncHandler(async (req: Request, res: Response) => {
  const result = await pool.query(`
    SELECT fd.*, 
      COALESCE(
        json_agg(
          json_build_object(
            'id', hd.id,
            'hora', hd.hora::text,
            'disponible', hd.disponible
          ) ORDER BY hd.hora
        ) FILTER (WHERE hd.id IS NOT NULL), 
        '[]'::json
      ) as horarios
    FROM fechas_disponibles fd
    LEFT JOIN horarios_disponibles hd ON fd.fecha = hd.fecha
    GROUP BY fd.id
    ORDER BY fd.fecha ASC
  `)
  res.json(result.rows)
})

const create = asyncHandler(async (req: Request, res: Response) => {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const { fecha, horarios } = req.body

    const existing = await client.query(
      'SELECT id FROM fechas_disponibles WHERE fecha = $1',
      [fecha]
    )

    if (existing.rows.length > 0) {
      await client.query('ROLLBACK')
      throw new AppError('La fecha ya existe', 400)
    }

    const fechaResult = await client.query(
      'INSERT INTO fechas_disponibles (fecha) VALUES ($1) RETURNING *',
      [fecha]
    )

    if (horarios && horarios.length > 0) {
      for (const hora of horarios) {
        await client.query(
          'INSERT INTO horarios_disponibles (fecha, hora) VALUES ($1, $2)',
          [fecha, hora]
        )
      }
    }

    await client.query('COMMIT')
    res.status(201).json(fechaResult.rows[0])
  } catch (error) {
    await client.query('ROLLBACK')
    if (error instanceof AppError) throw error
    const err = error as Error
    logger.error({ err: err.message, context: 'fechaController.create' })
    throw new AppError('Error del servidor')
  } finally {
    client.release()
  }
})

const update = asyncHandler(async (req: Request, res: Response) => {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const { id } = req.params
    const { activo, horarios } = req.body

    await client.query(
      'UPDATE fechas_disponibles SET activo = $1 WHERE id = $2',
      [activo, id]
    )

    if (horarios !== undefined) {
      await client.query('DELETE FROM horarios_disponibles WHERE fecha = (SELECT fecha FROM fechas_disponibles WHERE id = $1)', [id])

      for (const hora of horarios) {
        await client.query(
          'INSERT INTO horarios_disponibles (fecha, hora, disponible) VALUES ((SELECT fecha FROM fechas_disponibles WHERE id = $1), $2, true)',
          [id, hora.hora || hora]
        )
      }
    }

    await client.query('COMMIT')
    res.json({ message: 'Fecha actualizada' })
  } catch (error) {
    await client.query('ROLLBACK')
    if (error instanceof AppError) throw error
    const err = error as Error
    logger.error({ err: err.message, context: 'fechaController.update' })
    throw new AppError('Error del servidor')
  } finally {
    client.release()
  }
})

const deleteFecha = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params

  const fechaResult = await pool.query(
    'SELECT fecha FROM fechas_disponibles WHERE id = $1',
    [id]
  )

  if (fechaResult.rows.length === 0) {
    throw new AppError('Fecha no encontrada', 404)
  }

  await pool.query('DELETE FROM horarios_disponibles WHERE fecha = $1', [fechaResult.rows[0].fecha as string])
  await pool.query('DELETE FROM fechas_disponibles WHERE id = $1', [id])

  res.json({ message: 'Fecha eliminada' })
})

export = { getAll, create, update, delete: deleteFecha }
