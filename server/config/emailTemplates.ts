const BASE_STYLE = 'font-family:sans-serif;max-width:500px;margin:0 auto;'
const HEADER = '<h2 style="color:#C4785A;">PetriGastro</h2>'
const FOOTER = '<hr style="border:none;border-top:1px solid #eee;margin:20px 0;"><p style="font-size:12px;color:#999;">PetriGastro - Sabores que cuentan historias</p>'

function wrapBody(body: string): string {
  return `<div style="${BASE_STYLE}">${HEADER}${body}${FOOTER}</div>`
}

export function verificationEmail(nombre: string, verificationUrl: string): string {
  return wrapBody(`
    <p>Hola <strong>${nombre}</strong>,</p>
    <p>Gracias por registrarte en PetriGastro. Para continuar, confirma tu dirección de correo haciendo clic en el siguiente enlace:</p>
    <div style="text-align:center;margin:30px 0;">
      <a href="${verificationUrl}" style="background:#C4785A;color:white;padding:12px 30px;border-radius:8px;text-decoration:none;font-weight:bold;">
        Confirmar correo electrónico
      </a>
    </div>
    <p>Este enlace expira en 24 horas.</p>
    <p style="font-size:12px;color:#999;">Si no solicitaste este registro, ignora este mensaje.</p>
  `)
}

export function approvalEmail(nombre: string): string {
  return wrapBody(`
    <p>Hola <strong>${nombre}</strong>,</p>
    <p>Tu solicitud de acceso a PetriGastro ha sido <strong style="color:#22c55e;">aprobada</strong>.</p>
    <p>Ya puedes iniciar sesión con tu correo y contraseña.</p>
    <div style="text-align:center;margin:30px 0;">
      <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/login" style="background:#C4785A;color:white;padding:12px 30px;border-radius:8px;text-decoration:none;font-weight:bold;">
        Iniciar sesión
      </a>
    </div>
  `)
}

export function rejectionEmail(nombre: string, motivo?: string): string {
  const motivoHtml = motivo ? `<p><strong>Motivo:</strong> ${motivo}</p>` : ''
  return wrapBody(`
    <p>Hola <strong>${nombre}</strong>,</p>
    <p>Tu solicitud de acceso a PetriGastro ha sido rechazada.</p>
    ${motivoHtml}
    <p>Si crees que esto es un error, contacta con el administrador.</p>
  `)
}
