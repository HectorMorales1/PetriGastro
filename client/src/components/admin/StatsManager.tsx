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
        <div className="bg-surface p-6 rounded-lg shadow text-center">
          <div className="text-3xl font-bold text-carbon">{totales.pedidos}</div>
          <div className="text-text-muted">Pedidos Totales</div>
        </div>
        <div className="bg-surface p-6 rounded-lg shadow text-center">
          <div className="text-3xl font-bold text-carbon">{Number(totales.ingresos || 0).toFixed(2)}€</div>
          <div className="text-text-muted">Ingresos Totales</div>
        </div>
        <div className="bg-surface p-6 rounded-lg shadow text-center">
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

      <div className="bg-surface rounded-lg shadow overflow-x-auto overscroll-x-contain">
        <table className="w-full responsive-table">
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
            {platos.map((plato: { id: number; imagen_url: string; nombre: string; precio: number; total_vendido: number; num_pedidos: number }) => (
              <tr key={plato.id} className="border-t border-border">
                <td className="px-4 py-3" data-label="Plato">
                  <div className="flex items-center gap-3">
                    {plato.imagen_url ? (
                      <img src={plato.imagen_url} alt={plato.nombre} className="w-10 h-10 rounded object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded bg-bg-secondary flex items-center justify-center">🍽️</div>
                    )}
                    <span className="font-medium">{plato.nombre}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-center" data-label="Veces pedido">{plato.num_pedidos}</td>
                <td className="px-4 py-3 text-center" data-label="Total">
                  <span className="inline-flex items-center px-2 py-1 rounded-full bg-accent/20 text-carbon font-medium">
                    {plato.total_vendido} uds
                  </span>
                </td>
                <td className="px-4 py-3 text-right" data-label="Precio">{Number(plato.precio || 0).toFixed(2)}€</td>
                <td className="px-4 py-3 text-right font-medium text-carbon" data-label="Ingresos">
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
