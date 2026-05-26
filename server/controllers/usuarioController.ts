import { Request, Response } from 'express'
import pool from '../config/db'
import logger from '../config/logger'
import { AppError, asyncHandler } from '../middleware/errorHandler'
import { sendEmail } from '../config/mailer'

const getSolicitudes = asyncHandler(async (req: Request, res: Response) => {
  const result = await pool.query(
    `SELECT id, nombre, apellidos, email, fecha_solicitud, created_at 
     FROM usuarios 
     WHERE estado_solicitud = 'pendiente' AND deleted_at IS NULL
     ORDER BY fecha_solicitud ASC`
  )
  res.json(result.rows)
})

const getAll = asyncHandler(async (req: Request, res: Response) => {
  const page = Math.max(1, parseInt(req.query.page as string, 10) || 1)
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string, 10) || 50))
  const offset = (page - 1) * limit

  const countResult = await pool.query('SELECT COUNT(*) as total FROM usuarios WHERE deleted_at IS NULL')
  const total = parseInt(countResult.rows[0].total as string, 10)

  const result = await pool.query(
    `SELECT id, nombre, apellidos, email, rol, estado_solicitud, email_verificado, fecha_solicitud, motivo_rechazo, created_at 
     FROM usuarios 
     WHERE deleted_at IS NULL
     ORDER BY created_at DESC
     LIMIT $1 OFFSET $2`,
    [limit, offset]
  )

  res.json({
    data: result.rows,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
  })
})

const aprobar = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params

  const user = await pool.query(
    'SELECT id, nombre, email, estado_solicitud FROM usuarios WHERE id = $1',
    [id]
  )

  if (user.rows.length === 0) {
    throw new AppError('Usuario no encontrado', 404)
  }

  const userData = user.rows[0] as { id: number; nombre: string; email: string; estado_solicitud: string }

  if (userData.estado_solicitud !== 'pendiente') {
    throw new AppError(`La solicitud no está pendiente. Estado actual: ${userData.estado_solicitud}`, 400)
  }

  await pool.query(
    `UPDATE usuarios SET estado_solicitud = 'aprobado', motivo_rechazo = NULL WHERE id = $1`,
    [id]
  )

  const result = await sendEmail({
    to: userData.email,
    subject: 'Acceso aprobado - PetriGastro',
    html: `<div style="font-family:sans-serif;max-width:500px;margin:0 auto;">
      <h2 style="color:#C4785A;">PetriGastro</h2>
      <p>Hola <strong>${userData.nombre}</strong>,</p>
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

const rechazar = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params
  const { motivo } = req.body

  const user = await pool.query(
    'SELECT id, nombre, email, estado_solicitud FROM usuarios WHERE id = $1',
    [id]
  )

  if (user.rows.length === 0) {
    throw new AppError('Usuario no encontrado', 404)
  }

  const userData = user.rows[0] as { id: number; nombre: string; email: string; estado_solicitud: string }

  if (userData.estado_solicitud !== 'pendiente') {
    throw new AppError(`La solicitud no está pendiente. Estado actual: ${userData.estado_solicitud}`, 400)
  }

  const motivoFinal = motivo || ''

  const motivoHtml = motivoFinal ? `<p><strong>Motivo:</strong> ${motivoFinal}</p>` : ''
  const mensajeDefault = 'Tu solicitud de acceso a PetriGastro ha sido rechazada.'

  await sendEmail({
    to: userData.email,
    subject: 'Acceso rechazado - PetriGastro',
    html: `<div style="font-family:sans-serif;max-width:500px;margin:0 auto;">
      <h2 style="color:#C4785A;">PetriGastro</h2>
      <p>Hola <strong>${userData.nombre}</strong>,</p>
      <p>${mensajeDefault}</p>
      ${motivoHtml}
      <p>Si crees que esto es un error, contacta con el administrador.</p>
      <hr style="border:none;border-top:1px solid #eee;margin:20px 0;">
      <p style="font-size:12px;color:#999;">PetriGastro - Sabores que cuentan historias</p>
    </div>`
  })

  await pool.query(
    `UPDATE usuarios SET estado_solicitud = 'rechazado', motivo_rechazo = $1, deleted_at = NOW() WHERE id = $2`,
    [motivoFinal, id]
  )

  res.json({ message: 'Solicitud rechazada. Se ha desactivado el usuario.', emailSent: true })
})

const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params
  await pool.query(
    `UPDATE usuarios SET estado_solicitud = 'rechazado', deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL`,
    [id]
  )
  res.json({ message: 'Usuario desactivado' })
})

const updateRol = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params
  const { rol } = req.body
  if (!['admin', 'cliente'].includes(rol)) {
    throw new AppError('Rol inválido. Debe ser admin o cliente', 400)
  }
  await pool.query('UPDATE usuarios SET rol = $1 WHERE id = $2', [rol, id])
  res.json({ message: 'Rol actualizado' })
})

export = { getSolicitudes, getAll, aprobar, rechazar, delete: deleteUser, updateRol }
