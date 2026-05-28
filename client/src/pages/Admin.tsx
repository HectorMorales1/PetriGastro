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
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pedidos.map(pedido => {
                const expandido = pedidoExpandido === pedido.id
                return (
                  <div key={pedido.id} className="bg-card rounded-lg shadow p-4 space-y-3">
                    <div
                      className="flex items-center justify-center gap-6 cursor-pointer select-none"
                      onClick={() => setPedidoExpandido(expandido ? null : pedido.id)}
                    >
                      <span className="font-bold text-text-muted uppercase shrink-0">#{pedido.id}</span>
                      <span className={`px-3 py-1 rounded text-sm font-semibold ${getEstadoColor(pedido.estado)}`}>
                        {pedido.estado}
                      </span>
                      <span className="text-sm text-text-muted text-center leading-snug">
                        <div className="font-medium text-carbon">{pedido.fecha_recogida
                          ? new Date(pedido.fecha_recogida).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
                          : '-'}</div>
                        {pedido.notas?.startsWith('Recoger a las ') && (
                          <div className="text-text-muted">
                            {pedido.notas.replace('Recoger a las ', '').slice(0, 5)}
                          </div>
                        )}
                      </span>
                    </div>

                    {expandido && (
                      <div className="pt-3 border-t border-border space-y-3">
                        <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
                          <div>
                            <span className="text-text-muted text-xs">Cliente</span>
                            <p className="font-medium">{pedido.usuario_nombre || 'Cliente'}</p>
                          </div>
                          <div>
                            <span className="text-text-muted text-xs">Total</span>
                            <p className="font-bold text-carbon">{Number(pedido.total || 0).toFixed(2)}€</p>
                          </div>
                          <div>
                            <span className="text-text-muted text-xs">Fecha pedido</span>
                            <p>{new Date(pedido.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                          </div>
                          <div>
                            <span className="text-text-muted text-xs">Recogida</span>
                            <p>{pedido.fecha_recogida
                              ? `${new Date(pedido.fecha_recogida).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })} ${pedido.notas?.startsWith('Recoger a las ') ? pedido.notas.replace('Recoger a las ', '').slice(0, 5) : ''}`
                              : '-'}</p>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <select
                            value={pedido.estado}
                            onChange={(e) => updatePedidoMutation.mutate({ id: pedido.id, estado: e.target.value })}
                            className="text-xs border border-border rounded-lg px-3 py-2 bg-bg-secondary flex-1 min-w-[140px]"
                            aria-label={`Estado del pedido #${pedido.id}`}
                            onClick={(e) => e.stopPropagation()}
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
                              onClick={(e) => { e.stopPropagation(); updatePedidoMutation.mutate({ id: pedido.id, estado: 'preparado' }) }}
                              className="text-xs px-4 py-2 rounded-lg bg-purple-100 text-purple-800 font-medium hover:bg-purple-200 transition whitespace-nowrap"
                            >
                              ✓ Preparado
                            </button>
                          )}
                          <button
                            onClick={(e) => { e.stopPropagation(); setPedidoExpandido(expandido ? null : pedido.id) }}
                            className="text-xs text-text-muted hover:text-carbon transition flex items-center gap-1"
                          >
                            {expandido ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          </button>
                        </div>

                        {pedido.items && pedido.items.length > 0 && (
                          <div className="space-y-1">
                            <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">Platos ({pedido.items.length})</p>
                            {pedido.items.map((item: { nombre: string; cantidad: number; precio_unitario: string }, idx: number) => (
                              <div key={idx} className="flex items-center justify-between text-xs bg-bg-tertiary rounded-lg px-3 py-2">
                                <span className="font-medium text-carbon truncate flex-1">{item.nombre}</span>
                                <span className="text-text-muted shrink-0 ml-2">x{item.cantidad} · {(item.cantidad * Number(item.precio_unitario)).toFixed(2)}€</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
            {pedidos.length === 0 && (
              <div className="text-center py-12 text-text-muted">No hay pedidos.</div>
            )}
            <Paginacion currentPage={pedidoPage} totalPages={totalPedidoPages} onPageChange={setPedidoPage} />
          </>
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

