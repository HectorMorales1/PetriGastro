const pool = require('../config/db')
const { sendEmail } = require('../config/mailer')

exports.getSolicitudes = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, nombre, apellidos, email, fecha_solicitud, created_at 
       FROM usuarios 
       WHERE estado_solicitud = 'pendiente'
       ORDER BY fecha_solicitud ASC`
    )
    res.json(result.rows)
  } catch (error) {
    console.error('Error obteniendo solicitudes:', error)
    res.status(500).json({ message: 'Error del servidor' })
  }
}

exports.getAll = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, nombre, apellidos, email, rol, estado_solicitud, email_verificado, fecha_solicitud, motivo_rechazo, created_at 
       FROM usuarios 
       ORDER BY created_at DESC`
    )
    res.json(result.rows)
  } catch (error) {
    console.error('Error obteniendo usuarios:', error)
    res.status(500).json({ message: 'Error del servidor' })
  }
}

exports.aprobar = async (req, res) => {
  try {
    const { id } = req.params

    const user = await pool.query(
      'SELECT id, nombre, email, estado_solicitud FROM usuarios WHERE id = $1',
      [id]
    )

    if (user.rows.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' })
    }

    if (user.rows[0].estado_solicitud !== 'pendiente') {
      return res.status(400).json({ message: `La solicitud no está pendiente. Estado actual: ${user.rows[0].estado_solicitud}` })
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
  } catch (error) {
    console.error('Error aprobando solicitud:', error)
    res.status(500).json({ message: 'Error del servidor' })
  }
}

exports.rechazar = async (req, res) => {
  try {
    const { id } = req.params
    const { motivo } = req.body

    const user = await pool.query(
      'SELECT id, nombre, email, estado_solicitud FROM usuarios WHERE id = $1',
      [id]
    )

    if (user.rows.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' })
    }

    if (user.rows[0].estado_solicitud !== 'pendiente') {
      return res.status(400).json({ message: `La solicitud no está pendiente. Estado actual: ${user.rows[0].estado_solicitud}` })
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
  } catch (error) {
    console.error('Error rechazando solicitud:', error)
    res.status(500).json({ message: 'Error del servidor' })
  }
}
