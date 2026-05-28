import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import { Request, Response } from 'express'
import pool from '../config/db'
import logger from '../config/logger'
import { AppError, asyncHandler } from '../middleware/errorHandler'
import { sendEmail } from '../config/mailer'
import { verificationEmail } from '../config/emailTemplates'

interface User {
  id: number
  nombre: string
  apellidos: string
  email: string
  password_hash: string
  rol: string
  estado_solicitud: string
  email_verificado: boolean
  email_verification_token?: string
  email_verification_expires?: Date
  motivo_rechazo?: string
  token_version?: number
}

const generateToken = (user: User): string => {
  return jwt.sign(
    { id: user.id, email: user.email, nombre: user.nombre, apellidos: user.apellidos, rol: user.rol, estado_solicitud: user.estado_solicitud, token_version: user.token_version || 0 },
    process.env.JWT_SECRET as string,
    { expiresIn: '15m' as any }
  )
}

const generateRefreshToken = (user: User): string => {
  return jwt.sign(
    { id: user.id, type: 'refresh', version: user.token_version || 0 },
    process.env.JWT_SECRET as string,
    { expiresIn: (process.env.REFRESH_TOKEN_EXPIRES_IN || '7d') as any }
  )
}

const toUserDTO = (user: User) => ({
  id: user.id,
  nombre: user.nombre,
  apellidos: user.apellidos,
  email: user.email,
  rol: user.rol,
  estado_solicitud: user.estado_solicitud,
  email_verificado: user.email_verificado
})

const register = asyncHandler(async (req: Request, res: Response) => {
  const client = await pool.connect()
  const { email } = req.body
  try {
    await client.query('BEGIN')

    const { nombre, apellidos, password } = req.body
    const passwordHash = await bcrypt.hash(password, 12)

    const existingUser = await client.query(
      'SELECT id, estado_solicitud FROM usuarios WHERE email = $1',
      [email]
    )

    if (existingUser.rows.length > 0) {
      const existing = existingUser.rows[0] as { id: number; estado_solicitud: string }
      if (existing.estado_solicitud === 'aprobado' || existing.estado_solicitud === 'pendiente' || existing.estado_solicitud === 'pendiente_verificacion') {
        await client.query('ROLLBACK')
        throw new AppError('El email ya está registrado', 400)
      }

      const verificationToken = crypto.randomBytes(32).toString('hex')
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)

      await client.query(
        `UPDATE usuarios SET nombre = $1, apellidos = $2, password_hash = $3, 
         estado_solicitud = 'pendiente_verificacion', email_verificado = false,
         email_verification_token = $4, email_verification_expires = $5,
         fecha_solicitud = NOW(), motivo_rechazo = NULL
         WHERE id = $6`,
        [nombre, apellidos || '', passwordHash, verificationToken, expiresAt, existing.id]
      )
    } else {
      const verificationToken = crypto.randomBytes(32).toString('hex')
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)

      await client.query(
        `INSERT INTO usuarios (nombre, apellidos, email, password_hash, rol, estado_solicitud, email_verificado, email_verification_token, email_verification_expires, fecha_solicitud) 
         VALUES ($1, $2, $3, $4, 'cliente', 'pendiente_verificacion', false, $5, $6, NOW())`,
        [nombre, apellidos || '', email, passwordHash, verificationToken, expiresAt]
      )

      const verificationUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/verificar?token=${verificationToken}`
      await sendEmail({
        to: email,
        subject: 'Confirma tu correo - PetriGastro',
        html: verificationEmail(nombre, verificationUrl)
      })
    }

    await client.query('COMMIT')

    res.status(201).json({
      message: 'Te hemos enviado un correo para verificar tu dirección. Revisa tu bandeja de entrada.',
      pendingVerification: true
    })
  } catch (error) {
    await client.query('ROLLBACK')
    const err = error as Error
    logger.error({ err: err.message, context: 'authController.register', email })
    throw new AppError('Error al registrar usuario. Inténtalo de nuevo más tarde.')
  } finally {
    client.release()
  }
})

const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body

  const result = await pool.query(
    'SELECT id, nombre, apellidos, email, password_hash, rol, estado_solicitud, email_verificado, motivo_rechazo FROM usuarios WHERE email = $1',
    [email]
  )

  if (result.rows.length === 0) {
    throw new AppError('Credenciales inválidas', 401)
  }

  const user = result.rows[0] as User

  const validPassword = await bcrypt.compare(password, user.password_hash)
  if (!validPassword) {
    throw new AppError('Credenciales inválidas', 401)
  }

  if (user.estado_solicitud === 'pendiente_verificacion') {
    throw new AppError('Debes verificar tu correo electrónico primero. Revisa tu bandeja de entrada.', 403)
  }

  if (user.estado_solicitud === 'pendiente') {
    throw new AppError('Tu solicitud está pendiente de aprobación por el administrador.', 403)
  }

  if (user.estado_solicitud === 'rechazado') {
    const motivo = user.motivo_rechazo ? ` Motivo: ${user.motivo_rechazo}` : ''
    throw new AppError(`Tu solicitud de acceso ha sido rechazada.${motivo}`, 403)
  }

  const token = generateToken(user)
  const refreshToken = generateRefreshToken(user)

  res.json({
    token,
    refreshToken,
    user: toUserDTO(user)
  })
})

const me = asyncHandler(async (req: Request, res: Response) => {
  const result = await pool.query(
    'SELECT id, nombre, apellidos, email, rol, estado_solicitud, email_verificado FROM usuarios WHERE id = $1',
    [(req as Request & { user?: { id: number } }).user!.id]
  )

  if (result.rows.length === 0) {
    throw new AppError('Usuario no encontrado', 404)
  }

  res.json(result.rows[0])
})

const verificarEmail = asyncHandler(async (req: Request, res: Response) => {
  const token = req.query.token as string

  if (!token) {
    throw new AppError('Token de verificación requerido', 400)
  }

  const result = await pool.query(
    `SELECT id, email_verificado, email_verification_expires FROM usuarios 
     WHERE email_verification_token = $1`,
    [token]
  )

  if (result.rows.length === 0) {
    throw new AppError('Token de verificación inválido', 400)
  }

  const user = result.rows[0] as { id: number; email_verificado: boolean; email_verification_expires: Date }

  if (user.email_verificado) {
    return res.json({ message: 'El correo ya ha sido verificado.', alreadyVerified: true })
  }

  if (user.email_verification_expires && new Date(user.email_verification_expires) < new Date()) {
    throw new AppError('El token de verificación ha expirado. Solicita un nuevo registro.', 400)
  }

  await pool.query(
    `UPDATE usuarios SET email_verificado = true, estado_solicitud = 'pendiente', 
     email_verification_token = NULL, email_verification_expires = NULL 
     WHERE id = $1`,
    [user.id]
  )

  res.json({ message: 'Correo verificado correctamente. Tu solicitud ha sido enviada al administrador para su aprobación.' })
})

const refreshTokenHandler = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken } = req.body

  if (!refreshToken) {
    throw new AppError('Refresh token requerido', 400)
  }

  const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET as string) as { id: number; type: string; version: number }

  if (decoded.type !== 'refresh') {
    throw new AppError('Token inválido', 401)
  }

  const result = await pool.query(
    'SELECT id, nombre, apellidos, email, rol, estado_solicitud, email_verificado, token_version FROM usuarios WHERE id = $1',
    [decoded.id]
  )

  if (result.rows.length === 0) {
    throw new AppError('Usuario no encontrado', 401)
  }

  const user = result.rows[0] as User

  if (decoded.version !== undefined && decoded.version !== user.token_version) {
    throw new AppError('Token de refresco inválido o revocado', 401)
  }

  const newToken = generateToken(user)
  const newRefreshToken = generateRefreshToken(user)

  res.json({
    token: newToken,
    refreshToken: newRefreshToken,
    user: toUserDTO(user)
  })
})

const invalidateSessions = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as Request & { user?: { id: number } }).user!.id
  await pool.query(
    'UPDATE usuarios SET token_version = token_version + 1 WHERE id = $1',
    [userId]
  )
  res.json({ message: 'Sesiones invalidadas correctamente' })
})

export default { register, login, me, verificarEmail, refreshToken: refreshTokenHandler, invalidateSessions }
