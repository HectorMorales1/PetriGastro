import { memo, useState, useCallback, type SyntheticEvent } from 'react'
import { Plus, Check, ImageOff } from 'lucide-react'
import { useCart } from '../context/CartContext'
import DishModal from './DishModal'
import type { Plato } from '../types'

const DEFAULT_FALLBACK = 'https://placehold.co/400x300/1e1e1e/a8a29e?text=Sin+imagen'

interface MenuCardProps {
  plato: Plato
}

function MenuCard({ plato }: MenuCardProps) {
  const { addItem } = useCart()
  const [added, setAdded] = useState(false)
  const [showDetail, setShowDetail] = useState(false)
  const [imgError, setImgError] = useState(false)

  const handleImgError = useCallback((e: SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = DEFAULT_FALLBACK
    setImgError(true)
  }, [])

  const handleAdd = useCallback(() => {
    addItem(plato)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }, [plato, addItem])

  return (
    <>
      <div
        className="bg-surface rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer"
        onClick={() => setShowDetail(true)}
        role="button"
        tabIndex={0}
        aria-label={`Ver detalle de ${plato.nombre}`}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setShowDetail(true) } }}
      >
        <div className="aspect-video bg-bg-tertiary relative overflow-hidden">
          {plato.imagen_url && !imgError ? (
            <img
              src={plato.imagen_url}
              alt={plato.nombre}
              className="w-full h-full object-cover"
              loading="lazy"
              onError={handleImgError}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-text-muted gap-2" role="img" aria-label="Sin imagen disponible">
              <ImageOff size={32} className="opacity-50" />
              <span className="text-sm">Sin imagen</span>
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
          <div className="flex items-center justify-between" onClick={(e) => e.stopPropagation()}>
            <span className="text-2xl font-bold text-carbon">
              {Number(plato.precio).toFixed(2)}€
            </span>
            <button
              onClick={(e) => { e.stopPropagation(); handleAdd() }}
              disabled={!plato.disponible}
              aria-label={`${!plato.disponible ? 'No disponible - ' : ''}Añadir ${plato.nombre} al carrito`}
              title={!plato.disponible ? 'Plato no disponible' : ''}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                added
                  ? 'bg-verde-oliva text-white'
                  : 'bg-accent text-carbon hover:scale-105'
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
      <DishModal plato={showDetail ? plato : null} onClose={() => setShowDetail(false)} />
    </>
  )
}

export default memo(MenuCard)