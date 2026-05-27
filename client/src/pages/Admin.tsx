import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Helmet } from 'react-helmet-async'
import { useAuth } from '../context/AuthContext'
import { pedidosApi, usuariosApi } from '../services/api'
import { getEstadoColor } from '../utils/estadoPedido'
import { Paginacion } from '../components/admin/Paginacion'
import { StatsManager } from '../components/admin/StatsManager'
import { FechasManager } from '../components/admin/FechasManager'
import { PlatosManager } from '../components/admin/PlatosManager'
import { CategoriasManager } from '../components/admin/CategoriasManager'
import { UsuariosManager } from '../components/admin/UsuariosManager'
import { SolicitudesManager } from '../components/admin/SolicitudesManager'

const ITEMS_PER_PAGE = 10

export default function Admin() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState('pedidos')
  const [pedidoPage, setPedidoPage] = useState(1)


  if (!user || user.rol !== 'admin') {
    return (
      <div className="text-center py-12" role="alert">
        <h1 className="text-2xl font-bold">Acceso denegado</h1>
        <p className="mt-2">No tienes permisos para acceder a esta página.</p>
      </div>
    )
  }

  const { data: pedidosResp = { data: [], pagination: { total: 0, totalPages: 0 } } } = useQuery({
    queryKey: ['pedidos', pedidoPage],
    queryFn: () => pedidosApi.getAll({ page: pedidoPage, limit: ITEMS_PER_PAGE }),
    refetchInterval: 120000
  })

  const pedidos = pedidosResp.data || []
  const totalPedidoPages = pedidosResp.pagination?.totalPages || 0

  const { data: solicitudes = [] } = useQuery({
    queryKey: ['solicitudes'],
    queryFn: usuariosApi.getSolicitudes,
    refetchInterval: 120000
  })

  const updatePedidoMutation = useMutation({
    mutationFn: ({ id, estado }: { id: number; estado: string }) => pedidosApi.updateEstado(id, estado),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pedidos'] })
      queryClient.invalidateQueries({ queryKey: ['misPedidos'] })
    }
  })

  const solicitudesPendientes = solicitudes.length

  const tabs = [
    { id: 'pedidos', label: 'Pedidos' },
    { id: 'stats', label: 'Estadísticas' },
    { id: 'fechas', label: 'Fechas' },
    { id: 'platos', label: 'Platos' },
    { id: 'categorias', label: 'Categorías' },
    { id: 'usuarios', label: 'Usuarios' },
    { id: 'solicitudes', label: `Solicitudes${solicitudesPendientes > 0 ? ` (${solicitudesPendientes})` : ''}` }
  ]

  const [pedidoExpandido, setPedidoExpandido] = useState<number | null>(null)

  return (
    <>
      <Helmet>
        <title>Admin | PetriGastro</title>
        <meta name="description" content="Panel de administración de PetriGastro. Gestiona pedidos, platos, categorías y solicitudes de acceso." />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 font-heading">Panel de Administración</h1>

        <div className="flex gap-2 mb-6 overflow-x-auto overscroll-x-contain snap-x snap-mandatory" role="tablist" aria-label="Secciones de administración">
          {tabs.map(tab => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg whitespace-nowrap transition ${
                activeTab === tab.id ? 'bg-accent text-carbon' : 'bg-bg-secondary'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'pedidos' && (
          <div className="space-y-4">
            {pedidos.map(pedido => {
              const expandido = pedidoExpandido === pedido.id
              return (
                <div
                  key={pedido.id}
                  className="bg-card dark:bg-zinc-700 rounded-xl shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="p-4 sm:p-5">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                      <div className="flex items-center gap-3 sm:min-w-0 sm:flex-1">
                        <span className="text-xs font-bold text-text-muted uppercase tracking-wider">#{pedido.id}</span>
                        <div className="hidden sm:block text-sm text-text-muted truncate">{pedido.usuario_nombre || 'Cliente'}</div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                        <span className="font-bold text-carbon">{Number(pedido.total || 0).toFixed(2)}€</span>
                        <span className={`px-2.5 py-0.5 rounded text-xs font-semibold ${getEstadoColor(pedido.estado)}`}>
                          {pedido.estado}
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-text-muted">
                      <span className="sm:hidden">{pedido.usuario_nombre || 'Cliente'}</span>
                      {pedido.fecha_recogida ? (
                        <span>
                          Recogida:{' '}
                          {new Date(pedido.fecha_recogida).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })}
                        </span>
                      ) : (
                        <span>Recogida: -</span>
                      )}
                      <span>Pedido: {new Date(pedido.created_at).toLocaleDateString()}</span>
                    </div>

                    <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                      <select
                        value={pedido.estado}
                        onChange={(e) => updatePedidoMutation.mutate({ id: pedido.id, estado: e.target.value })}
                        className="text-sm border border-border rounded-lg px-3 py-1.5 bg-bg-secondary w-full sm:w-auto"
                        aria-label={`Estado del pedido #${pedido.id}`}
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
                          className="text-xs px-3 py-1.5 rounded-lg bg-purple-100 text-purple-800 font-medium hover:bg-purple-200 transition w-full sm:w-auto"
                        >
                          ✓ Marcar preparado
                        </button>
                      )}
                      {pedido.items && pedido.items.length > 0 && (
                        <button
                          onClick={() => setPedidoExpandido(expandido ? null : pedido.id)}
                          className="ml-auto text-xs text-text-muted hover:text-carbon transition flex items-center gap-1"
                        >
                          {expandido ? 'Ocultar platos' : 'Ver platos'}
                          {expandido ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>
                      )}
                    </div>
                  </div>

                  {expandido && pedido.items && pedido.items.length > 0 && (
                    <div className="border-t border-border px-4 sm:px-5 py-4 bg-bg-tertiary/50 rounded-b-xl">
                      <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">Platos del pedido</p>
                      <div className="space-y-2">
                        {pedido.items.map((item: { nombre: string; cantidad: number; precio_unitario: string }, idx: number) => (
                          <div key={idx} className="flex items-center justify-between text-sm bg-surface rounded-lg px-3 py-2 border border-border/50">
                            <span className="font-medium text-carbon truncate flex-1">{item.nombre}</span>
                            <div className="flex items-center gap-4 ml-2 flex-shrink-0">
                              <span className="text-text-muted text-xs">x{item.cantidad}</span>
                              <span className="text-carbon font-medium w-16 text-right">{Number(item.precio_unitario).toFixed(2)}€</span>
                              <span className="text-carbon font-bold w-16 text-right">{(item.cantidad * Number(item.precio_unitario)).toFixed(2)}€</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
            {pedidos.length === 0 && (
              <div className="text-center py-12 text-text-muted">No hay pedidos.</div>
            )}
            <Paginacion currentPage={pedidoPage} totalPages={totalPedidoPages} onPageChange={setPedidoPage} />
          </div>
        )}

        {activeTab === 'stats' && <StatsManager />}

        {activeTab === 'fechas' && <FechasManager />}

        {activeTab === 'platos' && <PlatosManager />}

        {activeTab === 'categorias' && <CategoriasManager />}

        {activeTab === 'usuarios' && <UsuariosManager />}

        {activeTab === 'solicitudes' && <SolicitudesManager />}
      </div>
    </>
  )
}

