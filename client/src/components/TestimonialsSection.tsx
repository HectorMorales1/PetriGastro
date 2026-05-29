import { useState, useEffect, useMemo } from 'react'
import { Star, ChevronLeft, ChevronRight } from 'lucide-react'

const testimonialsData = [
  { id: 1, rating: 5, text: 'Los mejores bocadillos que he probado. Se nota que cada ingrediente está elegido con cuidado. El jamón ibérico es exquisito.', author: 'María González', role: 'Cliente habitual', avatar: 'https://randomuser.me/api/portraits/women/44.jpg' },
  { id: 2, rating: 5, text: 'Pedí la degustación del chef para una cena especial. Una experiencia increíble. Cada plato era una obra de arte.', author: 'Carlos Ruiz', role: 'Food blogger', avatar: 'https://randomuser.me/api/portraits/men/32.jpg' },
  { id: 3, rating: 5, text: 'El servicio de entrega es rapidísimo y la comida llega en perfecto estado. Siempre pido para eventos de empresa.', author: 'Laura Martínez', role: 'Directora de empresa', avatar: 'https://randomuser.me/api/portraits/women/68.jpg' },
  { id: 4, rating: 5, text: 'La paella es simplemente spectacular. Sabe a la de mi abuela. Es la mejor que he probado en Madrid.', author: 'Antonio García', role: 'Chef aficionado', avatar: 'https://randomuser.me/api/portraits/men/67.jpg' },
  { id: 5, rating: 4, text: 'Los churros con chocolate son auténticos. Perfecto para un domingo en familia.', author: 'Sofia López', role: 'Cliente frecuente', avatar: 'https://randomuser.me/api/portraits/women/33.jpg' },
]

const getCardsPerView = () => {
  if (window.innerWidth >= 1024) return 3
  if (window.innerWidth >= 768) return 2
  return 1
}

export default function TestimonialsSection() {
  const [cardsPerView, setCardsPerView] = useState(() => (typeof window !== 'undefined' ? getCardsPerView() : 3))
  const [carouselPaused, setCarouselPaused] = useState(false)

  const testimonialPages = useMemo(() => {
    const pages = []
    for (let i = 0; i < testimonialsData.length; i += cardsPerView) {
      pages.push(testimonialsData.slice(i, i + cardsPerView))
    }
    return pages
  }, [cardsPerView])

  const maxIndex = Math.max(testimonialPages.length - 1, 0)
  const [rawSlide, setRawSlide] = useState(0)
  const currentSlide = Math.min(rawSlide, maxIndex)

  useEffect(() => {
    const handleResize = () => {
      setCardsPerView(getCardsPerView())
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    if (carouselPaused) return
    const interval = setInterval(() => {
      setRawSlide(prev => (prev >= testimonialPages.length - 1 ? 0 : prev + 1))
    }, 5000)
    return () => clearInterval(interval)
  }, [testimonialPages.length, carouselPaused])

  const prevSlide = () => {
    setRawSlide(prev => (prev <= 0 ? testimonialPages.length - 1 : prev - 1))
  }

  const nextSlide = () => {
    setRawSlide(prev => (prev >= testimonialPages.length - 1 ? 0 : prev + 1))
  }

  return (
    <section id="testimonios" className="py-16 md:py-20 px-4 bg-bg">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12 md:mb-16">
          <span className="inline-block px-4 py-2 rounded-full text-sm font-medium uppercase tracking-wider mb-4 bg-surface text-carbon">Testimonios</span>
          <h2 className="text-3xl md:text-4xl font-bold font-heading text-carbon">Lo que dicen<br/>nuestros clientes</h2>
        </div>

        <div
          className="relative overflow-hidden"
          aria-roledescription="carousel"
          aria-label="Testimonios de clientes"
          onMouseEnter={() => setCarouselPaused(true)}
          onMouseLeave={() => setCarouselPaused(false)}
          onFocus={() => setCarouselPaused(true)}
          onBlur={() => setCarouselPaused(false)}
        >
          <div
            className="flex transition-transform duration-500 ease-out"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            aria-live="polite"
          >
            {testimonialPages.map((page, pageIndex) => (
              <div key={pageIndex} className="w-full flex-shrink-0 px-2">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {page.map((t) => (
                    <article key={t.id} className="bg-surface rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 h-full">
                      <div className="flex gap-1 mb-4">
                        {[...Array(5)].map((_, j) => (
                          <Star
                            key={j}
                            size={16}
                            className={j < t.rating ? 'text-oro fill-oro' : 'text-text-muted'}
                          />
                        ))}
                      </div>
                      <div className="text-accent/30 text-4xl leading-none font-heading">"</div>
                      <p className="text-text leading-relaxed italic mb-5 -mt-3">{t.text}</p>
                      <div className="flex items-center gap-3 mt-auto">
                        <img src={t.avatar} alt={t.author} className="w-12 h-12 rounded-full object-cover border-2 border-bg-secondary" />
                        <div>
                          <div className="font-semibold text-carbon">{t.author}</div>
                          <div className="text-sm text-text-muted">{t.role}</div>
                        </div>
                      </div>
                    </article>
                  ))}
                  {page.length < cardsPerView && [...Array(cardsPerView - page.length)].map((_, i) => (
                    <div key={`empty-${i}`} className="hidden md:block" />
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center gap-4 mt-8">
            <button
              onClick={prevSlide}
              className="w-12 h-12 flex items-center justify-center rounded-full bg-surface shadow-md text-carbon hover:bg-accent hover:text-white transition"
              aria-label="Testimonio anterior"
            >
              <ChevronLeft size={20} />
            </button>

            <div className="flex justify-center gap-2">
              {testimonialPages.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setRawSlide(i)}
                  className={`h-2.5 rounded-full transition-all ${i === currentSlide ? 'w-8 bg-accent' : 'w-2.5 bg-text-muted'}`}
                  aria-label={`Ir a testimonio ${i + 1}`}
                />
              ))}
            </div>

            <button
              onClick={nextSlide}
              className="w-12 h-12 flex items-center justify-center rounded-full bg-surface shadow-md text-carbon hover:bg-accent hover:text-white transition"
              aria-label="Siguiente testimonio"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
