import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { pedidosApi } from '../../services/api'

export function StatsManager() {
  const [statsFilter, setStatsFilter] = useState('all')

  const { data, isLoading } = useQuery({
    queryKey: ['pedidosStats', statsFilter],
    queryFn: () => pedidosApi.getStats(statsFilter === 'all' ? undefined : statsFilter)
  })

  if (isLoading) {
    return <div className="flex items-center justify-center py-12" role="status" aria-live="polite"><Loader2 className="animate-spin text-accent" size={40} /><span className="sr-only">Cargando estadísticas...</span></div>
  }

  const { platos = [], totales = { pedidos: 0, ingresos: 0 } } = data || {}

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-card p-6 rounded-lg shadow text-center">
          <div className="text-3xl font-bold text-carbon">{totales.pedidos}</div>
          <div className="text-text-muted">Pedidos Totales</div>
        </div>
        <div className="bg-card p-6 rounded-lg shadow text-center">
          <div className="text-3xl font-bold text-carbon">{Number(totales.ingresos || 0).toFixed(2)}€</div>
          <div className="text-text-muted">Ingresos Totales</div>
        </div>
        <div className="bg-card p-6 rounded-lg shadow text-center">
          <div className="text-3xl font-bold text-carbon">{platos.length}</div>
          <div className="text-text-muted">Platos diferentes</div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 mb-6">
        <label className="text-sm font-medium whitespace-nowrap">Filtrar por estado:</label>
        <select
          value={statsFilter}
          onChange={(e) => setStatsFilter(e.target.value)}
          className="w-full sm:w-auto px-3 py-2 border border-border rounded-lg bg-bg-secondary text-sm"
        >
          <option value="all">Todos</option>
          <option value="pendientes">Sin preparar</option>
          <option value="terminados">Terminados</option>
        </select>
      </div>

      <h2 className="text-2xl font-bold font-heading mb-6">Platos más pedidos</h2>

      <div className="grid grid-cols-1 gap-4 mx-auto max-w-4xl">
        {platos.map((plato: { id: number; imagen_url: string; nombre: string; precio: number; total_vendido: number; num_pedidos: number }) => (
          <div key={plato.id} className="bg-card rounded-lg shadow p-4 md:p-3 space-y-3 md:space-y-0 md:grid md:grid-cols-[minmax(180px,1fr)_90px_90px_90px_110px] md:gap-4 md:items-center">
            <div className="flex items-center gap-3 min-w-0">
              {plato.imagen_url ? (
                <img src={plato.imagen_url} alt={plato.nombre} className="w-10 h-10 rounded object-cover shrink-0" />
              ) : (
                <div className="w-10 h-10 rounded bg-bg-secondary flex items-center justify-center text-lg shrink-0">🍽️</div>
              )}
              <h3 className="font-semibold truncate">{plato.nombre}</h3>
            </div>
            <div className="flex md:block justify-between md:text-center">
              <span className="md:hidden text-text-muted text-xs">Veces pedido: </span>
              <span className="font-medium">{plato.num_pedidos}</span>
            </div>
            <div className="flex md:block justify-between md:text-center">
              <span className="md:hidden text-text-muted text-xs">Cantidad: </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-accent/20 text-carbon font-medium text-xs">
                {plato.total_vendido} uds
              </span>
            </div>
            <div className="flex md:block justify-between md:text-center">
              <span className="md:hidden text-text-muted text-xs">Precio: </span>
              <span>{Number(plato.precio || 0).toFixed(2)}€</span>
            </div>
            <div className="flex md:block justify-between md:text-center">
              <span className="md:hidden text-text-muted text-xs">Ingresos: </span>
              <span className="font-semibold text-carbon">{(plato.total_vendido * Number(plato.precio)).toFixed(2)}€</span>
            </div>
          </div>
        ))}
      </div>
      {platos.length === 0 && (
        <p className="text-center py-8 text-text-muted">No hay pedidos todavía.</p>
      )}
    </div>
  )
}
