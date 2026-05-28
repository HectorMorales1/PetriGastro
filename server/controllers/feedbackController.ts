import { Request, Response } from 'express'
import { asyncHandler } from '../middleware/errorHandler'
import * as feedbackService from '../services/feedbackService'

const create = asyncHandler(async (req: Request, res: Response) => {
  const { pedido_id, calificacion, comentario } = req.body
  const usuario_id = (req as Request & { user?: { id: number } }).user!.id
  const feedback = await feedbackService.create(pedido_id, usuario_id, calificacion, comentario)
  res.status(201).json(feedback)
})

const getByPedido = asyncHandler(async (req: Request, res: Response) => {
  const { pedido_id } = req.params
  const feedback = await feedbackService.getByPedido(Number(pedido_id))
  res.json(feedback)
})

const getMisPedidos = asyncHandler(async (req: Request, res: Response) => {
  const usuario_id = (req as Request & { user?: { id: number } }).user!.id
  const pedidos = await feedbackService.getMisPedidos(usuario_id)
  res.json(pedidos)
})

export default { create, getByPedido, getMisPedidos }
