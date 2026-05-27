import { useState, Fragment } from 'react'
import { Loader2 } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Helmet } from 'react-helmet-async'
import { useAuth } from '../context/AuthContext'
import { pedidosApi, categoriasApi, usuariosApi } from '../services/api'
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

  const paginatedPedidos = pedidos

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
          <div className="bg-surface rounded-lg shadow overflow-x-auto overscroll-x-contain">
            <table className="w-full responsive-table">
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
                  <Fragment key={pedido.id}>
                    <tr className="border-t border-border">
                      <td className="px-4 py-3" data-label="ID">#{pedido.id}</td>
                      <td className="px-4 py-3" data-label="Cliente">{pedido.usuario_nombre || 'Cliente'}</td>
                      <td className="px-4 py-3" data-label="Total">{Number(pedido.total || 0).toFixed(2)}€</td>
                      <td className="px-4 py-3" data-label="Estado">
                        <span className={`px-2 py-1 rounded text-xs ${getEstadoColor(pedido.estado)}`}>
                          {pedido.estado}
                        </span>
                      </td>
                      <td className="px-4 py-3" data-label="Recogida">
                        {pedido.fecha_recogida ? (
                          <span className="text-carbon font-medium">
                            {new Date(pedido.fecha_recogida).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })}
                          </span>
                        ) : <span className="text-text-muted">-</span>}
                      </td>
                      <td className="px-4 py-3 text-text-muted text-sm" data-label="Pedido">{new Date(pedido.created_at).toLocaleDateString()}</td>
                      <td className="px-4 py-3 space-y-1" data-label="Acciones">
                        <select
                          value={pedido.estado}
                          onChange={(e) => updatePedidoMutation.mutate({ id: pedido.id, estado: e.target.value })}
                          className="text-sm border border-border rounded px-2 py-1 bg-bg-secondary w-full"
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
                            className="w-full text-xs px-2 py-1 rounded bg-purple-100 text-purple-800 font-medium hover:bg-purple-200 transition"
                          >
                            ✓ Marcar preparado
                          </button>
                        )}
                      </td>
                    </tr>
                    {pedido.items && pedido.items.length > 0 && (
                      <tr className="bg-bg-secondary">
                        <td colSpan={7} className="px-6 py-3">
                          <div className="text-sm">
                            <p className="font-medium mb-2 text-carbon">Platos del pedido:</p>
                            <table className="w-full text-xs">
                              <thead>
                                <tr className="border-b border-border">
                                  <th className="text-left py-1 pr-4 text-text-muted">Plato</th>
                                  <th className="text-right py-1 px-4 text-text-muted">Cant.</th>
                                  <th className="text-right py-1 px-4 text-text-muted">Precio ud.</th>
                                  <th className="text-right py-1 pl-4 text-text-muted">Subtotal</th>
                                </tr>
                              </thead>
                              <tbody>
                                {pedido.items.map((item: { nombre: string; cantidad: number; precio_unitario: string }, idx: number) => (
                                  <tr key={idx} className="border-b border-border/50">
                                    <td className="py-1 pr-4 text-carbon">{item.nombre}</td>
                                    <td className="text-right py-1 px-4 text-carbon">x{item.cantidad}</td>
                                    <td className="text-right py-1 px-4 text-carbon">{Number(item.precio_unitario).toFixed(2)}€</td>
                                    <td className="text-right py-1 pl-4 text-carbon font-medium">{(item.cantidad * Number(item.precio_unitario)).toFixed(2)}€</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
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

