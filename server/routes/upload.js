const express = require('express')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const { adminMiddleware } = require('../middleware/auth')

const router = express.Router()

const uploadsDir = path.join(__dirname, '..', 'uploads')
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    const ext = path.extname(file.originalname)
    cb(null, uniqueSuffix + ext)
  }
})

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase())
  const mimetype = allowedTypes.test(file.mimetype)
  
  if (extname && mimetype) {
    return cb(null, true)
  }
  cb(new Error('Solo se permiten imágenes (jpeg, jpg, png, gif, webp)'))
}

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter
})

router.post('/imagen', adminMiddleware, upload.single('imagen'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No se ha subido ninguna imagen' })
  }
  
  const imageUrl = `/uploads/${req.file.filename}`
  res.json({ url: imageUrl })
})

module.exports = router