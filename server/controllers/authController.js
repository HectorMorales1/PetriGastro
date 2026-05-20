const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const pool = require('../config/db')
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
    { id: user.id, type: 'refresh' },
    process.env.JWT_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d' }
  )
}

exports.register = async (req, res) => {
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
        return res.status(400).json({ message: 'El email ya está registrado' })
      }

      await client.query(
        `UPDATE usuarios SET nombre = $1, apellidos = $2, password_hash = $3, 
         estado_solicitud = 'pendiente', email_verificado = true,
         fecha_solicitud = NOW(), motivo_rechazo = NULL
         WHERE id = $4`,
        [nombre, apellidos || '', passwordHash, existing.id]
      )
    } else {
      await client.query(
        `INSERT INTO usuarios (nombre, apellidos, email, password_hash, rol, estado_solicitud, email_verificado, fecha_solicitud) 
         VALUES ($1, $2, $3, $4, 'cliente', 'pendiente', true, NOW())`,
        [nombre, apellidos || '', email, passwordHash]
      )
    }

    await client.query('COMMIT')

    // ─────────────────────────────────────────────────────────
    // FUTURO: activar verificación por email
    // 1. Descomentar `const crypto = require('crypto')` arriba
    // 2. Reemplazar las líneas de INSERT/UPDATE anteriores por:
    //    estado_solicitud = 'pendiente_verificacion'
    //    email_verificado = false
    //    email_verification_token = $token
    //    email_verification_expires = $expiresAt
    // 3. Descomentar el bloque inferior de envío de email
    // ─────────────────────────────────────────────────────────
    if (process.env.SMTP_HOST) {
      // const crypto = require('crypto')
      // const verificationToken = crypto.randomBytes(32).toString('hex')
      // const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)
      // const verificationUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/verificar?token=${verificationToken}`
      sendEmail({
        to: email,
        subject: 'Confirma tu correo - PetriGastro',
        html: `<div style="font-family:sans-serif;max-width:500px;margin:0 auto;">
          <h2 style="color:#C4785A;">PetriGastro</h2>
          <p>Hola <strong>${nombre}</strong>,</p>
          <p>Gracias por solicitar acceso a PetriGastro. Para continuar, confirma tu dirección de correo.</p>
          <hr style="border:none;border-top:1px solid #eee;margin:20px 0;">
          <p style="font-size:12px;color:#999;">Si no solicitaste este registro, ignora este mensaje.</p>
        </div>`
      })
    }

    res.status(201).json({
      message: 'Solicitud enviada correctamente. Espera a que el administrador apruebe tu acceso.',
      pendingVerification: false
    })
  } catch (error) {
    await client.query('ROLLBACK')
    console.error('Error en registro:', error)
    res.status(500).json({ message: 'Error del servidor' })
  } finally {
    client.release()
  }
}

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body

    const result = await pool.query(
      'SELECT id, nombre, apellidos, email, password_hash, rol, estado_solicitud, email_verificado, motivo_rechazo FROM usuarios WHERE email = $1',
      [email]
    )

    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Credenciales inválidas' })
    }

    const user = result.rows[0]

    const validPassword = await bcrypt.compare(password, user.password_hash)
    if (!validPassword) {
      return res.status(401).json({ message: 'Credenciales inválidas' })
    }

    if (user.estado_solicitud === 'pendiente_verificacion') {
      return res.status(403).json({ message: 'Debes verificar tu correo electrónico primero. Revisa tu bandeja de entrada.', estado_solicitud: user.estado_solicitud })
    }

    if (user.estado_solicitud === 'pendiente') {
      return res.status(403).json({ message: 'Tu solicitud está pendiente de aprobación por el administrador.', estado_solicitud: user.estado_solicitud })
    }

    if (user.estado_solicitud === 'rechazado') {
      const motivo = user.motivo_rechazo ? ` Motivo: ${user.motivo_rechazo}` : ''
      return res.status(403).json({ message: `Tu solicitud de acceso ha sido rechazada.${motivo}`, estado_solicitud: user.estado_solicitud })
    }

    const token = generateToken(user)
    const refreshToken = generateRefreshToken(user)

    res.json({
      token,
      refreshToken,
      user: {
        id: user.id,
        nombre: user.nombre,
        apellidos: user.apellidos,
        email: user.email,
        rol: user.rol,
        estado_solicitud: user.estado_solicitud,
        email_verificado: user.email_verificado
      }
    })
  } catch (error) {
    console.error('Error en login:', error)
    res.status(500).json({ message: 'Error del servidor' })
  }
}

exports.me = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, nombre, apellidos, email, rol, estado_solicitud, email_verificado FROM usuarios WHERE id = $1',
      [req.user.id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' })
    }

    res.json(result.rows[0])
  } catch (error) {
    console.error('Error en me:', error)
    res.status(500).json({ message: 'Error del servidor' })
  }
}

exports.verificarEmail = async (req, res) => {
  try {
    const { token } = req.query

    if (!token) {
      return res.status(400).json({ message: 'Token de verificación requerido' })
    }

    const result = await pool.query(
      `SELECT id, email_verificado, email_verification_expires FROM usuarios 
       WHERE email_verification_token = $1`,
      [token]
    )

    if (result.rows.length === 0) {
      return res.status(400).json({ message: 'Token de verificación inválido' })
    }

    const user = result.rows[0]

    if (user.email_verificado) {
      return res.json({ message: 'El correo ya ha sido verificado.', alreadyVerified: true })
    }

    if (user.email_verification_expires && new Date(user.email_verification_expires) < new Date()) {
      return res.status(400).json({ message: 'El token de verificación ha expirado. Solicita un nuevo registro.', expired: true })
    }

    await pool.query(
      `UPDATE usuarios SET email_verificado = true, estado_solicitud = 'pendiente', 
       email_verification_token = NULL, email_verification_expires = NULL 
       WHERE id = $1`,
      [user.id]
    )

    res.json({ message: 'Correo verificado correctamente. Tu solicitud ha sido enviada al administrador para su aprobación.' })
  } catch (error) {
    console.error('Error en verificar email:', error)
    res.status(500).json({ message: 'Error del servidor' })
  }
}

exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body

    if (!refreshToken) {
      return res.status(400).json({ message: 'Refresh token requerido' })
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET)

    if (decoded.type !== 'refresh') {
      return res.status(401).json({ message: 'Token inválido' })
    }

    const result = await pool.query(
      'SELECT id, nombre, apellidos, email, rol, estado_solicitud, email_verificado FROM usuarios WHERE id = $1',
      [decoded.id]
    )

    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Usuario no encontrado' })
    }

    const user = result.rows[0]
    const newToken = generateToken(user)
    const newRefreshToken = generateRefreshToken(user)

    res.json({
      token: newToken,
      refreshToken: newRefreshToken,
      user: { id: user.id, nombre: user.nombre, apellidos: user.apellidos, email: user.email, rol: user.rol, estado_solicitud: user.estado_solicitud, email_verificado: user.email_verificado }
    })
  } catch (error) {
    console.error('Error en refresh token:', error)
    res.status(401).json({ message: 'Token inválido o expirado' })
  }
}