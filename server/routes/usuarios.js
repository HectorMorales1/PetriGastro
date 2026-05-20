const express = require('express')
const usuarioController = require('../controllers/usuarioController')
const { authMiddleware, adminMiddleware } = require('../middleware/auth')

const router = express.Router()

router.get('/', authMiddleware, adminMiddleware, usuarioController.getAll)
router.get('/solicitudes', authMiddleware, adminMiddleware, usuarioController.getSolicitudes)
router.put('/:id/aprobar', authMiddleware, adminMiddleware, usuarioController.aprobar)
router.put('/:id/rechazar', authMiddleware, adminMiddleware, usuarioController.rechazar)

module.exports = router
