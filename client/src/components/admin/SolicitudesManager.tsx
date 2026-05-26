import { useState } from 'react'
import { Loader2, CheckCircle, XCircle } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useToast } from '../../context/ToastContext'
import { usuariosApi, categoriasApi } from '../../services/api'

export function SolicitudesManager() {
  const queryClient = useQueryClient()
  const { addToast } = useToast()
  const [rechazarModal, setRechazarModal] = useState<{ id: number; nombre: string } | null>(null)
  const [motivoRechazo, setMotivoRechazo] = useState('')

  const { data: solicitudes = [], isLoading } = useQuery({
    queryKey: ['solicitudes'],
    queryFn: usuariosApi.getSolicitudes,
    refetchInterval: 120000
  })

  const { data: categorias = [] } = useQuery({
    queryKey: ['categorias'],
    queryFn: categoriasApi.getAll
  })

  const aprobarMutation = useMutation({
    mutationFn: (id: number) => usuariosApi.aprobar(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['solicitudes'] })
      addToast('Solicitud aprobada correctamente', 'success')
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      addToast(error.response?.data?.message || 'Error al aprobar la solicitud', 'error')
    }
  })

  const rechazarMutation = useMutation({
    mutationFn: ({ id, motivo }: { id: number; motivo: string }) => usuariosApi.rechazar(id, motivo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['solicitudes'] })
      setRechazarModal(null)
      setMotivoRechazo('')
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      addToast(error.response?.data?.message || 'Error al rechazar la solicitud', 'error')
    }
  })

  if (isLoading) {
    return <div className="flex items-center justify-center py-12" role="status" aria-live="polite"><Loader2 className="animate-spin text-accent" size={40} /><span className="sr-only">Cargando solicitudes...</span></div>
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold font-heading">Solicitudes de Acceso</h2>
        <span className="px-3 py-1 rounded-full bg-accent/20 text-carbon text-sm font-medium">
          {solicitudes.length} pendiente{solicitudes.length !== 1 ? 's' : ''}
        </span>
      </div>

      {solicitudes.length === 0 ? (
        <div className="bg-surface rounded-lg shadow p-12 text-center">
          <CheckCircle className="mx-auto text-success mb-4" size={48} />
          <p className="text-text-muted text-lg">No hay solicitudes pendientes.</p>
        </div>
      ) : (
        <div className="bg-surface rounded-lg shadow overflow-x-auto overscroll-x-contain">
          <table className="w-full responsive-table">
            <thead className="bg-bg-secondary">
              <tr>
                <th className="px-4 py-3 text-left">Nombre</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Solicitado</th>
                <th className="px-4 py-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {solicitudes.map((sol: { id: number; nombre: string; apellidos: string; email: string; fecha_solicitud: string }) => (
                <tr key={sol.id} className="border-t border-border">
                  <td className="px-4 py-3 font-medium" data-label="Nombre">
                    {sol.nombre} {sol.apellidos}
                  </td>
                  <td className="px-4 py-3 text-text-muted" data-label="Email">{sol.email}</td>
                  <td className="px-4 py-3 text-text-muted text-sm" data-label="Solicitado">
                    {sol.fecha_solicitud
                      ? new Date(sol.fecha_solicitud).toLocaleDateString('es-ES', {
                          day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                        })
                      : '-'}
                  </td>
                  <td className="px-4 py-3" data-label="Acciones">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => {
                          if (confirm(`¿Aprobar la solicitud de ${sol.nombre} ${sol.apellidos}?`)) {
                            aprobarMutation.mutate(sol.id)
                          }
                        }}
                        disabled={aprobarMutation.isPending}
                        className="px-3 py-1.5 rounded-lg bg-success/20 text-success font-medium text-sm hover:bg-success/30 transition disabled:opacity-50 flex items-center gap-1"
                      >
                        <CheckCircle size={16} />
                        Aprobar
                      </button>
                      <button
                        onClick={() => setRechazarModal({ id: sol.id, nombre: `${sol.nombre} ${sol.apellidos}` })}
                        disabled={rechazarMutation.isPending}
                        className="px-3 py-1.5 rounded-lg bg-error/20 text-error font-medium text-sm hover:bg-error/30 transition disabled:opacity-50 flex items-center gap-1"
                      >
                        <XCircle size={16} />
                        Rechazar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {rechazarModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" role="dialog" aria-modal="true" aria-labelledby="rechazar-title">
          <div className="bg-surface rounded-lg shadow-xl p-6 max-w-md w-full space-y-4">
            <h3 id="rechazar-title" className="text-lg font-semibold">Rechazar solicitud</h3>
            <p className="text-text-muted text-sm">
              ¿Estás seguro de rechazar la solicitud de <strong>{rechazarModal.nombre}</strong>?
            </p>
            <div>
              <label htmlFor="motivo-rechazo" className="block text-sm font-medium mb-1">Motivo del rechazo (opcional)</label>
              <textarea
                id="motivo-rechazo"
                value={motivoRechazo}
                onChange={(e) => setMotivoRechazo(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg bg-bg-secondary"
                rows={3}
                placeholder="Si no escribes nada, se enviará el mensaje por defecto."
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => { setRechazarModal(null); setMotivoRechazo('') }}
                className="px-4 py-2 rounded-lg bg-bg-secondary font-medium hover:opacity-80 transition"
              >
                Cancelar
              </button>
              <button
                onClick={() => rechazarMutation.mutate({ id: rechazarModal.id, motivo: motivoRechazo })}
                disabled={rechazarMutation.isPending}
                className="px-4 py-2 rounded-lg bg-error text-white font-medium hover:opacity-90 transition disabled:opacity-50"
              >
                {rechazarMutation.isPending ? 'Rechazando...' : 'Rechazar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
