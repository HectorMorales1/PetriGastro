const express = require('express')
const { body } = require('express-validator')
const categoriaController = require('../controllers/categoriaController')
const { adminMiddleware } = require('../middleware/auth')

const router = express.Router()

router.get('/', categoriaController.getAll)
router.post('/', adminMiddleware, [
  body('nombre').trim().notEmpty()
], categoriaController.create)
router.put('/:id', adminMiddleware, categoriaController.update)
router.delete('/:id', adminMiddleware, categoriaController.delete)

module.exports = router