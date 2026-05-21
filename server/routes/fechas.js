const express = require('express')
const fechaController = require('../controllers/fechaController')
const { authMiddleware, adminMiddleware } = require('../middleware/auth')

const router = express.Router()

router.get('/', fechaController.getAll)
router.post('/', authMiddleware, adminMiddleware, fechaController.create)
router.put('/:id', authMiddleware, adminMiddleware, fechaController.update)
router.delete('/:id', authMiddleware, adminMiddleware, fechaController.delete)

module.exports = router