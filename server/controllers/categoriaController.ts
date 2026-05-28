import { Request, Response } from 'express'
import { asyncHandler } from '../middleware/errorHandler'
import * as categoriaService from '../services/categoriaService'

const getAll = asyncHandler(async (req: Request, res: Response) => {
  const categorias = await categoriaService.getAll()
  res.json(categorias)
})

const create = asyncHandler(async (req: Request, res: Response) => {
  const { nombre, icono, orden } = req.body
  const categoria = await categoriaService.create(nombre, icono, orden)
  res.status(201).json(categoria)
})

const update = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params
  const { nombre, icono, orden } = req.body
  const categoria = await categoriaService.update(Number(id), nombre, icono, orden)
  res.json(categoria)
})

const deleteCat = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params
  await categoriaService.remove(Number(id))
  res.json({ message: 'Categoría eliminada' })
})

export default { getAll, create, update, delete: deleteCat }
