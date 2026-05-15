const express = require('express')
const { body } = require('express-validator')
const platoController = require('../controllers/platoController')
const { authMiddleware, adminMiddleware } = require('../middleware/auth')

const router = express.Router()

router.get('/', platoController.getAll)
router.get('/:id', platoController.getById)

router.post('/', authMiddleware, adminMiddleware, [
  body('nombre').trim().notEmpty(),
  body('precio').isFloat({ min: 0 }),
  body('destacado').optional().isBoolean()
], platoController.create)

router.put('/:id', authMiddleware, adminMiddleware, platoController.update)
router.delete('/:id', authMiddleware, adminMiddleware, platoController.delete)

module.exports = router