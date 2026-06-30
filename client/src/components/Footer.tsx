import { memo } from 'react'
import { Link } from 'react-router-dom'
import { Phone, MapPin, Mail, Clock, Globe, Send, ExternalLink } from 'lucide-react'

const navLinks = [
  { to: '/', label: 'Inicio' },
  { to: '/menu', label: 'Menú' }
]

function Footer() {
  return (
    <footer className="bg-bg-secondary text-carbon">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <Link to="/" className="flex items-center gap-2 text-xl font-bold font-heading mb-4">
              <img src="/logo.png" alt="PetriGastro" className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
              <span>PetriGastro</span>
            </Link>
            <p className="text-text-muted mb-4">
              Sabores que cuentan historias. Comida artesanal para llevar.
            </p>
            <div className="flex gap-4">
              <a href="#" className="p-2 rounded-full hover:bg-accent/20 transition" aria-label="Instagram">
                <Globe size={20} />
              </a>
              <a href="#" className="p-2 rounded-full hover:bg-accent/20 transition" aria-label="Telegram">
                <Send size={20} />
              </a>
              <a href="#" className="p-2 rounded-full hover:bg-accent/20 transition" aria-label="Facebook">
                <ExternalLink size={20} />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Navegación</h4>
            <nav className="flex flex-col gap-2">
              {navLinks.map(link => (
                <Link 
                  key={link.to} 
                  to={link.to} 
                  className="text-text-muted hover:text-accent transition"
                >
                  {link.label}
                </Link>
              ))}
              <Link to="/privacidad" className="text-text-muted hover:text-accent transition">
                Política de Privacidad
              </Link>
              <Link to="/terminos" className="text-text-muted hover:text-accent transition">
                Términos y Condiciones
              </Link>
            </nav>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Contacto</h4>
            <div className="flex flex-col gap-3 text-text-muted">
              <div className="flex items-center gap-3">
                <MapPin size={16} className="text-accent flex-shrink-0" />
                <span>Calle Gourmet, 123<br/>28001 Madrid, España</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone size={16} className="text-accent flex-shrink-0" />
                <a href="tel:+34600123456" className="hover:text-accent transition">+34 600 123 456</a>
              </div>
              <a 
                href="tel:+34600123456" 
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-white text-sm font-medium w-fit transition hover:scale-105 bg-accent"
              >
                <Phone size={16} aria-hidden="true" />
                Llamar
              </a>
              <div className="flex items-center gap-3 mt-2">
                <Mail size={16} className="text-accent flex-shrink-0" />
                <a href="mailto:hola@petrigastro.es" className="hover:text-accent transition">hola@petrigastro.es</a>
              </div>
              <div className="flex items-center gap-3 mt-2">
                <Clock size={16} className="text-accent flex-shrink-0" />
                <span>Lun-Dom: 12:00 - 22:00</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border text-center space-y-2">
          <p className="text-text-muted">
            © {new Date().getFullYear()} PetriGastro. Todos los derechos reservados.
          </p>
          <div className="flex justify-center gap-4 text-xs text-text-muted">
            <Link to="/privacidad" className="hover:text-accent transition">Política de Privacidad</Link>
            <Link to="/terminos" className="hover:text-accent transition">Términos y Condiciones</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default memo(Footer)