require('dotenv').config({ path: '../.env' })

process.env.NODE_ENV = 'test'
process.env.JWT_SECRET = 'test-secret'
process.env.DB_NAME = process.env.DB_NAME || 'petrigastro_test'
