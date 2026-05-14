const express = require('express')
const { body } = require('express-validator')
const authController = require('../controllers/authController')
const { authMiddleware } = require('../middleware/auth')

const router = express.Router()

router.post('/register', [
  body('nombre').trim().isLength({ min: 2, max: 100 }),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 })
], authController.register)

router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
], authController.login)

router.get('/me', authMiddleware, authController.me)

module.exports = router