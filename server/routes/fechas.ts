import express from 'express'
import fechaController from '../controllers/fechaController'
import { authMiddleware, adminMiddleware } from '../middleware/auth'

const router = express.Router()

router.get('/', fechaController.getAll)
router.post('/', authMiddleware, adminMiddleware, fechaController.create)
router.put('/:id', authMiddleware, adminMiddleware, fechaController.update)
router.delete('/:id', authMiddleware, adminMiddleware, fechaController.delete)

export = router
