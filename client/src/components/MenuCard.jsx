import { Plus } from 'lucide-react'
import { useCart } from '../context/CartContext'

export default function MenuCard({ plato }) {
  const { addItem } = useCart()

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="aspect-video bg-gray-200 relative">
        {plato.imagen_url ? (
          <img
            src={plato.imagen_url}
            alt={plato.nombre}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            Sin imagen
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-2 font-heading">{plato.nombre}</h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
          {plato.descripcion}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-xl font-bold text-accent">
            {plato.precio.toFixed(2)}€
          </span>
          <button
            onClick={() => addItem(plato)}
            disabled={!plato.disponible}
            className="flex items-center gap-2 bg-accent text-white px-4 py-2 rounded-full hover:bg-opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus size={18} />
            <span>Añadir</span>
          </button>
        </div>
      </div>
    </div>
  )
}