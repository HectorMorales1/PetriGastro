import { Request, Response } from 'express'
import logger from '../config/logger'
import { AppError, asyncHandler } from '../middleware/errorHandler'
import * as pedidoService from '../services/pedidoService'

const create = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { items, notas, fecha_recogida } = req.body
    const usuario_id = (req as Request & { user: { id: number } }).user.id

    const pedido = await pedidoService.create(usuario_id, items, notas, fecha_recogida)
    res.status(201).json(pedido)
  } catch (error) {
    const err = error as Error
    logger.error({ err: err.message, context: 'pedidoController.create', userId: (req as Request & { user?: { id: number } }).user?.id })
    throw new AppError('Error al crear el pedido. Inténtalo de nuevo más tarde.')
  }
})

const getAll = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string, 10) || 1
  const limit = parseInt(req.query.limit as string, 10) || 50
  const result = await pedidoService.getAll(page, limit)
  res.json(result)
})

const getMine = asyncHandler(async (req: Request, res: Response) => {
  const usuario_id = (req as Request & { user?: { id: number } }).user!.id
  const pedidos = await pedidoService.getMine(usuario_id)
  res.json(pedidos)
})

const updateEstado = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params
  const { estado } = req.body
  const pedido = await pedidoService.updateEstado(Number(id), estado)
  res.json(pedido)
})

const getStats = asyncHandler(async (req: Request, res: Response) => {
  const filter = req.query.filter as string | undefined
  const stats = await pedidoService.getStats(filter)
  res.json(stats)
})

export default { create, getAll, getMine, updateEstado, getStats }
