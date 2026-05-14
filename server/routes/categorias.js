const express = require('express')
const categoriaController = require('../controllers/categoriaController')

const router = express.Router()

router.get('/', categoriaController.getAll)

module.exports = router