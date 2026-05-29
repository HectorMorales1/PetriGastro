import { Link, useLocation } from 'react-router-dom'
import { ShoppingCart, User, LogOut, Package, Home, Info, Utensils, ChefHat, MessageCircle, Sun, Moon, X } from 'lucide-react'
import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'

interface MobileMenuProps {
  open: boolean
  onClose: () => void
}

export default function MobileMenu({ open, onClose }: MobileMenuProps) {
  const location = useLocation()
  const isHome = location.pathname === '/'
  const { cart, setIsOpen } = useCart()
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()

  const cartCount = cart.reduce((sum, item) => sum + item.cantidad, 0)

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-[60] md:hidden" onClick={onClose}>
          <div className="absolute inset-0 bg-black/60" />
        </div>
      )}

      <nav className={`fixed top-0 right-0 z-[70] h-full w-72 bg-black border-l border-white/10 shadow-2xl transform transition-all duration-300 md:hidden ${
        open ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <span className="font-bold text-lg text-white">Menú</span>
          <button onClick={onClose} className="w-11 h-11 flex items-center justify-center hover:bg-white/10 rounded-full transition text-white">
            <X size={22} />
          </button>
        </div>

        <div className="flex flex-col p-4 gap-3 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 70px)' }}>
          <div className="bg-neutral-900 rounded-xl p-2 space-y-0.5">
            {isHome ? (
              <>
                <a href="#inicio" onClick={onClose} className="flex items-center gap-3 py-3.5 px-4 rounded-lg text-gray-200 hover:bg-white/10 transition font-medium">
                  <Home size={20} className="text-accent" /> Inicio
                </a>
                <a href="#proceso" onClick={onClose} className="flex items-center gap-3 py-3.5 px-4 rounded-lg text-gray-200 hover:bg-white/10 transition font-medium">
                  <Info size={20} className="text-accent" /> Cómo Funciona
                </a>
                <a href="#menu" onClick={onClose} className="flex items-center gap-3 py-3.5 px-4 rounded-lg text-gray-200 hover:bg-white/10 transition font-medium">
                  <Utensils size={20} className="text-accent" /> Menú
                </a>
                <a href="#chef" onClick={onClose} className="flex items-center gap-3 py-3.5 px-4 rounded-lg text-gray-200 hover:bg-white/10 transition font-medium">
                  <ChefHat size={20} className="text-accent" /> El Chef
                </a>
                <a href="#testimonios" onClick={onClose} className="flex items-center gap-3 py-3.5 px-4 rounded-lg text-gray-200 hover:bg-white/10 transition font-medium">
                  <MessageCircle size={20} className="text-accent" /> Clientes
                </a>
              </>
            ) : (
              <>
                <Link to="/" onClick={onClose} className="flex items-center gap-3 py-3.5 px-4 rounded-lg text-gray-200 hover:bg-white/10 transition font-medium">
                  <Home size={20} className="text-accent" /> Inicio
                </Link>
                <Link to="/menu" onClick={onClose} className="flex items-center gap-3 py-3.5 px-4 rounded-lg text-gray-200 hover:bg-white/10 transition font-medium">
                  <Utensils size={20} className="text-accent" /> Menú
                </Link>
              </>
            )}
          </div>

          <div className="bg-neutral-900 rounded-xl p-2 space-y-0.5">
            <button
              onClick={() => { setIsOpen(true); onClose() }}
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
              <Link to="/mis-pedidos" onClick={onClose} className="flex items-center gap-3 py-3 px-4 rounded-lg text-gray-200 hover:bg-white/10 transition font-medium">
                <Package size={20} className="text-accent" /> Mis Pedidos
              </Link>
              {user.rol === 'admin' && (
                <Link to="/admin" onClick={onClose} className="flex items-center gap-3 py-3 px-4 rounded-lg text-gray-200 hover:bg-white/10 transition font-medium">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-accent">
                    <path d="M12 20V10" /><path d="M18 20V4" /><path d="M6 20v-4" />
                  </svg>
                  Admin
                </Link>
              )}
              <button onClick={() => { logout(); onClose() }} className="flex items-center gap-3 py-3 px-4 rounded-lg text-error hover:bg-error/15 transition font-medium w-full text-left text-gray-200">
                <LogOut size={20} /> Cerrar sesión
              </button>
            </div>
          ) : (
            <div className="bg-neutral-900 rounded-xl p-2 space-y-0.5">
              <Link to="/login" onClick={onClose} className="flex items-center gap-3 py-3 px-4 rounded-lg text-gray-200 hover:bg-white/10 transition font-medium">
                <User size={20} className="text-accent" /> Iniciar sesión
              </Link>
            </div>
          )}

          <div className="bg-neutral-900 rounded-xl p-2">
            <button
              onClick={() => { toggleTheme(); onClose() }}
              className="flex items-center gap-3 py-3 px-4 rounded-lg text-gray-200 hover:bg-white/10 transition font-medium w-full"
            >
              {theme === 'dark' ? <Sun size={20} className="text-accent" /> : <Moon size={20} className="text-accent" />}
              <span>{theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}</span>
            </button>
          </div>
        </div>
      </nav>
    </>
  )
}
