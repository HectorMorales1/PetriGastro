import express from 'express'
import { body } from 'express-validator'
import authController from '../controllers/authController'
import { authMiddleware } from '../middleware/auth'
import { validate } from '../config/validate'
import pool from '../config/db'

const router = express.Router()

router.post('/register', validate([
  body('nombre').trim().isLength({ min: 2, max: 100 }).withMessage('Nombre debe tener entre 2 y 100 caracteres'),
  body('apellidos').optional().trim().isLength({ max: 100 }).withMessage('Apellidos demasiado largos'),
  body('email').isEmail().withMessage('Email inválido').normalizeEmail().custom(async (email) => {
    const { rows } = await pool.query(
      `SELECT id FROM usuarios WHERE email = $1 AND estado_solicitud IN ('aprobado','pendiente','pendiente_verificacion')`,
      [email]
    )
    if (rows.length > 0) throw new Error('El email ya está registrado')
  }),
  body('password').isLength({ min: 8 }).withMessage('Contraseña debe tener al menos 8 caracteres')
]), authController.register)

router.post('/login', validate([
  body('email').isEmail().withMessage('Email inválido').normalizeEmail(),
  body('password').notEmpty().withMessage('Contraseña requerida')
]), authController.login)

router.get('/me', authMiddleware, authController.me)

router.post('/refresh', validate([
  body('refreshToken').notEmpty().withMessage('Refresh token requerido')
]), authController.refreshToken)

router.get('/verificar', authController.verificarEmail)
router.post('/invalidate-sessions', authMiddleware, authController.invalidateSessions)

export default router
