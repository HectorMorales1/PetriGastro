import { Link } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { useState, useEffect } from 'react'
import NavLinks from './header/NavLinks'
import DesktopActions from './header/DesktopActions'
import MobileMenu from './header/MobileMenu'

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-[#1E1E1E]/95 backdrop-blur-md shadow-md py-3' : 'bg-[#121212]/80 py-4'
      }`}
      style={{ background: scrolled ? 'rgba(30,30,30,0.95)' : 'rgba(18,18,18,0.8)', backdropFilter: 'blur(20px)' }}
    >
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-2xl font-bold font-heading text-white">
          <svg width="32" height="32" viewBox="0 0 100 100" fill="none" className="flex-shrink-0">
            <circle cx="50" cy="50" r="45" className="fill-accent" />
            <path d="M30 50 Q50 30 70 50 Q50 70 30 50" className="fill-white/80" />
          </svg>
          <span>PetriGastro</span>
        </Link>

        <NavLinks />
        <DesktopActions />

        <button
          className="md:hidden w-11 h-11 flex items-center justify-center text-gray-200 hover:bg-white/10 rounded-full transition"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menú"
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </header>
  )
}
