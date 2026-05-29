import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { Home } from 'lucide-react'

export default function NotFound() {
  return (
    <>
      <Helmet>
        <title>404 - Página no encontrada | PetriGastro</title>
      </Helmet>

      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center" role="alert">
        <h1 className="text-5xl sm:text-6xl md:text-8xl font-bold text-carbon mb-4">404</h1>
        <h2 className="text-2xl font-semibold mb-4">Página no encontrada</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md">
          Lo sentimos, la página que buscas no existe o ha sido movida.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 bg-accent text-carbon px-6 py-3 rounded-full hover:bg-opacity-90 transition"
        >
          <Home size={20} />
          Volver al inicio
        </Link>
      </div>
    </>
  )
}