import { useState, useEffect, useRef, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Leaf, Flame, Utensils, CalendarCheck, ChefHat, Smile, Star, X, ChevronLeft, ChevronRight, ShoppingBag, User, LogOut, Loader2 } from 'lucide-react'
import { Helmet } from 'react-helmet-async'
import { useQuery } from '@tanstack/react-query'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import MenuCard from '../components/MenuCard'
import { platosApi } from '../services/api'

const TOTAL_FRAMES = 40  // 1 de cada 3 frames (de 120 originales)

function ScrollVideo() {
  const sectionRef = useRef(null)
  const [loaded, setLoaded] = useState(false)
  const [currentFrame, setCurrentFrame] = useState(0)
  const [progress, setProgress] = useState(0)
  const lastFrameRef = useRef(-1)

  useEffect(() => {
    let loadedCount = 0
    const images = []

    for (let i = 0; i < TOTAL_FRAMES; i++) {
      const img = new Image()
      const frameNum = (i * 3).toString().padStart(3, '0')  // 0, 3, 6, 9... (1 de cada 3)
      img.src = `/Fotogramas/frame_${frameNum}.jpg`
      
      img.onload = () => {
        loadedCount++
        if (loadedCount >= 20) setLoaded(true)
      }
      
      img.onerror = () => {
        loadedCount++
        if (loadedCount >= 20) setLoaded(true)
      }
      
      images.push(img)
    }

    const preloadImages = setInterval(() => {
      if (images.filter(img => img.complete).length >= 20) {
        setLoaded(true)
        clearInterval(preloadImages)
      }
    }, 100)

    return () => clearInterval(preloadImages)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return
      const rect = sectionRef.current.getBoundingClientRect()
      const sectionHeight = sectionRef.current.offsetHeight
      const viewportHeight = window.innerHeight
      const calcProgress = Math.max(0, Math.min(1, (viewportHeight - rect.top) / (sectionHeight + viewportHeight)))
      // Animar los primeros 25 frames, luego mantener el último frame los últimos 25%
      const animatedFrames = 25
      // Cuando progress > 0.75, mantener el último frame (pausa al final)
      const pausedProgress = Math.min(calcProgress / 0.75, 1)
      let frameIndex = Math.round(pausedProgress * animatedFrames)
      // Si ya llegamos al frame 25, mostrar el último frame
      if (calcProgress > 0.75) {
        frameIndex = TOTAL_FRAMES - 1
      }

      if (frameIndex !== lastFrameRef.current) {
        setCurrentFrame(frameIndex)
        lastFrameRef.current = frameIndex
      }
      setProgress(calcProgress)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <section ref={sectionRef} className="relative" style={{ height: '400vh' }}>
      <div className="sticky top-0 h-screen overflow-hidden bg-black">
        <img 
          src={`/Fotogramas/frame_${(currentFrame * 3).toString().padStart(3, '0')}.jpg`}
          alt=""
          className="w-full h-full object-cover"
          key={currentFrame}
        />
        
        {!loaded && (
            <div className="bg-accent absolute inset-0 flex items-center justify-center">
            <div className="text-white text-center">
              <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4" />
              <p>Cargando animación...</p>
            </div>
          </div>
        )}

        <div 
          className={`absolute inset-0 flex items-center justify-center transition-all duration-700 ${
            progress > 0.7 ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          }`}
        >
          <div className="text-center text-white">
            <h2 className="text-4xl md:text-6xl font-bold font-heading mb-4" style={{ textShadow: '0 2px 20px rgba(0,0,0,0.5)' }}>
              La magia de la cocina
            </h2>
            <p className="text-xl md:text-2xl" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
              Cada plato cuenta una historia
            </p>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/60 rounded-full flex justify-center pt-2">
            <div className="w-1 h-2 bg-white/60 rounded-full" />
          </div>
        </div>
      </div>
    </section>
  )
}

const testimonialsData = [
  { id: 1, rating: 5, text: 'Los mejores bocadillos que he probado. Se nota que cada ingrediente está elegido con cuidado. El jamón ibérico es exquisito.', author: 'María González', role: 'Cliente habitual', avatar: 'https://randomuser.me/api/portraits/women/44.jpg' },
  { id: 2, rating: 5, text: 'Pedí la degustación del chef para una cena especial. Una experiencia increíble. Cada plato era una obra de arte.', author: 'Carlos Ruiz', role: 'Food blogger', avatar: 'https://randomuser.me/api/portraits/men/32.jpg' },
  { id: 3, rating: 5, text: 'El servicio de entrega es rapidísimo y la comida llega en perfecto estado. Siempre pido para eventos de empresa.', author: 'Laura Martínez', role: 'Directora de empresa', avatar: 'https://randomuser.me/api/portraits/women/68.jpg' },
  { id: 4, rating: 5, text: 'La paella es simplemente spectacular. Sabe a la de mi abuela. Es la mejor que he probado en Madrid.', author: 'Antonio García', role: 'Chef aficionado', avatar: 'https://randomuser.me/api/portraits/men/67.jpg' },
  { id: 5, rating: 4, text: 'Los churros con chocolate son auténticos. Perfecto para un domingo en familia.', author: 'Sofia López', role: 'Cliente frecuente', avatar: 'https://randomuser.me/api/portraits/women/33.jpg' },
]

const statsData = {
  hero: { stats: [
    { number: '500+', label: 'Pedidos' },
    { number: '4.9', label: 'Valoración' },
    { number: '15+', label: 'Años exp.' }
  ]},
  chef: {
    name: 'Chef Petri',
    stats: [
      { icon: 'utensils', value: '+200', name: 'Platos creados' },
      { icon: 'award', value: '3', name: 'Premios' },
      { icon: 'heart', value: '100%', name: 'Vocación' }
    ]
  }
}

const galleryImages = [
  'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=300&h=300&fit=crop',
  'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=300&h=300&fit=crop',
  'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=300&h=300&fit=crop'
]

const getCardsPerView = () => {
  if (window.innerWidth >= 1024) return 3
  if (window.innerWidth >= 768) return 2
  return 1
}

function LoginModal({ isOpen, onClose, onLoginSuccess }) {
  const [isRegisterMode, setIsRegisterMode] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [regName, setRegName] = useState('')
  const [regLastName, setRegLastName] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [regConfirmPassword, setRegConfirmPassword] = useState('')
  const [emailError, setEmailError] = useState(false)
  const [passError, setPassError] = useState(false)
  const [error, setError] = useState('')
  const [registerSuccess, setRegisterSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const { login, register } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setEmailError(false)
    setPassError(false)
    setError('')

    if (!email) setEmailError(true)
    if (!password) setPassError(true)

    if (email && password) {
      setLoading(true)
      const result = await login(email, password)
      setLoading(false)
      if (result.success) {
        onLoginSuccess()
      } else {
        setError(result.error || 'Credenciales inválidas')
      }
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setError('')
    
    if (regPassword !== regConfirmPassword) {
      setError('Las contraseñas no coinciden')
      return
    }
    if (regPassword.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres')
      return
    }

    setLoading(true)
    const result = await register(regName, regLastName, regEmail, regPassword)
    setLoading(false)
    
    if (result.success) {
      setRegisterSuccess(true)
      setTimeout(() => {
        setIsRegisterMode(false)
        setRegisterSuccess(false)
        setEmail(regEmail)
        setPassword('')
      }, 2000)
    } else {
      setError(result.error || 'Error al registrarse')
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)' }}>
      <div className="w-full max-w-md rounded-xl shadow-2xl overflow-hidden bg-surface">
        <div className="p-8 text-center bg-accent">
          <svg className="w-16 h-16 mx-auto mb-4" viewBox="0 0 100 100" fill="none">
            <circle cx="50" cy="50" r="45" className="fill-carbon"/>
            <path d="M30 50 Q50 30 70 50 Q50 70 30 50" className="fill-accent"/>
          </svg>
          <h2 className="text-2xl font-bold text-white mb-2">PetriGastro</h2>
          <p className="text-white/80 text-sm">Acceso {isRegisterMode ? 'Restringido' : 'al sistema'}</p>
        </div>

        <div className="p-8">
          {!isRegisterMode ? (
            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2 text-carbon">Correo electrónico</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full px-4 py-3 rounded-lg border-2 ${emailError ? 'border-red-500' : 'border-border'} focus:border-accent focus:ring-4 focus:ring-accent/15 outline-none transition-all bg-bg-secondary`}
                  placeholder="tu@correo.com"
                />
                {emailError && <p className="text-red-500 text-xs mt-2">Email requerido</p>}
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2 text-carbon">Contraseña</label>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full px-4 py-3 rounded-lg border-2 ${passError ? 'border-red-500' : 'border-border'} focus:border-accent focus:ring-4 focus:ring-accent/15 outline-none transition-all bg-bg-secondary`}
                  placeholder="Ingresa tu contraseña"
                />
                {passError && <p className="text-red-500 text-xs mt-2">Contraseña requerida</p>}
              </div>
              
              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-4 rounded-lg font-semibold text-white flex items-center justify-center gap-2 transition hover:opacity-90 bg-accent">
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Acceder</span>
                    <ArrowRight size={20} />
                  </>
                )}
              </button>

              <div className="mt-6 pt-6 border-t border-border text-center">
                <button 
                  type="button"
                  onClick={() => setIsRegisterMode(true)}
                  className="text-accent font-medium hover:underline"
                >
                  Solicitar acceso
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleRegister}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2 text-carbon">Nombre</label>
                <input 
                  type="text" 
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border-2 border-border focus:border-accent focus:ring-4 focus:ring-accent/15 outline-none transition-all bg-bg-secondary"
                  placeholder="Tu nombre"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2 text-carbon">Apellidos</label>
                <input 
                  type="text" 
                  value={regLastName}
                  onChange={(e) => setRegLastName(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border-2 border-border focus:border-accent focus:ring-4 focus:ring-accent/15 outline-none transition-all bg-bg-secondary"
                  placeholder="Tus apellidos"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2 text-carbon">Correo electrónico</label>
                <input 
                  type="email" 
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border-2 border-border focus:border-accent focus:ring-4 focus:ring-accent/15 outline-none transition-all bg-bg-secondary"
                  placeholder="tu@correo.com"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2 text-carbon">Contraseña</label>
                <input 
                  type="password" 
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border-2 border-border focus:border-accent focus:ring-4 focus:ring-accent/15 outline-none transition-all bg-bg-secondary"
                  placeholder="Mínimo 8 caracteres"
                  minLength={8}
                  required
                />
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2 text-carbon">Confirmar contraseña</label>
                <input 
                  type="password" 
                  value={regConfirmPassword}
                  onChange={(e) => setRegConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border-2 border-border focus:border-accent focus:ring-4 focus:ring-accent/15 outline-none transition-all bg-bg-secondary"
                  placeholder="Repite la contraseña"
                  required
                />
              </div>

              {error && (
                <div className="mb-4 p-3 rounded-lg bg-error/10 text-error text-sm">
                  {error}
                </div>
              )}
              
              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-4 rounded-lg font-semibold text-white transition hover:opacity-90 bg-accent">
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
                ) : (
                  'Crear cuenta'
                )}
              </button>

              {registerSuccess && (
                <div className="mt-4 p-4 rounded-lg text-white text-center bg-success">
                  ¡Cuenta creada exitosamente! Ya puedes iniciar sesión.
                </div>
              )}

              <div className="mt-6 pt-6 border-t border-border text-center">
                <button 
                  type="button"
                  onClick={() => { setIsRegisterMode(false); setRegisterSuccess(false) }}
                  className="text-accent font-medium hover:underline"
                >
                  Volver al login
                </button>
              </div>
            </form>
          )}
        </div>

        <button 
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full text-white/80 hover:text-white hover:bg-white/20 transition"
        >
          <X size={24} />
        </button>
      </div>
    </div>
  )
}

export default function Home() {
  const [scrollProgress, setScrollProgress] = useState(0)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [cardsPerView, setCardsPerView] = useState(() => (typeof window !== 'undefined' ? getCardsPerView() : 3))
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const [loginOpen, setLoginOpen] = useState(false)
  const { cart } = useCart()
  const { user, logout } = useAuth()

  const testimonialPages = useMemo(() => {
    const pages = []
    for (let i = 0; i < testimonialsData.length; i += cardsPerView) {
      pages.push(testimonialsData.slice(i, i + cardsPerView))
    }
    return pages
  }, [cardsPerView])

  const galleryLoopImages = useMemo(() => [...galleryImages, ...galleryImages], [])

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

  useEffect(() => {
    const handleResize = () => {
      setCardsPerView(getCardsPerView())
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    setCurrentSlide(prev => Math.min(prev, Math.max(testimonialPages.length - 1, 0)))
  }, [testimonialPages.length])

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev >= testimonialPages.length - 1 ? 0 : prev + 1))
    }, 5000)
    return () => clearInterval(interval)
  }, [testimonialPages.length])

  const prevSlide = () => {
    setCurrentSlide(prev => (prev <= 0 ? testimonialPages.length - 1 : prev - 1))
  }

  const nextSlide = () => {
    setCurrentSlide(prev => (prev >= testimonialPages.length - 1 ? 0 : prev + 1))
  }

  const openLightbox = (index) => {
    setLightboxIndex(index)
    setLightboxOpen(true)
  }

  const closeLightbox = () => setLightboxOpen(false)

  const prevLightbox = () => setLightboxIndex(prev => (prev === 0 ? galleryImages.length - 1 : prev - 1))
  const nextLightbox = () => setLightboxIndex(prev => (prev === galleryImages.length - 1 ? 0 : prev + 1))

  useEffect(() => {
    const handleKeyDown = (e) => {
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

      {/* Scroll Progress */}
      <div className="fixed top-0 left-0 w-full h-1 bg-accent/30 z-[100]">
        <div 
          className="h-full bg-accent transition-all duration-150" 
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Scroll Video - Sticky: ocupa 400vh para que el contenido siguiente deslice desde abajo */}
      <ScrollVideo />

      {/* Main Content - desliza desde abajo al scrollear pasada la animación */}
      <div className="relative z-10 bg-bg">
        
        {/* Hero Section */}
        <section id="inicio" className="relative min-h-screen flex items-center pt-16 overflow-hidden" style={{ background: 'linear-gradient(135deg, var(--color-bg) 0%, var(--color-bg-secondary) 100%)' }}>
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-20 -left-20 w-96 h-96 rounded-full opacity-30" style={{ background: 'radial-gradient(circle, var(--color-accent) 0%, transparent 70%)' }} />
            <div className="absolute bottom-20 -right-20 w-80 h-80 rounded-full opacity-20" style={{ background: 'radial-gradient(circle, var(--color-success) 0%, transparent 70%)' }} />
          </div>

          <div className="max-w-7xl mx-auto px-4 py-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
            <div className="space-y-8">
              <span className="inline-flex items-center gap-2 text-sm font-medium uppercase tracking-wider text-accent">
                <span className="w-2 h-2 rounded-full bg-accent"></span>
                Cocina Artesanal · Madrid
              </span>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold font-heading leading-tight text-carbon">
                Sabores que<br />
                <em className="font-normal text-accent">cuentan historias</em>
              </h1>
              <p className="text-xl text-text-muted max-w-lg">
                Platos preparados con pasión, ingredientes de temporada y el toque inconfundible de Chef Petri.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/menu" className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold bg-accent text-white transition hover:opacity-90 hover:scale-105">
                  <span>Descubre el Menú</span>
                  <ArrowRight size={18} />
                </Link>
                <a href="#proceso" className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold border-2 border-carbon text-carbon transition hover:bg-carbon/10">
                  Cómo Funciona
                </a>
              </div>
              <div className="flex gap-8 pt-4">
                {statsData.hero.stats.map((stat, i) => (
                  <div key={i} className="text-center">
                    <div className="text-2xl font-bold text-accent">{stat.number}</div>
                    <div className="text-sm text-text-muted">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&h=600&fit=crop"
                  alt="Plato gourmet de cocina artesanal"
                  className="w-full h-[500px] object-cover"
                  loading="eager"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-surface rounded-2xl p-4 shadow-xl flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-verde-oliva flex items-center justify-center">
                  <Leaf className="text-white" size={20} />
                </div>
                <div>
                  <div className="font-bold text-carbon">100%</div>
                  <div className="text-sm text-text-muted">Ingredientes Frescos</div>
                </div>
              </div>
              <div className="absolute -top-4 -right-4 bg-surface rounded-2xl p-4 shadow-xl flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center">
                  <Flame className="text-white" size={20} />
                </div>
                <div>
                  <div className="font-bold text-carbon">Fuego</div>
                  <div className="text-sm text-text-muted">de leña</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Proceso Section */}
        <section id="proceso" className="py-20 px-4 bg-bg-secondary">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <span className="inline-block px-4 py-2 rounded-full text-sm font-medium uppercase tracking-wider mb-4 bg-surface text-accent">Experiencia</span>
              <h2 className="text-4xl font-bold font-heading text-carbon">Del fuego a tu mesa</h2>
              <p className="text-text-muted mt-4 max-w-2xl mx-auto">Un proceso artesanal pensado para que disfrutes sin complicaciones</p>
            </div>

            <div className="relative">
              <div className="absolute top-1/2 left-0 right-0 h-1 -translate-y-1/2 hidden md:block" style={{ background: 'linear-gradient(90deg, transparent, var(--color-accent), transparent)' }} />
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                {[
                  { num: '01', icon: Utensils, title: 'Elige', desc: 'Navega por nuestro menú y selecciona los platos que más te apetecen.' },
                  { num: '02', icon: CalendarCheck, title: 'Reserva', desc: 'Confirma tu pedido y elige el horario de recogida o entrega.' },
                  { num: '03', icon: Flame, title: 'Preparamos', desc: 'Cada plato se cocina al momento con ingredientes frescos.' },
                  { num: '04', icon: Smile, title: 'Disfrutas', desc: 'Recoge tu pedido o recíbelo en casa. Saborea la diferencia.' }
                ].map((step, i) => (
                  <div key={i} className="relative bg-bg rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-white/5">
                    <div className="absolute -top-3 left-6 w-10 h-10 rounded-full bg-accent flex items-center justify-center text-white font-bold">
                      {step.num}
                    </div>
                    <div className="w-14 h-14 rounded-full bg-bg-secondary flex items-center justify-center mt-4 mb-4">
                      <step.icon className="text-accent" size={28} />
                    </div>
                    <h3 className="text-xl font-semibold mb-2 text-carbon">{step.title}</h3>
                    <p className="text-text-muted text-sm">{step.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Menu Section */}
        <section id="menu" className="py-20 px-4 bg-bg">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <span className="inline-block px-4 py-2 rounded-full text-sm font-medium uppercase tracking-wider mb-4 bg-surface text-accent">Carta</span>
              <h2 className="text-4xl font-bold font-heading text-carbon">Platos Destacados</h2>
              <p className="text-text-muted mt-4 max-w-2xl mx-auto">Selección de nuestras mejores creaciones, hechas con alma</p>
            </div>
            {loadingDestacados ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="animate-spin text-accent" size={40} />
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
              <Link to="/menu" className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-semibold bg-accent text-white transition hover:opacity-90 hover:scale-105">
                <span>Ver Menú Completo</span>
                <ArrowRight size={20} />
              </Link>
            </div>
          </div>
        </section>

        {/* Chef Section */}
        <section id="chef" className="py-20 px-4 bg-bg-secondary">
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
                  <div className="text-2xl font-bold text-accent">15+</div>
                  <div className="text-sm text-text-muted">Años de experiencia</div>
                </div>
              </div>

              <div className="space-y-6">
                <span className="inline-block px-4 py-2 rounded-full text-sm font-medium uppercase tracking-wider bg-surface text-accent">El Artista</span>
                <h2 className="text-4xl font-bold font-heading text-carbon">Pasión que se hereda<br/>de generaciones</h2>
                <p className="text-2xl italic font-accent text-accent">Chef Petri</p>
                <p className="text-text-muted leading-relaxed">
                  Desde los fogones de casa hasta las cocinas más exigentes, cada plato lleva consigo una historia familiar.
                </p>
                <p className="text-text-muted leading-relaxed">
                  En PetriGastro combino la tradición culinaria española con técnicas modernas.
                </p>

                <div className="grid grid-cols-3 gap-4 pt-4">
                  {statsData.chef.stats.map((stat, i) => (
                    <div key={i} className="text-center p-4 rounded-xl bg-bg-secondary">
                      <div className="text-2xl font-bold mb-1 text-accent">{stat.value}</div>
                      <div className="text-xs text-text-muted">{stat.name}</div>
                    </div>
                  ))}
                </div>

                <div className="pt-4">
                  <svg viewBox="0 0 200 60" className="h-12 w-auto opacity-60">
                    <path d="M10 45 Q30 15 50 40 T90 30 Q110 20 130 40 T170 25 Q190 15 190 35" fill="none" stroke="var(--color-accent)" strokeWidth="2" />
                  </svg>
                  <span className="text-lg italic text-accent">Chef Petri</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonios" className="py-20 px-4 bg-bg">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <span className="inline-block px-4 py-2 rounded-full text-sm font-medium uppercase tracking-wider mb-4 bg-surface text-accent">Testimonios</span>
              <h2 className="text-4xl font-bold font-heading text-carbon">Lo que dicen<br/>nuestros clientes</h2>
            </div>

            <div className="relative overflow-hidden">
              <div 
                className="flex transition-transform duration-500 ease-out"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
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
                      onClick={() => setCurrentSlide(i)}
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

        {/* Gallery Mini */}
        <section className="py-12 px-4 overflow-hidden bg-bg">
          <div className="max-w-7xl mx-auto overflow-hidden">
            <div className="gallery-marquee flex gap-4 w-max">
              {galleryLoopImages.map((img, i) => (
                <div 
                  key={`${img}-${i}`} 
                  className="flex-shrink-0 w-48 h-48 rounded-xl overflow-hidden cursor-pointer"
                  onClick={() => openLightbox(i % galleryImages.length)}
                >
                  <img src={img} alt={`Plato gourmet ${(i % galleryImages.length) + 1}`} className="w-full h-full object-cover hover:scale-110 transition-transform" loading="lazy" />
                </div>
              ))}
            </div>
          </div>
        </section>

      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
          onClick={closeLightbox}
        >
          <button 
            className="absolute top-4 right-4 p-2 text-white hover:bg-white/20 rounded-full"
            onClick={closeLightbox}
          >
            <X size={24} />
          </button>
          
          <button 
            className="absolute left-4 p-3 text-white hover:bg-white/20 rounded-full"
            onClick={(e) => { e.stopPropagation(); prevLightbox() }}
          >
            <ChevronLeft size={32} />
          </button>

          <img 
            src={galleryImages[lightboxIndex].replace('w=300&h=300', 'w=1200&h=800')} 
            alt={`Plato ${lightboxIndex + 1}`}
            className="max-h-[80vh] max-w-[90vw] rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />

          <button 
            className="absolute right-4 p-3 text-white hover:bg-white/20 rounded-full"
            onClick={(e) => { e.stopPropagation(); nextLightbox() }}
          >
            <ChevronRight size={32} />
          </button>
        </div>
      )}

      {/* Login Modal */}
      <LoginModal 
        isOpen={loginOpen} 
        onClose={() => setLoginOpen(false)} 
        onLoginSuccess={() => setLoginOpen(false)}
      />
    </>
  )
}
