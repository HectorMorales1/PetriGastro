import express from 'express'
import { body } from 'express-validator'
import platoController from '../controllers/platoController'
import { authMiddleware, adminMiddleware } from '../middleware/auth'
import { validate } from '../config/validate'

const router = express.Router()

router.get('/', platoController.getAll)
router.get('/:id', platoController.getById)

router.post('/', authMiddleware, adminMiddleware, validate([
  body('nombre').trim().notEmpty().withMessage('Nombre del plato requerido'),
  body('precio').isFloat({ min: 0 }).withMessage('Precio debe ser un número positivo'),
  body('descripcion').optional().trim(),
  body('ingredientes').optional().trim(),
  body('imagen_url').optional().trim(),
  body('disponible').optional().isBoolean(),
  body('destacado').optional().isBoolean()
]), platoController.create)

router.put('/:id', authMiddleware, adminMiddleware, validate([
  body('nombre').optional().trim().escape().notEmpty().withMessage('Nombre del plato requerido'),
  body('precio').optional().isFloat({ min: 0 }).withMessage('Precio debe ser un número positivo'),
  body('descripcion').optional().trim().escape(),
  body('ingredientes').optional().trim().escape(),
  body('imagen_url').optional().trim(),
  body('disponible').optional().isBoolean(),
  body('destacado').optional().isBoolean()
]), platoController.update)
router.delete('/:id', authMiddleware, adminMiddleware, platoController.delete)

export = router
