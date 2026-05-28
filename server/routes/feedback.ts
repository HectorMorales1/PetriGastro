import express from 'express'
import { body, param } from 'express-validator'
import feedbackController from '../controllers/feedbackController'
import { authMiddleware } from '../middleware/auth'
import { validate } from '../config/validate'

const router = express.Router()

router.post('/', authMiddleware, validate([
  body('pedido_id').isInt({ min: 1 }).withMessage('ID de pedido requerido'),
  body('calificacion').isInt({ min: 1, max: 5 }).withMessage('Calificación debe ser entre 1 y 5'),
  body('comentario').optional().trim().escape().isLength({ max: 1000 }).withMessage('Comentario demasiado largo (máx 1000 caracteres)')
]), feedbackController.create)
router.get('/pedido/:pedido_id', validate([
  param('pedido_id').isInt({ min: 1 }).withMessage('ID de pedido inválido')
]), feedbackController.getByPedido)
router.get('/mis-pedidos', authMiddleware, feedbackController.getMisPedidos)

export default router
