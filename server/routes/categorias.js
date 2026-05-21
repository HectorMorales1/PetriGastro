const express = require('express')
const { body } = require('express-validator')
const categoriaController = require('../controllers/categoriaController')
const { adminMiddleware } = require('../middleware/auth')
const { validate } = require('../config/validate')

const router = express.Router()

router.get('/', categoriaController.getAll)
router.post('/', adminMiddleware, validate([
  body('nombre').trim().notEmpty().withMessage('Nombre de categoría requerido')
]), categoriaController.create)
router.put('/:id', adminMiddleware, categoriaController.update)
router.delete('/:id', adminMiddleware, categoriaController.delete)

module.exports = router