const express = require('express')
const { body } = require('express-validator')
const pedidoController = require('../controllers/pedidoController')
const { authMiddleware, adminMiddleware } = require('../middleware/auth')
const { validate } = require('../config/validate')

const router = express.Router()

router.post('/', authMiddleware, validate([
  body('items').isArray({ min: 1 }).withMessage('Debe incluir al menos un item'),
  body('notas').optional().trim(),
  body('fecha_recogida').optional().trim()
]), pedidoController.create)

router.get('/', authMiddleware, adminMiddleware, pedidoController.getAll)
router.get('/mis-pedidos', authMiddleware, pedidoController.getMine)
router.get('/stats', authMiddleware, adminMiddleware, pedidoController.getStats)
router.put('/:id/estado', authMiddleware, adminMiddleware, validate([
  body('estado').isIn(['pendiente', 'confirmado', 'preparando', 'preparado', 'entregado', 'cancelado']).withMessage('Estado inválido')
]), pedidoController.updateEstado)

module.exports = router