import { useState } from 'react'
import { Loader2, Plus, Trash2, Calendar, X } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Helmet } from 'react-helmet-async'
import { useAuth } from '../context/AuthContext'
import { platosApi, pedidosApi, categoriasApi, fechasApi, configApi, uploadApi } from '../services/api'

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
  const [page, setPage] = useState({ pedidos: 1, platos: 1, fechas: 1 })

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
    { id: 'stats', label: 'Estadísticas' },
    { id: 'fechas', label: 'Fechas' },
    { id: 'platos', label: 'Platos' },
    { id: 'categorias', label: 'Categorías' }
  ]

  const paginatedPedidos = pedidos.slice(
    (page.pedidos - 1) * ITEMS_PER_PAGE,
    page.pedidos * ITEMS_PER_PAGE
  )
  const totalPedidoPages = Math.ceil(pedidos.length / ITEMS_PER_PAGE)

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
                  <th className="px-4 py-3 text-left">Recogida</th>
                  <th className="px-4 py-3 text-left">Pedido</th>
                  <th className="px-4 py-3 text-left">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {paginatedPedidos.map(pedido => (
                  <tr key={pedido.id} className="border-t border-border">
                    <td className="px-4 py-3">#{pedido.id}</td>
                    <td className="px-4 py-3">{pedido.usuario_nombre || 'Cliente'}</td>
                    <td className="px-4 py-3">{Number(pedido.total || 0).toFixed(2)}€</td>
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
                    <td className="px-4 py-3">
                      {pedido.fecha_recogida ? (
                        <span className="text-accent font-medium">
                          {new Date(pedido.fecha_recogida).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })}
                        </span>
                      ) : <span className="text-text-muted">-</span>}
                    </td>
                    <td className="px-4 py-3 text-text-muted text-sm">{new Date(pedido.created_at).toLocaleDateString()}</td>
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

        {activeTab === 'stats' && <StatsManager />}

        {activeTab === 'fechas' && <FechasManager />}

        {activeTab === 'platos' && <PlatosManager />}

        {activeTab === 'categorias' && <CategoriasManager />}
      </div>
    </>
  )
}

function StatsManager() {
  const [statsFilter, setStatsFilter] = useState('all')

  const { data, isLoading } = useQuery({
    queryKey: ['pedidosStats', statsFilter],
    queryFn: () => pedidosApi.getStats(statsFilter === 'all' ? undefined : statsFilter)
  })

  if (isLoading) {
    return <div className="flex items-center justify-center py-12"><Loader2 className="animate-spin text-accent" size={40} /></div>
  }

  const { platos = [], totales = { pedidos: 0, ingresos: 0 } } = data || {}

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-surface p-6 rounded-lg shadow text-center">
          <div className="text-3xl font-bold text-accent">{totales.pedidos}</div>
          <div className="text-text-muted">Pedidos Totales</div>
        </div>
        <div className="bg-surface p-6 rounded-lg shadow text-center">
          <div className="text-3xl font-bold text-accent">{Number(totales.ingresos || 0).toFixed(2)}€</div>
          <div className="text-text-muted">Ingresos Totales</div>
        </div>
        <div className="bg-surface p-6 rounded-lg shadow text-center">
          <div className="text-3xl font-bold text-accent">{platos.length}</div>
          <div className="text-text-muted">Platos diferentes</div>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <label className="text-sm font-medium">Filtrar por estado:</label>
        <select
          value={statsFilter}
          onChange={(e) => setStatsFilter(e.target.value)}
          className="px-3 py-2 border border-border rounded-lg bg-bg-secondary"
        >
          <option value="all">Todos</option>
          <option value="pendientes">Sin preparar (pendiente, confirmado, preparando, preparado)</option>
          <option value="terminados">Terminados (entregado)</option>
        </select>
      </div>

      <h2 className="text-2xl font-bold font-heading mb-6">Platos más pedidos</h2>

      <div className="bg-surface rounded-lg shadow overflow-x-auto">
        <table className="w-full">
          <thead className="bg-bg-secondary">
            <tr>
              <th className="px-4 py-3 text-left">Plato</th>
              <th className="px-4 py-3 text-center">Veces pedido</th>
              <th className="px-4 py-3 text-center">Cantidad total</th>
              <th className="px-4 py-3 text-right">Precio</th>
              <th className="px-4 py-3 text-right">Ingresos</th>
            </tr>
          </thead>
          <tbody>
            {platos.map((plato: any) => (
              <tr key={plato.id} className="border-t border-border">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {plato.imagen_url ? (
                      <img src={plato.imagen_url} alt={plato.nombre} className="w-10 h-10 rounded object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded bg-bg-secondary flex items-center justify-center">🍽️</div>
                    )}
                    <span className="font-medium">{plato.nombre}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-center">{plato.num_pedidos}</td>
                <td className="px-4 py-3 text-center">
                  <span className="inline-flex items-center px-2 py-1 rounded-full bg-accent/20 text-accent font-medium">
                    {plato.total_vendido} uds
                  </span>
                </td>
                <td className="px-4 py-3 text-right">{Number(plato.precio || 0).toFixed(2)}€</td>
                <td className="px-4 py-3 text-right font-medium text-accent">
                  {(plato.total_vendido * Number(plato.precio)).toFixed(2)}€
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {platos.length === 0 && (
          <p className="text-center py-8 text-text-muted">No hay pedidos todavía.</p>
        )}
      </div>
    </div>
  )
}

function FechasManager() {
  const queryClient = useQueryClient()
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingFecha, setEditingFecha] = useState<any>(null)
  const [showAllFechas, setShowAllFechas] = useState(false)
  const [newFecha, setNewFecha] = useState({ fecha: '', horarios: ['12:00', '13:00', '19:00', '20:00', '21:00'] })

  const { data: fechas = [], isLoading: loadingFechas } = useQuery({
    queryKey: ['fechas'],
    queryFn: fechasApi.getAll
  })

  const createFechaMutation = useMutation({
    mutationFn: ({ fecha, horarios }: { fecha: string; horarios: string[] }) => 
      fechasApi.create(fecha, horarios),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fechas'] })
      setShowAddForm(false)
      setNewFecha({ fecha: '', horarios: ['12:00', '13:00', '19:00', '20:00', '21:00'] })
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || 'Error al crear la fecha')
    }
  })

  const updateFechaMutation = useMutation({
    mutationFn: ({ id, activo, horarios }: { id: number; activo: boolean; horarios: { hora: string }[] }) => 
      fechasApi.update(id, activo, horarios),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fechas'] })
      setEditingFecha(null)
    }
  })

  const toggleFechaMutation = useMutation({
    mutationFn: ({ id, activo }: { id: number; activo: boolean }) => 
      fechasApi.toggleActivo(id, activo),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['fechas'] })
  })

  const deleteFechaMutation = useMutation({
    mutationFn: (id: number) => fechasApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['fechas'] })
  })

  const availableHours = ['11:00', '12:00', '13:00', '14:00', '19:00', '20:00', '21:00', '22:00']

  const handleAddFecha = (e: React.FormEvent) => {
    e.preventDefault()
    createFechaMutation.mutate({ fecha: newFecha.fecha, horarios: newFecha.horarios })
  }

  const handleEditFecha = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingFecha) return
    updateFechaMutation.mutate({
      id: editingFecha.id,
      activo: editingFecha.activo,
      horarios: editingFecha.horarios.map((h: string) => ({ hora: h }))
    })
  }

  const toggleHorarioInNewFecha = (hora: string) => {
    setNewFecha(prev => ({
      ...prev,
      horarios: prev.horarios.includes(hora)
        ? prev.horarios.filter(h => h !== hora)
        : [...prev.horarios, hora].sort()
    }))
  }

  const toggleHorarioInEdit = (hora: string) => {
    if (!editingFecha) return
    setEditingFecha(prev => ({
      ...prev,
      horarios: prev.horarios.includes(hora)
        ? prev.horarios.filter((h: string) => h !== hora)
        : [...prev.horarios, hora].sort()
    }))
  }

  if (loadingFechas) {
    return <div className="flex items-center justify-center py-12"><Loader2 className="animate-spin text-accent" size={40} /></div>
  }

  const fechasFiltradas = showAllFechas ? fechas : fechas.filter(f => f.activo)

  return (
    <div>
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <h2 className="text-2xl font-bold font-heading">Gestión de Fechas</h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 rounded-lg bg-accent text-white font-medium hover:opacity-90 transition flex items-center gap-2"
        >
          <Plus size={20} />
          {showAddForm ? 'Cancelar' : 'Añadir Fecha'}
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAddFecha} className="bg-surface p-6 rounded-lg shadow mb-6 space-y-4">
          <h3 className="text-lg font-semibold">Nueva fecha disponible</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Fecha *</label>
              <input
                type="date"
                value={newFecha.fecha}
                onChange={(e) => setNewFecha({ ...newFecha, fecha: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 border border-border rounded-lg bg-bg-secondary"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Horarios disponibles</label>
              <div className="flex flex-wrap gap-2">
                {availableHours.map(hora => (
                  <button
                    key={hora}
                    type="button"
                    onClick={() => toggleHorarioInNewFecha(hora)}
                    className={`px-3 py-1.5 rounded-lg text-sm transition ${
                      newFecha.horarios.includes(hora)
                        ? 'bg-accent text-white'
                        : 'bg-bg-secondary text-text-muted'
                    }`}
                  >
                    {hora}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <button
            type="submit"
            disabled={createFechaMutation.isPending || newFecha.horarios.length === 0}
            className="px-6 py-2 rounded-lg bg-accent text-white font-medium hover:opacity-90 transition disabled:opacity-50"
          >
            {createFechaMutation.isPending ? 'Creando...' : 'Crear Fecha'}
          </button>
        </form>
      )}

      <div className="bg-surface p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">
            Fechas disponibles ({fechasFiltradas.length})
          </h3>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showAllFechas}
              onChange={(e) => setShowAllFechas(e.target.checked)}
              className="w-4 h-4 rounded border-border accent-accent"
            />
            <span className="text-sm">Ver inactivas</span>
          </label>
        </div>

        {fechasFiltradas.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-text-muted mb-4">No hay fechas disponibles.</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="text-accent hover:underline"
            >
              Añadir primera fecha
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {fechasFiltradas.map(fecha => (
              <div key={fecha.id} className={`p-4 rounded-lg border ${fecha.activo ? 'border-accent' : 'border-border opacity-60'}`}>
                {editingFecha?.id === fecha.id ? (
                  <form onSubmit={handleEditFecha} className="space-y-3">
                    <div className="flex justify-between items-center">
                      <h4 className="font-bold text-accent">
                        {new Date(fecha.fecha).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                      </h4>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingFecha(null)}
                          className="px-3 py-1 rounded bg-bg-secondary text-sm"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          disabled={updateFechaMutation.isPending || editingFecha.horarios.length === 0}
                          className="px-3 py-1 rounded bg-accent text-white text-sm disabled:opacity-50"
                        >
                          Guardar
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {availableHours.map(hora => (
                        <button
                          key={hora}
                          type="button"
                          onClick={() => toggleHorarioInEdit(hora)}
                          className={`px-3 py-1.5 rounded-lg text-sm transition ${
                            editingFecha.horarios.includes(hora)
                              ? 'bg-accent text-white'
                              : 'bg-bg-secondary text-text-muted'
                          }`}
                        >
                          {hora}
                        </button>
                      ))}
                    </div>
                  </form>
                ) : (
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className={`font-bold ${fecha.activo ? 'text-accent' : 'text-text-muted'}`}>
                        {new Date(fecha.fecha).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                      </h4>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {fecha.horarios?.map((h: any) => (
                          <span
                            key={h.id || h.hora}
                            className={`px-2 py-0.5 rounded text-xs ${
                              h.disponible 
                                ? 'bg-accent/20 text-accent' 
                                : 'bg-gray-100 text-gray-400'
                            }`}
                          >
                            {h.hora}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => setEditingFecha({
                          id: fecha.id,
                          activo: fecha.activo,
                          horarios: fecha.horarios?.map((h: any) => h.hora) || []
                        })}
                        className="p-2 rounded hover:bg-bg-secondary text-text-muted hover:text-accent"
                        title="Editar horarios"
                      >
                        <X size={18} />
                      </button>
                      <button
                        onClick={() => toggleFechaMutation.mutate({ id: fecha.id, activo: !fecha.activo })}
                        className={`px-3 py-1 rounded text-xs font-medium ${
                          fecha.activo
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        }`}
                      >
                        {fecha.activo ? '✓ Activo' : '○ Inactivo'}
                      </button>
                      <button
                        onClick={() => { if (confirm('¿Eliminar esta fecha?')) deleteFechaMutation.mutate(fecha.id) }}
                        className="p-2 rounded hover:bg-error/10 text-error"
                        title="Eliminar"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-sm text-blue-800">
          <strong>Nota:</strong> Las fechas inactivas no serán visibles para los clientes. 
          Solo las fechas activas con al menos un horario disponible aparecerán en la selección de pedido.
        </p>
      </div>
    </div>
  )
}

function CategoriasManager() {
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ nombre: '', icono: '🍽️', orden: 0 })

  const { data: categorias = [], isLoading } = useQuery({
    queryKey: ['categorias'],
    queryFn: () => categoriasApi.getAll()
  })

  const createMutation = useMutation({
    mutationFn: (data) => categoriasApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categorias'] })
      setShowForm(false)
      setForm({ nombre: '', icono: '🍽️', orden: 0 })
    }
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => categoriasApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categorias'] })
  })

  const handleCreate = (e) => {
    e.preventDefault()
    createMutation.mutate(form)
  }

  if (isLoading) {
    return <div className="flex items-center justify-center py-12"><Loader2 className="animate-spin text-accent" size={40} /></div>
  }

  const iconos = ['🍽️', '🍕', '🍔', '🌮', '🍣', '🥗', '🍷', '☕', '🍰', '🥘']

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold font-heading">Gestión de Categorías</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 rounded-lg bg-accent text-white font-medium hover:opacity-90 transition flex items-center gap-2"
        >
          <Plus size={20} />
          {showForm ? 'Cancelar' : 'Nueva Categoría'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-surface p-6 rounded-lg shadow mb-8 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nombre *</label>
              <input
                type="text"
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-lg bg-bg-secondary"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Icono</label>
              <div className="flex flex-wrap gap-2">
                {iconos.map(icono => (
                  <button
                    key={icono}
                    type="button"
                    onClick={() => setForm({ ...form, icono })}
                    className={`w-10 h-10 rounded-lg text-xl flex items-center justify-center transition ${
                      form.icono === icono ? 'bg-accent' : 'bg-bg-secondary hover:bg-border'
                    }`}
                  >
                    {icono}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Orden</label>
              <input
                type="number"
                value={form.orden}
                onChange={(e) => setForm({ ...form, orden: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-border rounded-lg bg-bg-secondary"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={createMutation.isPending || !form.nombre}
            className="px-6 py-2 rounded-lg bg-accent text-white font-medium hover:opacity-90 transition disabled:opacity-50"
          >
            {createMutation.isPending ? 'Creando...' : 'Crear Categoría'}
          </button>
        </form>
      )}

      <div className="bg-surface rounded-lg shadow overflow-x-auto">
        <table className="w-full">
          <thead className="bg-bg-secondary">
            <tr>
              <th className="px-4 py-3 text-left">Icono</th>
              <th className="px-4 py-3 text-left">Nombre</th>
              <th className="px-4 py-3 text-left">Orden</th>
              <th className="px-4 py-3 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {categorias.map(cat => (
              <tr key={cat.id} className="border-t border-border">
                <td className="px-4 py-3 text-2xl">{cat.icono}</td>
                <td className="px-4 py-3 font-medium">{cat.nombre}</td>
                <td className="px-4 py-3 text-text-muted">{cat.orden || 0}</td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => { if (confirm('¿Eliminar esta categoría?')) deleteMutation.mutate(cat.id) }}
                    className="text-error hover:opacity-80 transition"
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 size={20} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {categorias.length === 0 && !isLoading && (
          <p className="text-center py-8 text-text-muted">No hay categorías registradas.</p>
        )}
      </div>
    </div>
  )
}

function PlatosManager() {
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [platoPage, setPlatoPage] = useState(1)
  const [uploading, setUploading] = useState(false)
  const [previewImg, setPreviewImg] = useState('')
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

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      setPreviewImg(event.target?.result as string)
    }
    reader.readAsDataURL(file)

    setUploading(true)
    try {
      const result = await uploadApi.imagen(file)
      setForm(prev => ({ ...prev, imagen_url: result.url }))
    } catch (error) {
      alert('Error al subir la imagen')
    }
    setUploading(false)
  }

  const createMutation = useMutation({
    mutationFn: (data) => platosApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platos'] })
      setShowForm(false)
      setForm({ nombre: '', descripcion: '', precio: '', categoria_id: '', imagen_url: '', disponible: true, destacado: false })
      setPreviewImg('')
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
              <label className="block text-sm font-medium mb-1">Imagen</label>
              <input 
                type="file" 
                accept="image/*"
                onChange={handleImageSelect}
                className="w-full px-3 py-2 border border-border rounded-lg bg-bg-secondary file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-accent file:text-white file:cursor-pointer"
              />
              {(previewImg || form.imagen_url) && (
                <div className="mt-2 relative w-24 h-24 rounded-lg overflow-hidden border border-border">
                  <img 
                    src={previewImg || form.imagen_url} 
                    alt="Preview" 
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => { setForm({ ...form, imagen_url: '' }); setPreviewImg('') }}
                    className="absolute top-1 right-1 bg-error text-white rounded-full p-1 hover:opacity-90"
                  >
                    <X size={12} />
                  </button>
                </div>
              )}
              {uploading && <p className="text-sm text-text-muted mt-1">Subiendo imagen...</p>}
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
                <td className="px-4 py-3">{Number(plato.precio || 0).toFixed(2)}€</td>
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