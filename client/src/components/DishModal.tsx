import { useEffect } from 'react'
import { X, Plus, ImageOff } from 'lucide-react'
import { useCart } from '../context/CartContext'
import type { Plato } from '../types'

interface DishModalProps {
  plato: Plato | null
  onClose: () => void
}

export default function DishModal({ plato, onClose }: DishModalProps) {
  const { addItem } = useCart()

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (plato) {
      document.addEventListener('keydown', handleKey)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [plato, onClose])

  if (!plato) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Detalle de ${plato.nombre}`}
    >
      <div className="absolute inset-0 bg-black/90" />
      <div
        className="relative bg-card rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-11 h-11 flex items-center justify-center bg-black/50 rounded-full text-white hover:bg-black/70 transition"
          aria-label="Cerrar"
        >
          <X size={20} />
        </button>

        <div className="aspect-video bg-bg-tertiary relative overflow-hidden rounded-t-xl">
          {plato.imagen_url ? (
            <img
              src={plato.imagen_url}
              alt={plato.nombre}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-text-muted">
              <ImageOff size={48} />
            </div>
          )}
          {plato.categoria && (
            <span className="absolute top-4 left-4 px-3 py-1 bg-surface/90 rounded-full text-sm font-medium text-accent">
              {plato.categoria}
            </span>
          )}
        </div>

        <div className="p-6 space-y-4">
          <div>
            <h2 className="text-2xl font-bold font-heading text-carbon">{plato.nombre}</h2>
            <p className="text-3xl font-bold text-carbon mt-2">{Number(plato.precio).toFixed(2)}€</p>
          </div>

          <div className="border-t border-border pt-4">
            <h3 className="font-semibold text-carbon mb-2">Descripción</h3>
            <p className="text-text-muted leading-relaxed">
              {plato.descripcion || 'Sin descripción disponible'}
            </p>
          </div>

          <div className="border-t border-border pt-4">
            <h3 className="font-semibold text-carbon mb-2">Ingredientes</h3>
            {plato.ingredientes ? (
              <p className="text-text-muted leading-relaxed">{plato.ingredientes}</p>
            ) : (
              <p className="text-text-muted italic">Sin información de ingredientes</p>
            )}
          </div>

          <button
            onClick={() => { addItem(plato); onClose() }}
            disabled={!plato.disponible}
            className="w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition disabled:opacity-50 bg-accent text-carbon hover:opacity-90"
          >
            <Plus size={20} />
            Añadir al carrito
          </button>
        </div>
      </div>
    </div>
  )
}
