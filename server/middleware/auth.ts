import jwt from 'jsonwebtoken'
import { Request, Response, NextFunction } from 'express'
import pool from '../config/db'

interface JwtPayload {
  id: number
  email: string
  nombre: string
  apellidos: string
  rol: string
  estado_solicitud: string
  token_version?: number
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload
    }
  }
}

const authMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ message: 'No autorizado' })
    return
  }

  const token = authHeader.split(' ')[1]

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload

    if (decoded.token_version !== undefined) {
      const result = await pool.query(
        'SELECT token_version FROM usuarios WHERE id = $1',
        [decoded.id]
      )
      if (result.rows.length === 0) {
        res.status(401).json({ message: 'Usuario no encontrado' })
        return
      }
      const currentVersion = result.rows[0].token_version || 0
      if (decoded.token_version !== currentVersion) {
        res.status(401).json({ message: 'Sesión inválida o revocada' })
        return
      }
    }

    req.user = decoded
    next()
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({ message: 'Token expirado' })
      return
    }
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
