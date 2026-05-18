import { Link, useLocation } from 'react-router-dom'
import { ShoppingCart, User, Menu, X, LogOut, Package } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { cart, setIsOpen } = useCart()
  const { user, logout } = useAuth()
  const location = useLocation()
  const isHome = location.pathname === '/'

  const cartCount = cart.reduce((sum, item) => sum + item.cantidad, 0)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navLinks = isHome 
    ? [
        { to: '#inicio', label: 'Inicio' },
        { to: '#proceso', label: 'Cómo Funciona' },
        { to: '#menu', label: 'Menú' },
        { to: '#chef', label: 'El Chef' },
        { to: '#testimonios', label: 'Clientes' }
      ]
    : [
        { to: '/', label: 'Inicio' },
        { to: '/menu', label: 'Menú' }
      ]

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
        <Link to="/" className="flex items-center gap-2 text-2xl font-bold font-heading text-carbon">
          <svg width="32" height="32" viewBox="0 0 100 100" fill="none" className="flex-shrink-0">
            <circle cx="50" cy="50" r="45" className="fill-accent"/>
            <path d="M30 50 Q50 30 70 50 Q50 70 30 50" className="fill-carbon"/>
          </svg>
          <span>PetriGastro</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map(link => (
            <a 
              key={link.to + link.label}
              href={link.to}
              className="relative font-medium hover:text-accent transition text-carbon"
            >
              {link.label}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent transition-all hover:w-full" />
            </a>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              <Link to="/mis-pedidos" className="flex items-center gap-1 text-sm text-carbon hover:text-accent">
                <Package size={18} />
                Mis Pedidos
              </Link>
              {user.rol === 'admin' && (
                <Link to="/admin" className="text-accent hover:underline text-sm">Admin</Link>
              )}
              <button 
                onClick={logout} 
                className="p-2 hover:bg-gray-100 rounded-full transition"
                aria-label="Cerrar sesión"
                title="Cerrar sesión"
              >
                <LogOut size={20} className="text-carbon" />
              </button>
            </div>
          ) : (
            <Link to="/login" className="flex items-center gap-2 hover:text-accent font-medium text-carbon">
              <User size={20} />
              <span>Login</span>
            </Link>
          )}
          
          <button
            onClick={() => setIsOpen(true)}
            className="relative p-2 hover:bg-gray-100 rounded-full transition"
            aria-label="Ver carrito"
          >
            <ShoppingCart size={20} className="text-carbon" />
            {cartCount > 0 && (
              <span 
                className="absolute -top-1 -right-1 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold bg-accent"
              >
                {cartCount}
              </span>
            )}
          </button>
        </div>

        <button
          className="md:hidden p-2"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menú"
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {menuOpen && (
        <nav className="md:hidden bg-[#1E1E1E] border-t border-border p-4 flex flex-col gap-4 shadow-lg">
          {navLinks.map(link => (
            <a 
              key={link.to + link.label}
              href={link.to}
              onClick={() => setMenuOpen(false)}
              className="font-medium text-carbon"
            >
              {link.label}
            </a>
          ))}
          {user ? (
            <>
              <span className="font-medium text-carbon">{user.nombre}</span>
              {user.rol === 'admin' && <Link to="/admin">Admin</Link>}
              <button onClick={logout} className="text-left text-carbon">Cerrar sesión</button>
            </>
          ) : (
            <Link to="/login" className="text-carbon">Login</Link>
          )}
        </nav>
      )}
    </header>
  )
}