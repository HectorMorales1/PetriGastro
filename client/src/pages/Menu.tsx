import { useState, useEffect, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Helmet } from 'react-helmet-async'
import { Search, X, Loader2, ImageOff, Plus, Check } from 'lucide-react'
import MenuCard from '../components/MenuCard'
import { categoriasApi, platosApi } from '../services/api'
import { useCart } from '../context/CartContext'
import type { Plato } from '../types'

function PlatoDetailModal({ plato, onClose }: { plato: Plato; onClose: () => void }) {
  const { addItem } = useCart()
  const [added, setAdded] = useState(false)
  const [imgError, setImgError] = useState(false)

  const handleAdd = () => {
    addItem(plato)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Detalle de ${plato.nombre}`}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative bg-card rounded-2xl overflow-hidden max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-11 h-11 flex items-center justify-center bg-black/40 hover:bg-black/60 rounded-full text-white transition-colors"
          aria-label="Cerrar"
        >
          <X size={20} />
        </button>

        <div className="aspect-video bg-bg-tertiary relative">
          {plato.imagen_url && !imgError ? (
            <img
              src={plato.imagen_url}
              alt={plato.nombre}
              className="w-full h-full object-cover"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-text-muted gap-2">
              <ImageOff size={40} className="opacity-50" />
              <span className="text-sm">Sin imagen</span>
            </div>
          )}
        </div>

        <div className="p-6 space-y-4">
          <div>
            <h2 className="text-2xl font-bold font-heading mb-1">{plato.nombre}</h2>
            {plato.categoria && (
              <span className="inline-block px-3 py-1 bg-bg-tertiary rounded-full text-xs font-medium text-text-muted">
                {plato.categoria}
              </span>
            )}
          </div>

          <p className="text-text-muted leading-relaxed">
            {plato.descripcion || 'Sin descripción disponible.'}
          </p>

          <div className="flex items-center justify-between pt-4 border-t border-border">
            <span className="text-3xl font-bold text-accent">
              {Number(plato.precio).toFixed(2)}€
            </span>
            <button
              onClick={handleAdd}
              disabled={!plato.disponible}
              title={!plato.disponible ? 'Plato no disponible' : ''}
              className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
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
                  <span>Añadir al carrito</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Menu() {
  const [categoriaActiva, setCategoriaActiva] = useState('todas')
  const [busqueda, setBusqueda] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [selectedPlato, setSelectedPlato] = useState<Plato | null>(null)

  const { data: categorias = [] } = useQuery({
    queryKey: ['categorias'],
    queryFn: categoriasApi.getAll
  })

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(busqueda)
    }, 300)
    return () => clearTimeout(timer)
  }, [busqueda])

  const { data: platos = [], isLoading } = useQuery({
    queryKey: ['platos', categoriaActiva, debouncedSearch],
    queryFn: () => {
      const params = {}
      if (categoriaActiva !== 'todas') params.categoria = categoriaActiva
      if (debouncedSearch) params.busqueda = debouncedSearch
      return platosApi.getAll(params)
    }
  })

  const clearSearch = useCallback(() => {
    setBusqueda('')
    setDebouncedSearch('')
  }, [])

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      clearSearch()
    }
  }

  const categoriasFiltradas = categorias.filter(c => c.nombre !== 'todos')

  return (
    <>
      <Helmet>
        <title>Menú | PetriGastro</title>
        <meta name="description" content="Descubre nuestro menú de gastronomía mediterránea. Platos elaborados con productos frescos y de temporada." />
      </Helmet>

      <div className="relative h-48 md:h-64 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, var(--color-accent) 0%, #B8860B 100%)' }}>
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10 text-center text-white px-4">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold font-heading mb-3 md:mb-4">Nuestro Menú</h1>
          <p className="text-base md:text-xl max-w-2xl mx-auto text-white/90">
            Descubre nuestros platos elaborados con los mejores ingredientes de temporada
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={20} />
            <label htmlFor="search-menu" className="sr-only">Buscar platos</label>
            <input
              id="search-menu"
              type="search"
              placeholder="Buscar platos..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full pl-12 pr-12 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent bg-bg-secondary"
            />
            {busqueda && (
              <button
                onClick={clearSearch}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text"
                aria-label="Limpiar búsqueda"
              >
                <X size={20} />
              </button>
            )}
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-4 mb-8 scrollbar-hide" role="tablist" aria-label="Filtrar por categoría">
          <button
            role="tab"
            aria-selected={categoriaActiva === 'todas'}
            onClick={() => setCategoriaActiva('todas')}
            className={`px-5 py-2.5 rounded-full whitespace-nowrap font-medium transition-all duration-200 ${
              categoriaActiva === 'todas' 
                ? 'bg-accent text-carbon shadow-md' 
                : 'bg-bg-secondary hover:bg-bg-tertiary'
            }`}
          >
            Todos
          </button>
          {categoriasFiltradas.map(cat => (
            <button
              key={cat.id}
              role="tab"
              aria-selected={categoriaActiva === cat.nombre}
              onClick={() => setCategoriaActiva(cat.nombre)}
              className={`px-5 py-2.5 rounded-full whitespace-nowrap font-medium transition-all duration-200 ${
                categoriaActiva === cat.nombre 
? 'bg-accent text-carbon shadow-md' 
                  : 'bg-bg-secondary hover:bg-bg-tertiary'
            }`} >
              {cat.icono && <span className="mr-1">{cat.icono}</span>}
              {cat.nombre}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12" role="status" aria-live="polite">
            <Loader2 className="animate-spin text-accent" size={40} />
            <span className="sr-only">Cargando platos...</span>
          </div>
        ) : (
          <>
            {platos.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {platos.map(plato => (
                  <div key={plato.id} onClick={() => setSelectedPlato(plato)} className="cursor-pointer">
                    <MenuCard plato={plato} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-card rounded-lg shadow p-12 text-center" role="status">
                <p className="text-text-muted text-lg">
                  No se encontraron platos que coincidan con tu búsqueda.
                </p>
                <button 
                  onClick={clearSearch}
                  className="mt-4 text-carbon hover:underline"
                >
                  Ver todos los platos
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {selectedPlato && (
        <PlatoDetailModal plato={selectedPlato} onClose={() => setSelectedPlato(null)} />
      )}
    </>
  )
}