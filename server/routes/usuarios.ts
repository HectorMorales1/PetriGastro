import express from 'express'
import { body, param } from 'express-validator'
import usuarioController from '../controllers/usuarioController'
import { authMiddleware, adminMiddleware } from '../middleware/auth'
import { validate } from '../config/validate'

const router = express.Router()

router.get('/', authMiddleware, adminMiddleware, usuarioController.getAll)
router.get('/solicitudes', authMiddleware, adminMiddleware, usuarioController.getSolicitudes)
router.put('/:id/aprobar', authMiddleware, adminMiddleware, validate([
  param('id').isInt({ min: 1 }).withMessage('ID de usuario inválido')
]), usuarioController.aprobar)
router.put('/:id/rechazar', authMiddleware, adminMiddleware, validate([
  param('id').isInt({ min: 1 }).withMessage('ID de usuario inválido'),
  body('motivo').optional().trim().escape().isLength({ max: 500 }).withMessage('Motivo demasiado largo (máx 500 caracteres)')
]), usuarioController.rechazar)

router.delete('/:id', authMiddleware, adminMiddleware, validate([
  param('id').isInt({ min: 1 }).withMessage('ID de usuario inválido')
]), usuarioController.delete)
router.put('/:id/rol', authMiddleware, adminMiddleware, validate([
  param('id').isInt({ min: 1 }).withMessage('ID de usuario inválido'),
  body('rol').isIn(['admin', 'cliente']).withMessage('Rol debe ser admin o cliente')
]), usuarioController.updateRol)

export = router
