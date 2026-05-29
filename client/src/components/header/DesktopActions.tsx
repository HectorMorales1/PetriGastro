import { Link } from 'react-router-dom'
import { ShoppingCart, User, LogOut, Package, Sun, Moon } from 'lucide-react'
import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'

export default function DesktopActions() {
  const { cart, setIsOpen } = useCart()
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()

  const cartCount = cart.reduce((sum, item) => sum + item.cantidad, 0)

  return (
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
          <span className="absolute -top-1 -right-1 text-carbon text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold bg-accent" aria-hidden="true">
            {cartCount}
          </span>
        )}
      </button>
    </div>
  )
}
