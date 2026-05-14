const express = require('express')
const { body } = require('express-validator')
const reservaController = require('../controllers/reservaController')
const { authMiddleware, adminMiddleware } = require('../middleware/auth')

const router = express.Router()

router.post('/', [
  body('nombre').trim().notEmpty(),
  body('email').isEmail().normalizeEmail(),
  body('telefono').trim().notEmpty(),
  body('fecha').isDate(),
  body('hora').notEmpty(),
  body('personas').isInt({ min: 1 })
], reservaController.create)

router.get('/', adminMiddleware, reservaController.getAll)
router.put('/:id/estado', adminMiddleware, reservaController.updateEstado)

module.exports = router