const pool = require('../config/db')
const logger = require('../config/logger')
const { AppError, asyncHandler } = require('../middleware/errorHandler')
const { sendEmail } = require('../config/mailer')

exports.getSolicitudes = asyncHandler(async (req, res) => {
  const result = await pool.query(
    `SELECT id, nombre, apellidos, email, fecha_solicitud, created_at 
     FROM usuarios 
     WHERE estado_solicitud = 'pendiente'
     ORDER BY fecha_solicitud ASC`
  )
  res.json(result.rows)
})

exports.getAll = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1)
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 50))
  const offset = (page - 1) * limit

  const countResult = await pool.query('SELECT COUNT(*) as total FROM usuarios')
  const total = parseInt(countResult.rows[0].total)

  const result = await pool.query(
    `SELECT id, nombre, apellidos, email, rol, estado_solicitud, email_verificado, fecha_solicitud, motivo_rechazo, created_at 
     FROM usuarios 
     ORDER BY created_at DESC
     LIMIT $1 OFFSET $2`,
    [limit, offset]
  )

  res.json({
    data: result.rows,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
  })
})

exports.aprobar = asyncHandler(async (req, res) => {
  const { id } = req.params

  const user = await pool.query(
    'SELECT id, nombre, email, estado_solicitud FROM usuarios WHERE id = $1',
    [id]
  )

  if (user.rows.length === 0) {
    throw new AppError('Usuario no encontrado', 404)
  }

  if (user.rows[0].estado_solicitud !== 'pendiente') {
    throw new AppError(`La solicitud no está pendiente. Estado actual: ${user.rows[0].estado_solicitud}`, 400)
  }

  const u = user.rows[0]
  await pool.query(
    `UPDATE usuarios SET estado_solicitud = 'aprobado', motivo_rechazo = NULL WHERE id = $1`,
    [id]
  )

  const result = await sendEmail({
    to: u.email,
    subject: 'Acceso aprobado - PetriGastro',
    html: `<div style="font-family:sans-serif;max-width:500px;margin:0 auto;">
      <h2 style="color:#C4785A;">PetriGastro</h2>
      <p>Hola <strong>${u.nombre}</strong>,</p>
      <p>Tu solicitud de acceso a PetriGastro ha sido <strong style="color:#22c55e;">aprobada</strong>.</p>
      <p>Ya puedes iniciar sesión con tu correo y contraseña.</p>
      <div style="text-align:center;margin:30px 0;">
        <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/login" style="background:#C4785A;color:white;padding:12px 30px;border-radius:8px;text-decoration:none;font-weight:bold;">
          Iniciar sesión
        </a>
      </div>
      <hr style="border:none;border-top:1px solid #eee;margin:20px 0;">
      <p style="font-size:12px;color:#999;">PetriGastro - Sabores que cuentan historias</p>
    </div>`
  })

  res.json({ message: 'Solicitud aprobada. Se ha notificado al usuario.', emailSent: result.success })
})

exports.rechazar = asyncHandler(async (req, res) => {
  const { id } = req.params
  const { motivo } = req.body

  const user = await pool.query(
    'SELECT id, nombre, email, estado_solicitud FROM usuarios WHERE id = $1',
    [id]
  )

  if (user.rows.length === 0) {
    throw new AppError('Usuario no encontrado', 404)
  }

  if (user.rows[0].estado_solicitud !== 'pendiente') {
    throw new AppError(`La solicitud no está pendiente. Estado actual: ${user.rows[0].estado_solicitud}`, 400)
  }

  const u = user.rows[0]
  const motivoFinal = motivo || ''

  await pool.query(
    `UPDATE usuarios SET estado_solicitud = 'rechazado', motivo_rechazo = $1 WHERE id = $2`,
    [motivoFinal || null, id]
  )

  const motivoHtml = motivoFinal ? `<p><strong>Motivo:</strong> ${motivoFinal}</p>` : ''
  const mensajeDefault = 'Tu solicitud de acceso a PetriGastro ha sido rechazada.'

  const result = await sendEmail({
    to: u.email,
    subject: 'Acceso rechazado - PetriGastro',
    html: `<div style="font-family:sans-serif;max-width:500px;margin:0 auto;">
      <h2 style="color:#C4785A;">PetriGastro</h2>
      <p>Hola <strong>${u.nombre}</strong>,</p>
      <p>${mensajeDefault}</p>
      ${motivoHtml}
      <p>Si crees que esto es un error, contacta con el administrador.</p>
      <hr style="border:none;border-top:1px solid #eee;margin:20px 0;">
      <p style="font-size:12px;color:#999;">PetriGastro - Sabores que cuentan historias</p>
    </div>`
  })

  res.json({ message: 'Solicitud rechazada. Se ha notificado al usuario.', emailSent: result.success })
})
