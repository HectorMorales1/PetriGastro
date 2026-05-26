import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, X, Loader2 } from 'lucide-react'
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

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
  onLoginSuccess: () => void
}

function LoginModal({ isOpen, onClose, onLoginSuccess }: LoginModalProps) {
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
  const [registerMessage, setRegisterMessage] = useState('')
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
        if (result.estado_solicitud === 'pendiente_verificacion') {
          setError('Debes verificar tu correo electrónico primero. Revisa tu bandeja de entrada.')
        } else if (result.estado_solicitud === 'pendiente') {
          setError('Tu solicitud está pendiente de aprobación por el administrador.')
        } else if (result.estado_solicitud === 'rechazado') {
          setError(result.error || 'Tu solicitud ha sido rechazada.')
        } else {
          setError(result.error || 'Credenciales inválidas')
        }
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
    
    if (result.success && result.pending) {
      setRegisterSuccess(true)
      setRegisterMessage(result.message || 'Se ha enviado un correo de verificación. Revisa tu bandeja de entrada.')
    } else if (result.success) {
      setRegisterSuccess(true)
      setRegisterMessage('Cuenta creada exitosamente.')
      setTimeout(() => {
        setIsRegisterMode(false)
        setRegisterSuccess(false)
        setRegisterMessage('')
        setEmail(regEmail)
        setPassword('')
      }, 2000)
    } else {
      setError(result.error || 'Error al registrarse')
    }
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)' }} role="dialog" aria-modal="true" aria-labelledby="login-modal-title">
      <div className="w-full max-w-md rounded-xl shadow-2xl overflow-hidden bg-surface">
        <div className="p-8 text-center bg-accent">
          <svg className="w-16 h-16 mx-auto mb-4" viewBox="0 0 100 100" fill="none" aria-hidden="true">
            <circle cx="50" cy="50" r="45" className="fill-carbon"/>
            <path d="M30 50 Q50 30 70 50 Q50 70 30 50" className="fill-accent"/>
          </svg>
          <h2 id="login-modal-title" className="text-2xl font-bold text-white mb-2">PetriGastro</h2>
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
                  autoComplete="email"
                />
                {emailError && <p className="text-red-500 text-xs mt-2" role="alert">Email requerido</p>}
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2 text-carbon">Contraseña</label>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full px-4 py-3 rounded-lg border-2 ${passError ? 'border-red-500' : 'border-border'} focus:border-accent focus:ring-4 focus:ring-accent/15 outline-none transition-all bg-bg-secondary`}
                  placeholder="Ingresa tu contraseña"
                  autoComplete="current-password"
                />
                {passError && <p className="text-red-500 text-xs mt-2" role="alert">Contraseña requerida</p>}
              </div>
              
              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-4 rounded-lg font-semibold text-carbon flex items-center justify-center gap-2 transition hover:opacity-90 bg-accent">
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
                  className="text-carbon font-medium hover:underline"
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
                  autoComplete="given-name"
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
                  autoComplete="family-name"
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
                  autoComplete="email"
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
                  autoComplete="new-password"
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
                  autoComplete="new-password"
                  required
                />
              </div>

              {error && (
                <div className="mb-4 p-3 rounded-lg bg-error/10 text-error text-sm" role="alert">
                  {error}
                </div>
              )}
              
              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-4 rounded-lg font-semibold text-carbon transition hover:opacity-90 bg-accent">
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
                ) : (
                  'Crear cuenta'
                )}
              </button>

              {registerSuccess && (
                <div className="mt-4 p-4 rounded-lg text-white text-center bg-success" role="alert" aria-live="polite">
                  {registerMessage}
                </div>
              )}

              <div className="mt-6 pt-6 border-t border-border text-center">
                <button 
                  type="button"
                  onClick={() => { setIsRegisterMode(false); setRegisterSuccess(false) }}
                  className="text-carbon font-medium hover:underline"
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
          aria-label="Cerrar"
        >
          <X size={24} />
        </button>
      </div>
    </div>
  )
}

export default function Home() {
  const [scrollProgress, setScrollProgress] = useState(0)
  const [loginOpen, setLoginOpen] = useState(false)
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

        <section id="menu" className="py-20 px-4 bg-bg">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <span className="inline-block px-4 py-2 rounded-full text-sm font-medium uppercase tracking-wider mb-4 bg-surface text-carbon">Carta</span>
              <h2 className="text-4xl font-bold font-heading text-carbon">Platos Destacados</h2>
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
              <Link to="/menu" className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-semibold bg-accent text-carbon transition hover:opacity-90 hover:scale-105">
                <span>Ver Menú Completo</span>
                <ArrowRight size={20} />
              </Link>
            </div>
          </div>
        </section>

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
                  <div className="text-2xl font-bold text-carbon">15+</div>
                  <div className="text-sm text-text-muted">Años de experiencia</div>
                </div>
              </div>

              <div className="space-y-6">
                <span className="inline-block px-4 py-2 rounded-full text-sm font-medium uppercase tracking-wider bg-surface text-carbon">El Artista</span>
                <h2 className="text-4xl font-bold font-heading text-carbon">Pasión que se hereda<br/>de generaciones</h2>
                <p className="text-2xl italic font-accent text-carbon">Chef Petri</p>
                <p className="text-text-muted leading-relaxed">
                  Desde los fogones de casa hasta las cocinas más exigentes, cada plato lleva consigo una historia familiar.
                </p>
                <p className="text-text-muted leading-relaxed">
                  En PetriGastro combino la tradición culinaria española con técnicas modernas.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
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

      <LoginModal
        isOpen={loginOpen}
        onClose={() => setLoginOpen(false)}
        onLoginSuccess={() => setLoginOpen(false)}
      />
    </>
  )
}
