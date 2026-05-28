import { Request, Response } from 'express'
import { asyncHandler } from '../middleware/errorHandler'
import * as platoService from '../services/platoService'

const getAll = asyncHandler(async (req: Request, res: Response) => {
  const { categoria, busqueda, destacado, todas, page, limit } = req.query as Record<string, string | undefined>

  const pagination = page && limit
    ? { page: parseInt(page, 10), limit: parseInt(limit, 10) }
    : undefined

  const result = await platoService.getAll({ categoria, busqueda, destacado, todas }, pagination)
  res.json(result)
})

const getById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params
  const plato = await platoService.getById(Number(id))
  res.json(plato)
})

const create = asyncHandler(async (req: Request, res: Response) => {
  const plato = await platoService.create(req.body)
  res.status(201).json(plato)
})

const update = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params
  const plato = await platoService.update(Number(id), req.body)
  res.json(plato)
})

const deletePlato = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params
  await platoService.remove(Number(id))
  res.json({ message: 'Plato eliminado' })
})

export default { getAll, getById, create, update, delete: deletePlato }
