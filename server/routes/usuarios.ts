import express from 'express'
import usuarioController from '../controllers/usuarioController'
import { authMiddleware, adminMiddleware } from '../middleware/auth'

const router = express.Router()

router.get('/', authMiddleware, adminMiddleware, usuarioController.getAll)
router.get('/solicitudes', authMiddleware, adminMiddleware, usuarioController.getSolicitudes)
router.put('/:id/aprobar', authMiddleware, adminMiddleware, usuarioController.aprobar)
router.put('/:id/rechazar', authMiddleware, adminMiddleware, usuarioController.rechazar)

router.delete('/:id', authMiddleware, adminMiddleware, usuarioController.delete)
router.put('/:id/rol', authMiddleware, adminMiddleware, usuarioController.updateRol)

export = router
