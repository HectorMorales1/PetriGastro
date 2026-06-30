import { Link, useLocation } from 'react-router-dom'
import { ShoppingCart, User, Menu, X, LogOut, Package, Home, Info, Utensils, ChefHat, MessageCircle, Sun, Moon } from 'lucide-react'
import { useState, useEffect, useMemo } from 'react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { cart, setIsOpen } = useCart()
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const location = useLocation()
  const isHome = location.pathname === '/'

  const cartCount = useMemo(() =>
    cart.reduce((sum, item) => sum + item.cantidad, 0),
    [cart]
  )

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navLinks = useMemo(() =>
    isHome
      ? [
          { to: '#inicio', label: 'Inicio' },
          { to: '#proceso', label: 'Cómo Funciona' },
          { to: '#menu', label: 'Menú' },
          { to: '#chef', label: 'El Chef' },
          { to: '#testimonios', label: 'Clientes' }
        ]
      : [
          { to: '/', label: 'Inicio' },
          { to: '/menu', label: 'Menú' },
        ],
    [isHome]
  )

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-[#1E1E1E]/95 backdrop-blur-md shadow-md py-3' 
          : 'bg-[#121212]/80 py-4'
      }`}
      style={{ background: scrolled ? 'rgba(30,30,30,0.95)' : 'rgba(18,18,18,0.8)', backdropFilter: 'blur(20px)' }}
    >
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-2xl font-bold font-heading text-white">
          <img src="/logo.png" alt="PetriGastro" className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
          <span>PetriGastro</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map(link => (
            <a 
              key={link.to + link.label}
              href={link.to}
              className="relative font-medium hover:text-accent transition text-gray-200"
            >
              {link.label}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent transition-all hover:w-full" />
            </a>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              <Link to="/mis-pedidos" className="flex items-center gap-1 text-sm text-gray-200 hover:text-accent">
                <Package size={18} />
                Mis Pedidos
              </Link>
              {user.rol === 'admin' && (
                <Link to="/admin" className="text-accent hover:underline text-sm">Admin</Link>
              )}
              <button 
                onClick={logout} 
                className="p-2 hover:bg-white/10 rounded-full transition"
                aria-label="Cerrar sesión"
                title="Cerrar sesión"
              >
                <LogOut size={20} className="text-gray-200" />
              </button>
            </div>
          ) : (
            <Link to="/login" className="flex items-center gap-2 hover:text-accent font-medium text-gray-200">
              <User size={20} />
              <span>Login</span>
            </Link>
          )}

          <button
            onClick={toggleTheme}
            className="p-2 hover:bg-white/10 rounded-full transition"
            aria-label={theme === 'dark' ? 'Activar modo claro' : 'Activar modo oscuro'}
          >
            {theme === 'dark' ? <Sun size={20} className="text-gray-200" /> : <Moon size={20} className="text-gray-200" />}
          </button>
          
          <button
            onClick={() => setIsOpen(true)}
            className="relative p-2 hover:bg-white/10 rounded-full transition"
            aria-label={`Ver carrito${cartCount > 0 ? `, ${cartCount} productos` : ''}`}
          >
            <ShoppingCart size={20} className="text-gray-200" />
            {cartCount > 0 && (
              <span 
                className="absolute -top-1 -right-1 text-carbon text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold bg-accent"
                aria-hidden="true"
              >
                {cartCount}
              </span>
            )}
          </button>
        </div>

        <button
          className="md:hidden p-2 text-gray-200"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menú"
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {menuOpen && (
        <div className="fixed inset-0 z-[60] md:hidden" onClick={() => setMenuOpen(false)}>
          <div className="absolute inset-0 bg-black/60" />
        </div>
      )}

      <nav className={`fixed top-0 right-0 z-[70] h-full w-72 bg-black border-l border-white/10 shadow-2xl transform transition-all duration-300 md:hidden ${
        menuOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <span className="font-bold text-lg text-white">Menú</span>
          <button onClick={() => setMenuOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition text-white">
            <X size={22} />
          </button>
        </div>

        <div className="flex flex-col p-4 gap-3 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 70px)' }}>
          <div className="bg-neutral-900 rounded-xl p-2 space-y-0.5">
            {isHome ? (
              <>
                <a href="#inicio" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 py-3 px-4 rounded-lg text-gray-200 hover:bg-white/10 transition font-medium">
                  <Home size={20} className="text-accent" />
                  Inicio
                </a>
                <a href="#proceso" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 py-3 px-4 rounded-lg text-gray-200 hover:bg-white/10 transition font-medium">
                  <Info size={20} className="text-accent" />
                  Cómo Funciona
                </a>
                <a href="#menu" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 py-3 px-4 rounded-lg text-gray-200 hover:bg-white/10 transition font-medium">
                  <Utensils size={20} className="text-accent" />
                  Menú
                </a>
                <a href="#chef" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 py-3 px-4 rounded-lg text-gray-200 hover:bg-white/10 transition font-medium">
                  <ChefHat size={20} className="text-accent" />
                  El Chef
                </a>
                <a href="#testimonios" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 py-3 px-4 rounded-lg text-gray-200 hover:bg-white/10 transition font-medium">
                  <MessageCircle size={20} className="text-accent" />
                  Clientes
                </a>
              </>
            ) : (
              <>
                <Link to="/" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 py-3 px-4 rounded-lg text-gray-200 hover:bg-white/10 transition font-medium">
                  <Home size={20} className="text-accent" />
                  Inicio
                </Link>
                <Link to="/menu" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 py-3 px-4 rounded-lg text-gray-200 hover:bg-white/10 transition font-medium">
                  <Utensils size={20} className="text-accent" />
                  Menú
                </Link>
              </>
            )}
          </div>

          <div className="bg-neutral-900 rounded-xl p-2 space-y-0.5">
            <button
              onClick={() => { setIsOpen(true); setMenuOpen(false) }}
              className="flex items-center gap-3 py-3 px-4 rounded-lg bg-accent/15 text-gray-200 hover:bg-accent/25 transition font-semibold w-full"
            >
              <div className="relative">
                <ShoppingCart size={20} />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 text-carbon text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold bg-accent">
                    {cartCount}
                  </span>
                )}
              </div>
              <span>Carrito {cartCount > 0 && `(${cartCount})`}</span>
            </button>
          </div>

          {user ? (
            <div className="bg-neutral-900 rounded-xl p-2 space-y-0.5">
              <div className="flex items-center gap-3 py-3 px-4 text-gray-200">
                <User size={20} className="text-accent" />
                <span className="font-medium">{user.nombre}</span>
              </div>
              <Link to="/mis-pedidos" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 py-3 px-4 rounded-lg text-gray-200 hover:bg-white/10 transition font-medium">
                <Package size={20} className="text-accent" />
                Mis Pedidos
              </Link>
              {user.rol === 'admin' && (
                <Link to="/admin" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 py-3 px-4 rounded-lg text-gray-200 hover:bg-white/10 transition font-medium">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-accent">
                    <path d="M12 20V10" /><path d="M18 20V4" /><path d="M6 20v-4" />
                  </svg>
                  Admin
                </Link>
              )}
              <button onClick={() => { logout(); setMenuOpen(false) }} className="flex items-center gap-3 py-3 px-4 rounded-lg text-error hover:bg-error/15 transition font-medium w-full text-left text-gray-200">
                <LogOut size={20} />
                Cerrar sesión
              </button>
            </div>
          ) : (
            <div className="bg-neutral-900 rounded-xl p-2 space-y-0.5">
              <Link to="/login" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 py-3 px-4 rounded-lg text-gray-200 hover:bg-white/10 transition font-medium">
                <User size={20} className="text-accent" />
                Iniciar sesión
              </Link>
            </div>
          )}

          <div className="bg-neutral-900 rounded-xl p-2">
            <button
              onClick={() => { toggleTheme(); setMenuOpen(false) }}
              className="flex items-center gap-3 py-3 px-4 rounded-lg text-gray-200 hover:bg-white/10 transition font-medium w-full"
            >
              {theme === 'dark' ? <Sun size={20} className="text-accent" /> : <Moon size={20} className="text-accent" />}
              <span>{theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}</span>
            </button>
          </div>
        </div>
      </nav>
    </header>
  )
}