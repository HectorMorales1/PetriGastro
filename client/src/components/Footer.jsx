import { Link } from 'react-router-dom'
import { Phone, MapPin, Clock, Instagram, Facebook, Twitter } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-primary text-white py-12">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h3 className="text-xl font-bold mb-4 font-heading">PetriGastro</h3>
          <p className="text-gray-300">
            Gastronomía mediterránea con productos frescos y de temporada.
          </p>
          <div className="flex gap-4 mt-4">
            <a href="#" className="hover:text-accent transition"><Instagram size={20} /></a>
            <a href="#" className="hover:text-accent transition"><Facebook size={20} /></a>
            <a href="#" className="hover:text-accent transition"><Twitter size={20} /></a>
          </div>
        </div>

        <div>
          <h4 className="text-lg font-semibold mb-4">Contacto</h4>
          <div className="flex flex-col gap-3 text-gray-300">
            <div className="flex items-center gap-2">
              <Phone size={16} />
              <span>+34 600 123 456</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin size={16} />
              <span>Calle Ejemplo 123, Valencia</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={16} />
              <span>Lun-Dom: 12:00 - 23:00</span>
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-lg font-semibold mb-4">Enlaces</h4>
          <nav className="flex flex-col gap-2 text-gray-300">
            <Link to="/menu" className="hover:text-accent transition">Menú</Link>
            <Link to="/reservas" className="hover:text-accent transition">Reservas</Link>
            <Link to="/login" className="hover:text-accent transition">Mi cuenta</Link>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-8 pt-8 border-t border-gray-700 text-center text-gray-400 text-sm">
        <p>© {new Date().getFullYear()} PetriGastro. Todos los derechos reservados.</p>
      </div>
    </footer>
  )
}