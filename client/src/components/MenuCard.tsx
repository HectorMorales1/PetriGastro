import { memo, useState, useCallback } from 'react'
import { Plus, Check } from 'lucide-react'
import { useCart } from '../context/CartContext'
import type { Plato } from '../types'

interface MenuCardProps {
  plato: Plato
}

function MenuCard({ plato }: MenuCardProps) {
  const { addItem } = useCart()
  const [added, setAdded] = useState(false)

  const handleAdd = useCallback(() => {
    addItem(plato)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }, [plato, addItem])

  return (
    <div className="bg-surface rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <div className="aspect-video bg-bg-tertiary relative">
        {plato.imagen_url ? (
          <img
            src={plato.imagen_url}
            alt={plato.nombre}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-text-muted">
            Sin imagen
          </div>
        )}
        {plato.categoria && (
          <span className="absolute top-3 left-3 px-3 py-1 bg-bg-secondary/90 backdrop-blur-sm rounded-full text-xs font-medium text-accent">
            {plato.categoria}
          </span>
        )}
      </div>
      <div className="p-5">
        <h3 className="text-lg font-semibold mb-2 font-heading text-carbon">{plato.nombre}</h3>
        <p className="text-text-muted text-sm mb-4 line-clamp-2">
          {plato.descripcion}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-accent">
            {Number(plato.precio).toFixed(2)}€
          </span>
          <button
            onClick={handleAdd}
            disabled={!plato.disponible}
            aria-label={`Añadir ${plato.nombre} al carrito`}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
              added 
                ? 'bg-verde-oliva text-white' 
                : 'bg-accent text-white hover:scale-105'
            }`}
          >
            {added ? (
              <>
                <Check size={18} />
                <span>Añadido</span>
              </>
            ) : (
              <>
                <Plus size={18} />
                <span>Añadir</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default memo(MenuCard)