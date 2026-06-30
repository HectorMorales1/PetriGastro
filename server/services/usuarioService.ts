import pool from '../config/db'
import { AppError } from '../middleware/errorHandler'
import { sendEmail } from '../config/mailer'
import { approvalEmail, rejectionEmail } from '../config/emailTemplates'

export async function getSolicitudes() {
  const result = await pool.query(
    `SELECT id, nombre, apellidos, email, fecha_solicitud, created_at 
     FROM usuarios 
     WHERE estado_solicitud = 'pendiente' AND deleted_at IS NULL
     ORDER BY fecha_solicitud ASC`
  )
  return result.rows
}

export async function getAll(page = 1, limit = 50) {
  const pageNum = Math.max(1, page)
  const limitNum = Math.min(100, Math.max(1, limit))
  const offset = (pageNum - 1) * limitNum

  const countResult = await pool.query('SELECT COUNT(*) as total FROM usuarios WHERE deleted_at IS NULL')
  const total = parseInt(countResult.rows[0].total as string, 10)

  const result = await pool.query(
    `SELECT id, nombre, apellidos, email, rol, estado_solicitud, email_verificado, fecha_solicitud, motivo_rechazo, created_at 
     FROM usuarios WHERE deleted_at IS NULL
     ORDER BY created_at DESC
     LIMIT $1 OFFSET $2`,
    [limitNum, offset]
  )

  return {
    data: result.rows,
    pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) }
  }
}

export async function aprobar(id: number) {
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
    'UPDATE usuarios SET estado_solicitud = $1, motivo_rechazo = NULL WHERE id = $2',
    ['aprobado', id]
  )

  const result = await sendEmail({
    to: userData.email,
    subject: 'Acceso aprobado - PetriGastro',
    html: approvalEmail(userData.nombre)
  })

  return { emailSent: result.success }
}

export async function rechazar(id: number, motivo?: string) {
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

  const motivoFinal = (motivo || '').replace(/[<>"'&]/g, '')

  await sendEmail({
    to: userData.email,
    subject: 'Acceso rechazado - PetriGastro',
    html: rejectionEmail(userData.nombre, motivoFinal)
  })

  await pool.query(
    'UPDATE usuarios SET estado_solicitud = $1, motivo_rechazo = $2, deleted_at = NOW() WHERE id = $3',
    ['rechazado', motivoFinal, id]
  )
}

export async function remove(id: number) {
  await pool.query(
    'UPDATE usuarios SET estado_solicitud = $1, deleted_at = NOW() WHERE id = $2 AND deleted_at IS NULL',
    ['rechazado', id]
  )
}

export async function updateRol(id: number, rol: string) {
  if (!['admin', 'cliente'].includes(rol)) {
    throw new AppError('Rol inválido. Debe ser admin o cliente', 400)
  }
  await pool.query('UPDATE usuarios SET rol = $1 WHERE id = $2', [rol, id])
}
