import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Loader2 } from 'lucide-react'
import { Helmet } from 'react-helmet-async'
import { useQuery } from '@tanstack/react-query'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import MenuCard from '../components/MenuCard'
import { platosApi } from '../services/api'
import ScrollVideo from '../components/ScrollVideo'
import HeroSection from '../components/HeroSection'
import ProcesoSection from '../components/ProcesoSection'
import TestimonialsSection from '../components/TestimonialsSection'
import GallerySection from '../components/GallerySection'

const statsData = {
  chef: {
    name: 'Chef Petri',
    stats: [
      { icon: 'utensils', value: '+200', name: 'Platos creados' },
      { icon: 'award', value: '3', name: 'Premios' },
      { icon: 'heart', value: '100%', name: 'Vocación' }
    ]
  }
}

export default function Home() {
  const navigate = useNavigate()
  const [scrollProgress, setScrollProgress] = useState(0)
  const { cart } = useCart()
  const { user, logout } = useAuth()

  const { data: destacados = [], isLoading: loadingDestacados } = useQuery({
    queryKey: ['platos', 'destacados'],
    queryFn: () => platosApi.getAll({ destacado: true })
  })

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const progress = (scrollTop / docHeight) * 100
      setScrollProgress(progress)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      <Helmet>
        <title>PetriGastro | Sabores que Cuentan Historias - Comida Artesanal Madrid</title>
        <meta name="description" content="PetriGastro - Comida artesanal para llevar en Madrid. Platos tradicionales con un toque moderno." />
        <meta name="keywords" content="comida para llevar Madrid, chef a domicilio, restaurante para llevar, comida gourmet" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Restaurant",
            "name": "PetriGastro",
            "description": "Comida artesanal para llevar. Platos tradicionales, bocadillos gourmet y especialidades del chef.",
            "telephone": "+34600123456",
            "address": {
              "@type": "PostalAddress",
              "streetAddress": "Calle Gourmet, 123",
              "addressLocality": "Madrid",
              "postalCode": "28001",
              "addressCountry": "ES"
            },
            "openingHoursSpecification": [
              {
                "@type": "OpeningHoursSpecification",
                "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
                "opens": "12:00",
                "closes": "22:00"
              }
            ],
            "servesCuisine": ["Spanish", "Mediterranean", "Traditional"],
            "priceRange": "€€"
          })}
        </script>
      </Helmet>

      <ScrollVideo />

      <div className="relative z-10 bg-bg">

        <div id="inicio" style={{ scrollMarginTop: '80px' }}>
          <HeroSection scrollProgress={scrollProgress} />
        </div>

        <div id="proceso" style={{ scrollMarginTop: '80px' }}>
          <ProcesoSection />
        </div>

        <section id="menu" className="py-16 md:py-20 px-4 bg-bg">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <span className="inline-block px-4 py-2 rounded-full text-sm font-medium uppercase tracking-wider mb-4 bg-surface text-carbon">Carta</span>
              <h2 className="text-3xl md:text-4xl font-bold font-heading text-carbon">Platos Destacados</h2>
              <p className="text-text-muted mt-4 max-w-2xl mx-auto">Selección de nuestras mejores creaciones, hechas con alma</p>
            </div>
            {loadingDestacados ? (
              <div className="flex items-center justify-center py-12" role="status" aria-live="polite">
                <Loader2 className="animate-spin text-accent" size={40} />
                <span className="sr-only">Cargando platos destacados...</span>
              </div>
            ) : destacados.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                {destacados.map(plato => (
                  <MenuCard key={plato.id} plato={plato} />
                ))}
              </div>
            ) : (
              <p className="text-center text-text-muted mb-12">No hay platos destacados disponibles.</p>
            )}
            <div className="text-center">
              <Link to="/menu" className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 rounded-full font-semibold bg-accent text-carbon transition hover:opacity-90 hover:scale-105 text-sm sm:text-base">
                <span>Ver Menú Completo</span>
                <ArrowRight size={20} />
              </Link>
            </div>
          </div>
        </section>

        <section id="chef" className="py-16 md:py-20 px-4 bg-bg-secondary">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=600&h=750&fit=crop"
                  alt="Chef Petri"
                  className="rounded-3xl shadow-2xl"
                  loading="lazy"
                />
                <div className="absolute bottom-6 left-6 bg-surface rounded-xl px-4 py-3 shadow-lg">
                  <div className="text-2xl font-bold text-carbon">15+</div>
                  <div className="text-sm text-text-muted">Años de experiencia</div>
                </div>
              </div>

              <div className="space-y-6">
                <span className="inline-block px-4 py-2 rounded-full text-sm font-medium uppercase tracking-wider bg-surface text-carbon">El Artista</span>
                <h2 className="text-3xl md:text-4xl font-bold font-heading text-carbon">Pasión que se hereda<br className="hidden sm:block"/>de generaciones</h2>
                <p className="text-2xl italic font-accent text-carbon">Chef Petri</p>
                <p className="text-text-muted leading-relaxed">
                  Desde los fogones de casa hasta las cocinas más exigentes, cada plato lleva consigo una historia familiar.
                </p>
                <p className="text-text-muted leading-relaxed">
                  En PetriGastro combino la tradición culinaria española con técnicas modernas.
                </p>

                <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-4">
                  {statsData.chef.stats.map((stat, i) => (
                    <div key={i} className="text-center p-4 rounded-xl bg-bg-secondary">
                      <div className="text-2xl font-bold mb-1 text-carbon">{stat.value}</div>
                      <div className="text-xs text-text-muted">{stat.name}</div>
                    </div>
                  ))}
                </div>

                <div className="pt-4">
                  <svg viewBox="0 0 200 60" className="h-12 w-auto opacity-60">
                    <path d="M10 45 Q30 15 50 40 T90 30 Q110 20 130 40 T170 25 Q190 15 190 35" fill="none" stroke="var(--color-accent)" strokeWidth="2" />
                  </svg>
                  <span className="text-lg italic text-carbon">Chef Petri</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div id="testimonios" style={{ scrollMarginTop: '80px' }}>
          <TestimonialsSection />
        </div>

        <GallerySection />

      </div>

    </>
  )
}
