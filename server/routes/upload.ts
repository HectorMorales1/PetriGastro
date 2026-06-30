import express, { Request, Response, NextFunction } from 'express'
import multer, { FileFilterCallback } from 'multer'
import cloudinary from '../config/cloudinary'
import logger from '../config/logger'
import { authMiddleware, adminMiddleware } from '../middleware/auth'

const router = express.Router()

const ALLOWED_MIMES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']

const IMAGE_MAGIC_BYTES: Record<string, Uint8Array[]> = {
  'image/jpeg': [new Uint8Array([0xFF, 0xD8, 0xFF])],
  'image/png': [new Uint8Array([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A])],
  'image/gif': [new Uint8Array([0x47, 0x49, 0x46, 0x38])],
  'image/webp': [new Uint8Array([0x52, 0x49, 0x46, 0x46])]
}

function validateMagicBytes(buffer: Buffer, mimetype: string): boolean {
  const signatures = IMAGE_MAGIC_BYTES[mimetype]
  if (!signatures) return false
  return signatures.some(sig => {
    if (buffer.length < sig.length) return false
    return sig.every((byte, i) => buffer[i] === byte)
  })
}

const fileFilter = (_req: Request, file: Express.Multer.File, cb: FileFilterCallback): void => {
  if (ALLOWED_MIMES.includes(file.mimetype)) {
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
      const messages: Record<string, string> = {
        LIMIT_FILE_SIZE: 'La imagen es demasiado grande. Máximo 5MB',
        LIMIT_FILE_COUNT: 'Demasiados archivos',
        LIMIT_UNEXPECTED_FILE: 'Tipo de archivo no esperado'
      }
      res.status(400).json({ message: messages[multerError.code || ''] || 'Error al subir el archivo' })
      return
    }
    next()
  })
}, async (req: Request, res: Response) => {
  if (!req.file) {
    res.status(400).json({ message: 'No se ha subido ninguna imagen' })
    return
  }

  if (!validateMagicBytes(req.file.buffer, req.file.mimetype)) {
    res.status(400).json({ message: 'El archivo no es una imagen válida' })
    return
  }

  try {
    const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: process.env.CLOUDINARY_FOLDER || 'petrigastro/platos',
          resource_type: 'image',
          transformation: [
            { width: 800, height: 600, crop: 'fill', quality: 'auto' },
            { fetch_format: 'auto' }
          ]
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
    logger.error({ err: error, context: 'upload' }, 'Error subiendo a Cloudinary')
    res.status(500).json({ message: 'Error al subir la imagen' })
  }
})

export default router
