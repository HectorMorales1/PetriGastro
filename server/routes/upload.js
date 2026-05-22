const express = require('express')
const multer = require('multer')
const cloudinary = require('../config/cloudinary')
const { authMiddleware, adminMiddleware } = require('../middleware/auth')

const router = express.Router()

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
  if (allowedTypes.includes(file.mimetype)) {
    return cb(null, true)
  }
  cb(new Error('Solo se permiten imágenes (jpeg, jpg, png, gif, webp)'))
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter
})

router.post('/imagen', authMiddleware, adminMiddleware, (req, res, next) => {
  upload.single('imagen')(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'La imagen es demasiado grande. Máximo 5MB' })
      }
      return res.status(400).json({ message: err.message })
    }
    next()
  })
}, async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No se ha subido ninguna imagen' })
  }

  try {
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'petrigastro/platos',
          resource_type: 'image'
        },
        (error, result) => {
          if (error) reject(error)
          else resolve(result)
        }
      )
      uploadStream.end(req.file.buffer)
    })

    res.json({ url: result.secure_url })
  } catch (error) {
    console.error('Error subiendo a Cloudinary:', error)
    res.status(500).json({ message: 'Error al subir la imagen' })
  }
})

module.exports = router