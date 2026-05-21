const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const pool = require('../config/db')
const logger = require('../config/logger')
const { AppError, asyncHandler } = require('../middleware/errorHandler')
const { sendEmail } = require('../config/mailer')

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, nombre: user.nombre, apellidos: user.apellidos, rol: user.rol, estado_solicitud: user.estado_solicitud },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  )
}

const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user.id, type: 'refresh', version: user.token_version || 0 },
    process.env.JWT_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d' }
  )
}

const toUserDTO = (user) => ({
  id: user.id,
  nombre: user.nombre,
  apellidos: user.apellidos,
  email: user.email,
  rol: user.rol,
  estado_solicitud: user.estado_solicitud,
  email_verificado: user.email_verificado
})

exports.register = asyncHandler(async (req, res) => {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    const { nombre, apellidos, email, password } = req.body
    const passwordHash = await bcrypt.hash(password, 12)

    const existingUser = await client.query(
      'SELECT id, estado_solicitud FROM usuarios WHERE email = $1',
      [email]
    )

    if (existingUser.rows.length > 0) {
      const existing = existingUser.rows[0]
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
        html: `<div style="font-family:sans-serif;max-width:500px;margin:0 auto;">
          <h2 style="color:#C4785A;">PetriGastro</h2>
          <p>Hola <strong>${nombre}</strong>,</p>
          <p>Gracias por registrarte en PetriGastro. Para continuar, confirma tu dirección de correo haciendo clic en el siguiente enlace:</p>
          <div style="text-align:center;margin:30px 0;">
            <a href="${verificationUrl}" style="background:#C4785A;color:white;padding:12px 30px;border-radius:8px;text-decoration:none;font-weight:bold;">
              Confirmar correo electrónico
            </a>
          </div>
          <p>Este enlace expira en 24 horas.</p>
          <hr style="border:none;border-top:1px solid #eee;margin:20px 0;">
          <p style="font-size:12px;color:#999;">Si no solicitaste este registro, ignora este mensaje.</p>
        </div>`
      })
    }

    await client.query('COMMIT')

    res.status(201).json({
      message: 'Te hemos enviado un correo para verificar tu dirección. Revisa tu bandeja de entrada.',
      pendingVerification: true
    })
  } catch (error) {
    await client.query('ROLLBACK')
    logger.error({ err: error.message, context: 'authController.register', email })
    throw new AppError('Error del servidor')
  } finally {
    client.release()
  }
})

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body

  const result = await pool.query(
    'SELECT id, nombre, apellidos, email, password_hash, rol, estado_solicitud, email_verificado, motivo_rechazo FROM usuarios WHERE email = $1',
    [email]
  )

  if (result.rows.length === 0) {
    throw new AppError('Credenciales inválidas', 401)
  }

  const user = result.rows[0]

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

exports.me = asyncHandler(async (req, res) => {
  const result = await pool.query(
    'SELECT id, nombre, apellidos, email, rol, estado_solicitud, email_verificado FROM usuarios WHERE id = $1',
    [req.user.id]
  )

  if (result.rows.length === 0) {
    throw new AppError('Usuario no encontrado', 404)
  }

  res.json(result.rows[0])
})

exports.verificarEmail = asyncHandler(async (req, res) => {
  const { token } = req.query

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

  const user = result.rows[0]

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

exports.refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body

  if (!refreshToken) {
    throw new AppError('Refresh token requerido', 400)
  }

  const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET)

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

  const user = result.rows[0]

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