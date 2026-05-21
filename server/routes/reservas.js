const express = require('express')
const { body } = require('express-validator')
const reservaController = require('../controllers/reservaController')
const { authMiddleware, adminMiddleware } = require('../middleware/auth')
const { validate } = require('../config/validate')

const router = express.Router()

router.post('/', validate([
  body('nombre').trim().notEmpty().withMessage('Nombre requerido'),
  body('email').isEmail().withMessage('Email inválido').normalizeEmail(),
  body('telefono').trim().notEmpty().withMessage('Teléfono requerido'),
  body('fecha').isDate().withMessage('Fecha inválida'),
  body('hora').notEmpty().withMessage('Hora requerida'),
  body('personas').isInt({ min: 1 }).withMessage('Debe haber al menos 1 comensal')
]), reservaController.create)

router.get('/', authMiddleware, adminMiddleware, reservaController.getAll)
router.put('/:id/estado', authMiddleware, adminMiddleware, reservaController.updateEstado)

module.exports = router