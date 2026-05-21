const express = require('express')
const { body } = require('express-validator')
const platoController = require('../controllers/platoController')
const { authMiddleware, adminMiddleware } = require('../middleware/auth')
const { validate } = require('../config/validate')

const router = express.Router()

router.get('/', platoController.getAll)
router.get('/:id', platoController.getById)

router.post('/', authMiddleware, adminMiddleware, validate([
  body('nombre').trim().notEmpty().withMessage('Nombre del plato requerido'),
  body('precio').isFloat({ min: 0 }).withMessage('Precio debe ser un número positivo'),
  body('descripcion').optional().trim(),
  body('imagen_url').optional().trim(),
  body('disponible').optional().isBoolean(),
  body('destacado').optional().isBoolean()
]), platoController.create)

router.put('/:id', authMiddleware, adminMiddleware, platoController.update)
router.delete('/:id', authMiddleware, adminMiddleware, platoController.delete)

module.exports = router