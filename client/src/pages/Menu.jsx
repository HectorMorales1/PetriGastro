import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Helmet } from 'react-helmet-async'
import MenuCard from '../components/MenuCard'
import { categoriasApi } from '../services/api'

export default function Menu() {
  const [categoriaActiva, setCategoriaActiva] = useState('todas')
  const [busqueda, setBusqueda] = useState('')

  const { data: categorias = [] } = useQuery({
    queryKey: ['categorias'],
    queryFn: categoriasApi.getAll
  })

  const { data: platos = [], isLoading } = useQuery({
    queryKey: ['platos', categoriaActiva, busqueda],
    queryFn: async () => {
      let url = '/platos'
      const params = new URLSearchParams()
      if (categoriaActiva !== 'todas') params.append('categoria', categoriaActiva)
      if (busqueda) params.append('busqueda', busqueda)
      if (params.toString()) url += `?${params.toString()}`
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}${url}`)
      return res.json()
    }
  })

  const categoriasFiltradas = categorias.filter(c => c.nombre !== 'todos')

  return (
    <>
      <Helmet>
        <title>Menú | PetriGastro</title>
        <meta name="description" content="Descubre nuestro menú de gastronomía mediterránea. Platos elaborados con productos frescos y de temporada." />
      </Helmet>

      <div className="bg-primary text-white py-16 text-center">
        <h1 className="text-4xl font-bold font-heading">Nuestro Menú</h1>
        <p className="mt-4 text-xl max-w-2xl mx-auto px-4">
          Descubre nuestros platos elaborados con los mejores ingredientes
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <input
            type="text"
            placeholder="Buscar platos..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="flex-1 px-4 py-3 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-4 mb-8">
          <button
            onClick={() => setCategoriaActiva('todas')}
            className={`px-4 py-2 rounded-full whitespace-nowrap transition ${
              categoriaActiva === 'todas' ? 'bg-accent text-white' : 'bg-gray-200 dark:bg-gray-700'
            }`}
          >
            Todos
          </button>
          {categoriasFiltradas.map(cat => (
            <button
              key={cat.id}
              onClick={() => setCategoriaActiva(cat.nombre)}
              className={`px-4 py-2 rounded-full whitespace-nowrap transition ${
                categoriaActiva === cat.nombre ? 'bg-accent text-white' : 'bg-gray-200 dark:bg-gray-700'
              }`}
            >
              {cat.icono} {cat.nombre}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="text-center py-12">Cargando...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {platos.length > 0 ? (
              platos.map(plato => <MenuCard key={plato.id} plato={plato} />)
            ) : (
              <p className="text-center col-span-full text-gray-500">No se encontraron platos</p>
            )}
          </div>
        )}
      </div>
    </>
  )
}