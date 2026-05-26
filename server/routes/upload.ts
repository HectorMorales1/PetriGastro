import express, { Request, Response, NextFunction } from 'express'
import multer, { FileFilterCallback } from 'multer'
import cloudinary from '../config/cloudinary'
import { authMiddleware, adminMiddleware } from '../middleware/auth'

const router = express.Router()

const fileFilter = (_req: Request, file: Express.Multer.File, cb: FileFilterCallback): void => {
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

router.post('/imagen', authMiddleware, adminMiddleware, (req: Request, res: Response, next: NextFunction) => {
  upload.single('imagen')(req, res, (err: unknown) => {
    const multerError = err as (Error & { code?: string })
    if (err) {
      if (multerError.code === 'LIMIT_FILE_SIZE') {
        res.status(400).json({ message: 'La imagen es demasiado grande. Máximo 5MB' })
        return
      }
      res.status(400).json({ message: multerError.message })
      return
    }
    next()
  })
}, async (req: Request, res: Response) => {
  if (!req.file) {
    res.status(400).json({ message: 'No se ha subido ninguna imagen' })
    return
  }

  try {
    const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: process.env.CLOUDINARY_FOLDER || 'petrigastro/platos',
          resource_type: 'image'
        },
        (error: unknown, result: unknown) => {
          if (error) reject(error)
          else resolve(result as { secure_url: string })
        }
      )
      uploadStream.end(req.file!.buffer)
    })

    res.json({ url: result.secure_url })
  } catch (error) {
    console.error('Error subiendo a Cloudinary:', error)
    res.status(500).json({ message: 'Error al subir la imagen' })
  }
})

export = router
