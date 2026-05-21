const express = require('express')
const configController = require('../controllers/configController')
const { adminMiddleware } = require('../middleware/auth')

const router = express.Router()

router.get('/', configController.get)
router.put('/', adminMiddleware, configController.update)
router.post('/generar-fechas', adminMiddleware, configController.generarFechas)

module.exports = router