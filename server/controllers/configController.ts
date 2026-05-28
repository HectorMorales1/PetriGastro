import { Request, Response } from 'express'
import logger from '../config/logger'
import { AppError, asyncHandler } from '../middleware/errorHandler'
import * as configService from '../services/configService'

const get = asyncHandler(async (req: Request, res: Response) => {
  const config = await configService.get()
  res.json(config)
})

const update = asyncHandler(async (req: Request, res: Response) => {
  const { clave, valor } = req.body
  await configService.update(clave, valor)
  res.json({ message: 'Configuración actualizada' })
})

const generarFechas = asyncHandler(async (req: Request, res: Response) => {
  try {
    const fechasCreadas = await configService.generarFechas()
    res.json({ message: `Se generaron ${fechasCreadas} fechas` })
  } catch (error) {
    const err = error as Error
    logger.error({ err: err.message, context: 'configController.generarFechas' })
    throw new AppError('Error del servidor')
  }
})

export default { get, update, generarFechas }
