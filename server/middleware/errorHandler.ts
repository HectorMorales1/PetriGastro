import { Request, Response, NextFunction } from 'express'
import logger from '../config/logger'

class AppError extends Error {
  public statusCode: number
  public isOperational: boolean
  public context?: string

  constructor(message: string, statusCode = 500) {
    super(message)
    this.statusCode = statusCode
    this.isOperational = true
  }
}

type AsyncFunction = (req: Request, res: Response, next: NextFunction) => Promise<unknown>

const asyncHandler = (fn: AsyncFunction) => (req: Request, res: Response, next: NextFunction): void => {
  Promise.resolve(fn(req, res, next)).catch(next)
}

interface ErrorWithContext extends Error {
  statusCode?: number
  isOperational?: boolean
  context?: string
  name: string
}

const globalErrorHandler = (err: ErrorWithContext, req: Request, res: Response, _next: NextFunction): void => {
  const statusCode = err.statusCode || 500
  const message = err.isOperational ? err.message : 'Error del servidor'

  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    res.status(401).json({ message: 'Token inválido o expirado' })
    return
  }

  logger.error({
    err: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    userId: (req as Request & { user?: { id?: number } }).user?.id,
    context: err.context
  })

  res.status(statusCode).json({ message })
}

export { AppError, asyncHandler, globalErrorHandler }
