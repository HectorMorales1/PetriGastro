const express = require('express')
const { body } = require('express-validator')
const pedidoController = require('../controllers/pedidoController')
const { authMiddleware, adminMiddleware } = require('../middleware/auth')

const router = express.Router()

router.post('/', authMiddleware, [
  body('items').isArray({ min: 1 })
], pedidoController.create)

router.get('/', authMiddleware, adminMiddleware, pedidoController.getAll)
router.get('/mios', authMiddleware, pedidoController.getMine)
router.get('/stats', authMiddleware, adminMiddleware, pedidoController.getStats)
router.put('/:id/estado', authMiddleware, adminMiddleware, pedidoController.updateEstado)

module.exports = router