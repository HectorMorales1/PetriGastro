import express from 'express'
import feedbackController from '../controllers/feedbackController'
import { authMiddleware } from '../middleware/auth'

const router = express.Router()

router.post('/', authMiddleware, feedbackController.create)
router.get('/pedido/:pedido_id', feedbackController.getByPedido)
router.get('/mis-pedidos', authMiddleware, feedbackController.getMisPedidos)

export = router
