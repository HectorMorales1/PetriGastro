const nodemailer = require('nodemailer')
const logger = require('./logger')

let transporter = null
let etherealUrl = ''

async function getTransporter() {
  if (transporter) return transporter

  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    })
    logger.info('Mailer: usando SMTP configurado')
  } else {
    const testAccount = await nodemailer.createTestAccount()
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    })
    etherealUrl = `https://ethereal.email/login?userName=${testAccount.user}`
    logger.info(`Mailer: usando Ethereal. Ver correos en: ${etherealUrl}`)
  }

  return transporter
}

async function sendEmail({ to, subject, html }) {
  try {
    const t = await getTransporter()
    const fromName = process.env.SMTP_FROM_NAME || 'PetriGastro'
    const fromAddr = process.env.SMTP_FROM || 'noreply@petrigastro.com'

    const info = await t.sendMail({
      from: `"${fromName}" <${fromAddr}>`,
      to,
      subject,
      html
    })

    if (etherealUrl) {
      logger.info(`Email enviado (Ethereal): ${nodemailer.getTestMessageUrl(info)}`)
    } else {
      logger.info(`Email enviado a ${to}: ${info.messageId}`)
    }

    return { success: true, messageId: info.messageId, etherealUrl: etherealUrl ? nodemailer.getTestMessageUrl(info) : null }
  } catch (error) {
    logger.error(`Error enviando email a ${to}:`, error.message)
    return { success: false, error: error.message }
  }
}

module.exports = { sendEmail, getTransporter }
