import express from 'express'
import { body, param } from 'express-validator'
import fechaController from '../controllers/fechaController'
import { authMiddleware, adminMiddleware } from '../middleware/auth'
import { validate } from '../config/validate'

const router = express.Router()

router.get('/', fechaController.getAll)
router.post('/', authMiddleware, adminMiddleware, validate([
  body('fecha').isISO8601().withMessage('Fecha inválida'),
  body('horarios').isArray({ min: 1 }).withMessage('Debe incluir al menos un horario'),
  body('horarios.*').matches(/^\d{2}:\d{2}$/).withMessage('Formato de hora inválido (HH:MM)')
]), fechaController.create)
router.put('/:id', authMiddleware, adminMiddleware, validate([
  param('id').isInt({ min: 1 }).withMessage('ID de fecha inválido'),
  body('activo').optional().isBoolean().withMessage('Activo debe ser booleano'),
  body('horarios').optional().isArray().withMessage('Horarios debe ser un array')
]), fechaController.update)
router.delete('/:id', authMiddleware, adminMiddleware, validate([
  param('id').isInt({ min: 1 }).withMessage('ID de fecha inválido')
]), fechaController.delete)

export default router
