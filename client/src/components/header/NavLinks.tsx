import { useMemo } from 'react'
import { useLocation } from 'react-router-dom'

export default function NavLinks() {
  const location = useLocation()
  const isHome = location.pathname === '/'

  const navLinks = useMemo(() =>
    isHome
      ? [
          { to: '#inicio', label: 'Inicio' },
          { to: '#proceso', label: 'Cómo Funciona' },
          { to: '#menu', label: 'Menú' },
          { to: '#chef', label: 'El Chef' },
          { to: '#testimonios', label: 'Clientes' },
        ]
      : [
          { to: '/', label: 'Inicio' },
          { to: '/menu', label: 'Menú' },
        ],
    [isHome]
  )

  return (
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
  )
}
