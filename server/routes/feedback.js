const express = require('express')
const feedbackController = require('../controllers/feedbackController')
const { authMiddleware } = require('../middleware/auth')

const router = express.Router()

router.post('/', authMiddleware, feedbackController.create)
router.get('/pedido/:pedido_id', feedbackController.getByPedido)
router.get('/mis-pedidos', authMiddleware, feedbackController.getMisPedidos)

module.exports = router