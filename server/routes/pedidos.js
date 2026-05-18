const express = require('express')
const { body, sanitizeBody } = require('express-validator')
const pedidoController = require('../controllers/pedidoController')
const { authMiddleware, adminMiddleware } = require('../middleware/auth')

const router = express.Router()

router.post('/', authMiddleware, [
  body('items').isArray({ min: 1 }),
  body('notas').optional().trim().escape(),
  body('fecha_recogida').optional().trim(),
  sanitizeBody('items').stripLow()
], pedidoController.create)

router.get('/', authMiddleware, adminMiddleware, pedidoController.getAll)
router.get('/mios', authMiddleware, pedidoController.getMine)
router.get('/stats', authMiddleware, adminMiddleware, pedidoController.getStats)
router.put('/:id/estado', authMiddleware, adminMiddleware, [
  body('estado').isIn(['pendiente', 'confirmado', 'preparando', 'preparado', 'entregado', 'cancelado']).escape()
], pedidoController.updateEstado)

module.exports = router