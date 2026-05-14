import { Link } from 'react-router-dom'
import { ArrowRight, Utensils, Calendar, Star } from 'lucide-react'
import { Helmet } from 'react-helmet-async'

export default function Home() {
  return (
    <>
      <Helmet>
        <title>PetriGastro - Restaurante Gastronómico</title>
        <meta name="description" content="Descubre la mejor gastronomía mediterránea en PetriGastro. Platos elaborados con productos frescos y de temporada. Reserva tu mesa hoy." />
      </Helmet>

      <section className="relative h-[70vh] flex items-center justify-center bg-gradient-to-br from-primary to-secondary">
        <div className="absolute inset-0 bg-black/30" />
        <div className="relative z-10 text-center text-white px-4">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 font-heading">
            Sabores del Mediterráneo
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto">
            Una experiencia culinaria única con los mejores productos de temporada
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/menu"
              className="inline-flex items-center gap-2 bg-accent px-8 py-4 rounded-full text-lg font-semibold hover:bg-opacity-90 transition"
            >
              Ver Menú <ArrowRight size={20} />
            </Link>
            <Link
              to="/reservas"
              className="inline-flex items-center gap-2 bg-white text-primary px-8 py-4 rounded-full text-lg font-semibold hover:bg-gray-100 transition"
            >
              <Calendar size={20} /> Reservar Mesa
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 font-heading">Nuestros Servicios</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-8 border rounded-lg hover:shadow-lg transition">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Utensils className="text-accent" size={32} />
              </div>
              <h3 className="text-xl font-semibold mb-4">Gastronomía de Autor</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Platos elaborados con pasión y los mejores ingredientes locales
              </p>
            </div>
            <div className="text-center p-8 border rounded-lg hover:shadow-lg transition">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="text-accent" size={32} />
              </div>
              <h3 className="text-xl font-semibold mb-4">Reservas Online</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Reserva tu mesa de forma rápida y sencilla
              </p>
            </div>
            <div className="text-center p-8 border rounded-lg hover:shadow-lg transition">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="text-accent" size={32} />
              </div>
              <h3 className="text-xl font-semibold mb-4">Experiencia Premium</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Atención personalizada en un ambiente exclusivo
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-cream dark:bg-gray-800">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-8 font-heading">Visitanos</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Nos encontrarás en el corazón de Valencia, con una terraza única
          </p>
          <Link
            to="/reservas"
            className="inline-block bg-primary text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-secondary transition"
          >
            Hacer una Reserva
          </Link>
        </div>
      </section>
    </>
  )
}