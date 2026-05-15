import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Helmet } from 'react-helmet-async'
import { useAuth } from '../context/AuthContext'
import { platosApi, pedidosApi, categoriasApi, reservasApi } from '../services/api'

const ITEMS_PER_PAGE = 10

function Paginacion({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null
  return (
    <div className="flex items-center justify-center gap-2 py-4">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className="px-3 py-1 rounded border border-border disabled:opacity-30 hover:bg-bg-secondary"
      >
        Anterior
      </button>
      {Array.from({ length: totalPages }, (_, i) => i + 1)
        .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 2)
        .map((p, idx, arr) => (
          <span key={p} className="flex items-center gap-1">
            {idx > 0 && arr[idx - 1] !== p - 1 && <span className="text-text-muted">...</span>}
            <button
              onClick={() => onPageChange(p)}
              className={`w-8 h-8 rounded text-sm font-medium ${
                p === currentPage ? 'bg-accent text-white' : 'hover:bg-bg-secondary'
              }`}
            >
              {p}
            </button>
          </span>
        ))}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="px-3 py-1 rounded border border-border disabled:opacity-30 hover:bg-bg-secondary"
      >
        Siguiente
      </button>
    </div>
  )
}

export default function Admin() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState('pedidos')
  const [page, setPage] = useState({ pedidos: 1, reservas: 1, platos: 1 })

  if (!user || user.rol !== 'admin') {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold">Acceso denegado</h1>
        <p className="mt-2">No tienes permisos para acceder a esta página.</p>
      </div>
    )
  }

  const { data: pedidos = [] } = useQuery({
    queryKey: ['pedidos'],
    queryFn: pedidosApi.getAll
  })

  const { data: reservas = [] } = useQuery({
    queryKey: ['reservas'],
    queryFn: reservasApi.getAll
  })

  const { data: categorias = [] } = useQuery({
    queryKey: ['categorias'],
    queryFn: categoriasApi.getAll
  })

  const updatePedidoMutation = useMutation({
    mutationFn: ({ id, estado }) => pedidosApi.updateEstado(id, estado),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['pedidos'] })
  })

  const tabs = [
    { id: 'pedidos', label: 'Pedidos' },
    { id: 'reservas', label: 'Reservas' },
    { id: 'platos', label: 'Platos' },
    { id: 'categorias', label: 'Categorías' }
  ]

  const paginatedPedidos = pedidos.slice(
    (page.pedidos - 1) * ITEMS_PER_PAGE,
    page.pedidos * ITEMS_PER_PAGE
  )
  const totalPedidoPages = Math.ceil(pedidos.length / ITEMS_PER_PAGE)

  const paginatedReservas = reservas.slice(
    (page.reservas - 1) * ITEMS_PER_PAGE,
    page.reservas * ITEMS_PER_PAGE
  )
  const totalReservaPages = Math.ceil(reservas.length / ITEMS_PER_PAGE)

  const updatePage = (tab, p) => setPage(prev => ({ ...prev, [tab]: p }))

  return (
    <>
      <Helmet>
        <title>Admin | PetriGastro</title>
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 font-heading">Panel de Administración</h1>

        <div className="flex gap-2 mb-6 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg whitespace-nowrap transition ${
                activeTab === tab.id ? 'bg-accent text-white' : 'bg-bg-secondary'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'pedidos' && (
          <div className="bg-surface rounded-lg shadow overflow-x-auto">
            <table className="w-full">
              <thead className="bg-bg-secondary">
                <tr>
                  <th className="px-4 py-3 text-left">ID</th>
                  <th className="px-4 py-3 text-left">Cliente</th>
                  <th className="px-4 py-3 text-left">Total</th>
                  <th className="px-4 py-3 text-left">Estado</th>
                  <th className="px-4 py-3 text-left">Fecha</th>
                  <th className="px-4 py-3 text-left">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {paginatedPedidos.map(pedido => (
                  <tr key={pedido.id} className="border-t border-border">
                    <td className="px-4 py-3">#{pedido.id}</td>
                    <td className="px-4 py-3">{pedido.usuario?.nombre || 'Cliente'}</td>
                    <td className="px-4 py-3">{pedido.total?.toFixed(2)}€</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs ${
                        pedido.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-800' :
                        pedido.estado === 'confirmado' ? 'bg-blue-100 text-blue-800' :
                        pedido.estado === 'preparado' ? 'bg-purple-100 text-purple-800' :
                        pedido.estado === 'preparando' ? 'bg-orange-100 text-orange-800' :
                        pedido.estado === 'entregado' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {pedido.estado}
                      </span>
                    </td>
                    <td className="px-4 py-3">{new Date(pedido.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3 space-y-1">
                      <select
                        value={pedido.estado}
                        onChange={(e) => updatePedidoMutation.mutate({ id: pedido.id, estado: e.target.value })}
                        className="text-sm border border-border rounded px-2 py-1 bg-bg-secondary w-full"
                      >
                        <option value="pendiente">Pendiente</option>
                        <option value="confirmado">Confirmado</option>
                        <option value="preparando">Preparando</option>
                        <option value="preparado">Preparado</option>
                        <option value="entregado">Entregado</option>
                        <option value="cancelado">Cancelado</option>
                      </select>
                      {pedido.estado === 'preparando' && (
                        <button
                          onClick={() => updatePedidoMutation.mutate({ id: pedido.id, estado: 'preparado' })}
                          className="w-full text-xs px-2 py-1 rounded bg-purple-100 text-purple-800 font-medium hover:bg-purple-200 transition"
                        >
                          ✓ Marcar preparado
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Paginacion currentPage={page.pedidos} totalPages={totalPedidoPages} onPageChange={(p) => updatePage('pedidos', p)} />
          </div>
        )}

        {activeTab === 'reservas' && (
          <div className="bg-surface rounded-lg shadow overflow-x-auto">
            <table className="w-full">
              <thead className="bg-bg-secondary">
                <tr>
                  <th className="px-4 py-3 text-left">Nombre</th>
                  <th className="px-4 py-3 text-left">Teléfono</th>
                  <th className="px-4 py-3 text-left">Fecha</th>
                  <th className="px-4 py-3 text-left">Hora</th>
                  <th className="px-4 py-3 text-left">Personas</th>
                  <th className="px-4 py-3 text-left">Estado</th>
                </tr>
              </thead>
              <tbody>
                {paginatedReservas.map(reserva => (
                  <tr key={reserva.id} className="border-t border-border">
                    <td className="px-4 py-3">{reserva.nombre}</td>
                    <td className="px-4 py-3">{reserva.telefono}</td>
                    <td className="px-4 py-3">{reserva.fecha}</td>
                    <td className="px-4 py-3">{reserva.hora}</td>
                    <td className="px-4 py-3">{reserva.personas}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs ${
                        reserva.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-800' :
                        reserva.estado === 'confirmado' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {reserva.estado}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Paginacion currentPage={page.reservas} totalPages={totalReservaPages} onPageChange={(p) => updatePage('reservas', p)} />
          </div>
        )}

        {activeTab === 'platos' && <PlatosManager />}

        {activeTab === 'categorias' && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categorias.map(cat => (
              <div key={cat.id} className="bg-surface p-4 rounded-lg shadow text-center">
                <span className="text-3xl">{cat.icono}</span>
                <p className="font-semibold mt-2">{cat.nombre}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}

function PlatosManager() {
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [platoPage, setPlatoPage] = useState(1)
  const [form, setForm] = useState({
    nombre: '', descripcion: '', precio: '', categoria_id: '',
    imagen_url: '', disponible: true, destacado: false
  })

  const { data: platos = [], isLoading } = useQuery({
    queryKey: ['platos', 'admin'],
    queryFn: () => platosApi.getAll({ todas: true })
  })

  const { data: categorias = [] } = useQuery({
    queryKey: ['categorias'],
    queryFn: () => categoriasApi.getAll()
  })

  const createMutation = useMutation({
    mutationFn: (data) => platosApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platos'] })
      setShowForm(false)
      setForm({ nombre: '', descripcion: '', precio: '', categoria_id: '', imagen_url: '', disponible: true, destacado: false })
    }
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => platosApi.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['platos'] })
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => platosApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['platos'] })
  })

  const handleCreate = (e) => {
    e.preventDefault()
    createMutation.mutate({
      ...form,
      precio: parseFloat(form.precio),
      categoria_id: parseInt(form.categoria_id)
    })
  }

  const toggleField = (plato, field) => {
    updateMutation.mutate({ id: plato.id, data: { ...plato, [field]: !plato[field] } })
  }

  const paginatedPlatos = platos.slice(
    (platoPage - 1) * ITEMS_PER_PAGE,
    platoPage * ITEMS_PER_PAGE
  )
  const totalPlatoPages = Math.ceil(platos.length / ITEMS_PER_PAGE)

  if (isLoading) {
    return <div className="flex items-center justify-center py-12"><Loader2 className="animate-spin text-accent" size={40} /></div>
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold font-heading">Gestión de Platos</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 rounded-lg bg-accent text-white font-medium hover:opacity-90 transition"
        >
          {showForm ? 'Cancelar' : 'Nuevo Plato'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-surface p-6 rounded-lg shadow mb-8 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nombre *</label>
              <input type="text" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-lg bg-bg-secondary" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Precio *</label>
              <input type="number" step="0.01" min="0" value={form.precio} onChange={(e) => setForm({ ...form, precio: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-lg bg-bg-secondary" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Categoría *</label>
              <select value={form.categoria_id} onChange={(e) => setForm({ ...form, categoria_id: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-lg bg-bg-secondary" required>
                <option value="">Seleccionar</option>
                {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Descripción</label>
              <textarea value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-lg bg-bg-secondary" rows={2} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">URL Imagen</label>
              <input type="url" value={form.imagen_url} onChange={(e) => setForm({ ...form, imagen_url: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-lg bg-bg-secondary" />
            </div>
            <div className="flex items-end gap-6 pb-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.disponible} onChange={(e) => setForm({ ...form, disponible: e.target.checked })}
                  className="w-4 h-4 rounded border-border accent-accent" />
                <span className="text-sm font-medium">Disponible</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.destacado} onChange={(e) => setForm({ ...form, destacado: e.target.checked })}
                  className="w-4 h-4 rounded border-border accent-accent" />
                <span className="text-sm font-medium">Destacado</span>
              </label>
            </div>
          </div>
          <button type="submit" disabled={createMutation.isPending}
            className="px-6 py-2 rounded-lg bg-accent text-white font-medium hover:opacity-90 transition disabled:opacity-50">
            {createMutation.isPending ? 'Creando...' : 'Crear Plato'}
          </button>
        </form>
      )}

      <div className="bg-surface rounded-lg shadow overflow-x-auto">
        <table className="w-full">
          <thead className="bg-bg-secondary">
            <tr>
              <th className="px-4 py-3 text-left">ID</th>
              <th className="px-4 py-3 text-left">Nombre</th>
              <th className="px-4 py-3 text-left">Categoría</th>
              <th className="px-4 py-3 text-left">Precio</th>
              <th className="px-4 py-3 text-center">Disponible</th>
              <th className="px-4 py-3 text-center">Destacado</th>
              <th className="px-4 py-3 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {paginatedPlatos.map(plato => (
              <tr key={plato.id} className="border-t border-border">
                <td className="px-4 py-3">#{plato.id}</td>
                <td className="px-4 py-3 font-medium">{plato.nombre}</td>
                <td className="px-4 py-3 text-text-muted">{plato.categoria || '-'}</td>
                <td className="px-4 py-3">{plato.precio?.toFixed(2)}€</td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => toggleField(plato, 'disponible')}
                    className={`w-8 h-5 rounded-full transition relative ${plato.disponible ? 'bg-accent' : 'bg-text-muted'}`}
                    title={plato.disponible ? 'Disponible' : 'No disponible'}
                  >
                    <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition ${plato.disponible ? 'left-4' : 'left-0.5'}`} />
                  </button>
                </td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => toggleField(plato, 'destacado')}
                    className={`w-8 h-5 rounded-full transition relative ${plato.destacado ? 'bg-accent' : 'bg-text-muted'}`}
                    title={plato.destacado ? 'Destacado' : 'No destacado'}
                  >
                    <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition ${plato.destacado ? 'left-4' : 'left-0.5'}`} />
                  </button>
                </td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => { if (confirm('¿Eliminar este plato?')) deleteMutation.mutate(plato.id) }}
                    className="text-error hover:opacity-80 transition text-sm"
                    disabled={deleteMutation.isPending}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Paginacion currentPage={platoPage} totalPages={totalPlatoPages} onPageChange={setPlatoPage} />
        {platos.length === 0 && !isLoading && (
          <p className="text-center py-8 text-text-muted">No hay platos registrados.</p>
        )}
      </div>
    </div>
  )
}