import { useState, useEffect, useMemo } from 'react'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'

const galleryImages = [
  'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=300&h=300&fit=crop',
  'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=300&h=300&fit=crop',
  'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=300&h=300&fit=crop'
]

export default function GallerySection() {
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)

  const galleryLoopImages = useMemo(() => [...galleryImages, ...galleryImages], [])

  const openLightbox = (index: number) => {
    setLightboxIndex(index)
    setLightboxOpen(true)
  }

  const closeLightbox = () => setLightboxOpen(false)

  const prevLightbox = () => setLightboxIndex(prev => (prev === 0 ? galleryImages.length - 1 : prev - 1))
  const nextLightbox = () => setLightboxIndex(prev => (prev === galleryImages.length - 1 ? 0 : prev + 1))

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!lightboxOpen) return
      if (e.key === 'Escape') closeLightbox()
      if (e.key === 'ArrowLeft') prevLightbox()
      if (e.key === 'ArrowRight') nextLightbox()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [lightboxOpen])

  return (
    <>
      <section className="py-8 md:py-12 px-4 overflow-hidden bg-bg">
        <div className="max-w-7xl mx-auto overflow-hidden">
          <div className="gallery-marquee flex gap-4 w-max">
            {galleryLoopImages.map((img, i) => (
              <div
                key={`${img}-${i}`}
                className="flex-shrink-0 w-28 sm:w-36 md:w-48 h-28 sm:h-36 md:h-48 rounded-xl overflow-hidden cursor-pointer"
                onClick={() => openLightbox(i % galleryImages.length)}
              >
                <img src={img} alt={`Plato gourmet ${(i % galleryImages.length) + 1}`} className="w-full h-full object-cover hover:scale-110 transition-transform" loading="lazy" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
          onClick={closeLightbox}
        >
          <button
            className="absolute top-4 right-4 p-2 text-white hover:bg-white/20 rounded-full"
            onClick={closeLightbox}
            aria-label="Cerrar galería"
          >
            <X size={24} />
          </button>

          <button
            className="absolute left-4 p-3 text-white hover:bg-white/20 rounded-full"
            onClick={(e) => { e.stopPropagation(); prevLightbox() }}
            aria-label="Imagen anterior"
          >
            <ChevronLeft size={32} />
          </button>

          <img
            src={galleryImages[lightboxIndex].replace('w=300&h=300', 'w=1200&h=800')}
            alt={`Plato gourmet ${lightboxIndex + 1}`}
            className="max-h-[80vh] max-w-[90vw] rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />

          <button
            className="absolute right-4 p-3 text-white hover:bg-white/20 rounded-full"
            onClick={(e) => { e.stopPropagation(); nextLightbox() }}
            aria-label="Siguiente imagen"
          >
            <ChevronRight size={32} />
          </button>
        </div>
      )}
    </>
  )
}
