import { Link } from 'react-router-dom'
import { ShoppingCart, User, Menu, X, Sun, Moon } from 'lucide-react'
import { useState } from 'react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { cart, setIsOpen } = useCart()
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()

  const cartCount = cart.reduce((sum, item) => sum + item.cantidad, 0)

  return (
    <header className="bg-white dark:bg-gray-900 shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold text-primary font-heading">
          PetriGastro
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link to="/" className="hover:text-accent transition">Inicio</Link>
          <Link to="/menu" className="hover:text-accent transition">Menú</Link>
          <Link to="/reservas" className="hover:text-accent transition">Reservas</Link>
          <button onClick={toggleTheme} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          {user ? (
            <div className="flex items-center gap-4">
              <span className="text-sm">{user.nombre}</span>
              {user.rol === 'admin' && (
                <Link to="/admin" className="text-accent hover:underline">Admin</Link>
              )}
              <button onClick={logout} className="text-sm hover:text-accent">Cerrar sesión</button>
            </div>
          ) : (
            <Link to="/login" className="flex items-center gap-2 hover:text-accent">
              <User size={20} />
              <span>Login</span>
            </Link>
          )}
          <button
            onClick={() => setIsOpen(true)}
            className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
          >
            <ShoppingCart size={20} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-accent text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
        </nav>

        <button
          className="md:hidden p-2"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {menuOpen && (
        <nav className="md:hidden bg-white dark:bg-gray-900 border-t p-4 flex flex-col gap-4">
          <Link to="/" onClick={() => setMenuOpen(false)}>Inicio</Link>
          <Link to="/menu" onClick={() => setMenuOpen(false)}>Menú</Link>
          <Link to="/reservas" onClick={() => setMenuOpen(false)}>Reservas</Link>
          <button onClick={toggleTheme} className="flex items-center gap-2">
            {theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
          </button>
          {user ? (
            <>
              <span>{user.nombre}</span>
              {user.rol === 'admin' && <Link to="/admin">Admin</Link>}
              <button onClick={logout}>Cerrar sesión</button>
            </>
          ) : (
            <Link to="/login">Login</Link>
          )}
        </nav>
      )}
    </header>
  )
}