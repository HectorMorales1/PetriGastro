import express from 'express'
import { body } from 'express-validator'
import configController from '../controllers/configController'
import { authMiddleware, adminMiddleware } from '../middleware/auth'
import { validate } from '../config/validate'

const router = express.Router()

router.get('/', configController.get)
router.put('/', authMiddleware, adminMiddleware, validate([
  body('clave').trim().escape().notEmpty().withMessage('Clave requerida'),
  body('valor').trim().escape().notEmpty().withMessage('Valor requerido')
]), configController.update)
router.post('/generar-fechas', authMiddleware, adminMiddleware, configController.generarFechas)

export default router
