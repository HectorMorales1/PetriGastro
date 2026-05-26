import express from 'express'
import { body } from 'express-validator'
import categoriaController from '../controllers/categoriaController'
import { authMiddleware, adminMiddleware } from '../middleware/auth'
import { validate } from '../config/validate'

const router = express.Router()

router.get('/', categoriaController.getAll)
router.post('/', authMiddleware, adminMiddleware, validate([
  body('nombre').trim().escape().notEmpty().withMessage('Nombre de categoría requerido')
]), categoriaController.create)
router.put('/:id', authMiddleware, adminMiddleware, validate([
  body('nombre').optional().trim().escape().notEmpty().withMessage('Nombre de categoría requerido'),
  body('icono').optional().isString(),
  body('orden').optional().isInt({ min: 0 }).withMessage('Orden debe ser un número positivo')
]), categoriaController.update)
router.delete('/:id', authMiddleware, adminMiddleware, categoriaController.delete)

export = router
