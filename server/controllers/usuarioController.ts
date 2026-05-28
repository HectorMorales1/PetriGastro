import { Request, Response } from 'express'
import { asyncHandler } from '../middleware/errorHandler'
import * as usuarioService from '../services/usuarioService'

const getSolicitudes = asyncHandler(async (req: Request, res: Response) => {
  const solicitudes = await usuarioService.getSolicitudes()
  res.json(solicitudes)
})

const getAll = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string, 10) || 1
  const limit = parseInt(req.query.limit as string, 10) || 50
  const result = await usuarioService.getAll(page, limit)
  res.json(result)
})

const aprobar = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params
  const result = await usuarioService.aprobar(Number(id))
  res.json({ message: 'Solicitud aprobada. Se ha notificado al usuario.', emailSent: result.emailSent })
})

const rechazar = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params
  const { motivo } = req.body
  await usuarioService.rechazar(Number(id), motivo)
  res.json({ message: 'Solicitud rechazada. Se ha desactivado el usuario.', emailSent: true })
})

const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params
  await usuarioService.remove(Number(id))
  res.json({ message: 'Usuario desactivado' })
})

const updateRol = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params
  const { rol } = req.body
  await usuarioService.updateRol(Number(id), rol)
  res.json({ message: 'Rol actualizado' })
})

export default { getSolicitudes, getAll, aprobar, rechazar, delete: deleteUser, updateRol }
