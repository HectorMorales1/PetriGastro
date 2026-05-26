import jwt from 'jsonwebtoken'
import { Request, Response, NextFunction } from 'express'

interface JwtPayload {
  id: number
  email: string
  nombre: string
  apellidos: string
  rol: string
  estado_solicitud: string
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload
    }
  }
}

const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ message: 'No autorizado' })
    return
  }

  const token = authHeader.split(' ')[1]

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload
    req.user = decoded
    next()
  } catch (error) {
    res.status(401).json({ message: 'Token inválido' })
    return
  }
}

const adminMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  if (req.user && req.user.rol === 'admin') {
    next()
  } else {
    res.status(403).json({ message: 'Acceso denegado' })
    return
  }
}

export { authMiddleware, adminMiddleware }
