const express = require('express')
const { body } = require('express-validator')
const authController = require('../controllers/authController')
const { authMiddleware } = require('../middleware/auth')
const { validate } = require('../config/validate')

const router = express.Router()

router.post('/register', validate([
  body('nombre').trim().isLength({ min: 2, max: 100 }).withMessage('Nombre debe tener entre 2 y 100 caracteres'),
  body('apellidos').optional().trim().isLength({ max: 100 }).withMessage('Apellidos demasiado largos'),
  body('email').isEmail().withMessage('Email inválido').normalizeEmail(),
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

module.exports = router