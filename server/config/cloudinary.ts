import cloudinary from 'cloudinary'
import logger from './logger'

const cloudinaryV2 = cloudinary.v2

if (process.env.CLOUDINARY_URL) {
  cloudinaryV2.config()
} else {
  cloudinaryV2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  })
}

if (!process.env.CLOUDINARY_URL && !process.env.CLOUDINARY_CLOUD_NAME) {
  logger.warn('⚠️  Cloudinary no configurado. La subida de imágenes no funcionará.')
}

export default cloudinaryV2
