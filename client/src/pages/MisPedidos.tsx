import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Helmet } from 'react-helmet-async'
import { Star, Loader2, Pencil, Trash2, Minus, Plus, X, Calendar, Check } from 'lucide-react'
import { feedbackApi, pedidosApi, platosApi, fechasApi } from '../services/api'
import { useToast } from '../context/ToastContext'
import { getEstadoColor } from '../utils/estadoPedido'

interface PedidoItem {
  plato_id?: number
  nombre: string
  cantidad: number
  precio_unitario: string
  imagen_url?: string
}

interface PedidoConFeedback {
  id: number
  total: string
  estado: string
  created_at: string
  fecha_recogida: string | null
  notas: string | null
  calificacion: number | null
  feedback_comentario: string | null
  items?: PedidoItem[]
}

function EditarPedidoModal({
  pedido,
  onClose
}: {
  pedido: PedidoConFeedback & { items: PedidoItem[] }
  onClose: () => void
}) {
  const queryClient = useQueryClient()
  const { addToast } = useToast()
  const [editItems, setEditItems] = useState<{ id: number; nombre: string; precio: number; cantidad: number }[]>(
    () => pedido.items.map(item => ({
      id: item.plato_id || 0,
      nombre: item.nombre,
      precio: Number(item.precio_unitario),
      cantidad: item.cantidad
    }))
  )
  const [fechaRecogida, setFechaRecogida] = useState(pedido.fecha_recogida || '')
  const [horaRecogida, setHoraRecogida] = useState(
    pedido.notas?.startsWith('Recoger a las ') ? pedido.notas.replace('Recoger a las ', '') : ''
  )
  const [showMenu, setShowMenu] = useState(false)

  const { data: platos = [] } = useQuery({
    queryKey: ['platos', 'edit'],
    queryFn: () => platosApi.getAll({})
  })

  const { data: fechas = [] } = useQuery({
    queryKey: ['fechas', 'edit'],
    queryFn: () => fechasApi.getAll()
  })

  const updateMutation = useMutation({
    mutationFn: (data: { items: { id: number; cantidad: number }[]; notas?: string; fecha_recogida?: string }) =>
      pedidosApi.update(pedido.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['misPedidos'] })
      addToast('Pedido actualizado correctamente', 'success')
      onClose()
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      addToast(error.response?.data?.message || 'Error al actualizar el pedido', 'error')
    }
  })

  const total = useMemo(() =>
    editItems.reduce((sum, item) => sum + item.precio * item.cantidad, 0),
    [editItems]
  )

  const formatFecha = (fechaStr: string) => {
    const fecha = new Date(fechaStr)
    return fecha.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })
  }

  const fechasActivas = useMemo(() => {
    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)
    const manana = new Date(hoy)
    manana.setDate(manana.getDate() + 1)
    return fechas.filter(f => {
      if (!f.activo || !f.horarios?.length) return false
      const fechaDate = new Date(f.fecha)
      fechaDate.setHours(0, 0, 0, 0)
      return fechaDate >= manana
    })
  }, [fechas])

  const getHorariosParaFecha = (fechaSel: string) => {
    const fechaConfig = fechas.find(f => f.fecha === fechaSel)
    if (fechaConfig?.horarios?.length > 0) {
      return fechaConfig.horarios.filter(h => h.disponible)
    }
    return [
      { id: 1, hora: '12:00' }, { id: 2, hora: '13:00' }, { id: 3, hora: '14:00' },
      { id: 4, hora: '19:00' }, { id: 5, hora: '20:00' }, { id: 6, hora: '21:00' }
    ]
  }

  const agregarPlato = (plato: { id: number; nombre: string; precio: number }) => {
    setEditItems(prev => {
      const existing = prev.find(i => i.id === plato.id)
      if (existing) {
        return prev.map(i => i.id === plato.id ? { ...i, cantidad: i.cantidad + 1 } : i)
      }
      return [...prev, { id: plato.id, nombre: plato.nombre, precio: plato.precio, cantidad: 1 }]
    })
  }

  const handleSubmit = () => {
    const itemsPayload = editItems
      .filter(i => i.id > 0 && i.cantidad > 0)
      .map(i => ({ id: i.id, cantidad: i.cantidad }))

    if (itemsPayload.length === 0) {
      addToast('Debes incluir al menos un plato', 'error')
      return
    }

    const notas = horaRecogida ? `Recoger a las ${horaRecogida}` : undefined

    updateMutation.mutate({
      items: itemsPayload,
      notas,
      fecha_recogida: fechaRecogida || undefined
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-label="Editar pedido">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-full max-w-md bg-card h-full shadow-xl flex flex-col">
        <div className="flex items-center justify-between p-4">
          <h2 className="text-xl font-bold font-heading">Editar Pedido #{pedido.id}</h2>
          <button onClick={onClose} className="w-11 h-11 flex items-center justify-center hover:bg-bg-secondary rounded-full" aria-label="Cerrar">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold">Platos ({editItems.length})</h3>
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="text-sm text-accent hover:underline font-medium"
              >
                {showMenu ? 'Ocultar menú' : 'Añadir platos'}
              </button>
            </div>

            {showMenu && (
              <div className="bg-bg-secondary rounded-lg p-3 mb-4 space-y-1 max-h-60 overflow-y-auto">
                {platos
                  .filter(p => p.disponible)
                  .map(plato => (
                    <button
                      key={plato.id}
                      onClick={() => agregarPlato(plato)}
                      className="w-full flex justify-between items-center px-3 py-2 rounded hover:bg-surface text-sm transition"
                    >
                      <span>{plato.nombre}</span>
                      <span className="text-accent font-medium">{Number(plato.precio).toFixed(2)}€</span>
                    </button>
                  ))}
              </div>
            )}

            <div className="space-y-3">
              {editItems.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between bg-bg-tertiary rounded-lg px-4 py-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{item.nombre}</p>
                    <p className="text-xs text-text-muted">{Number(item.precio).toFixed(2)}€</p>
                  </div>
                  <div className="flex items-center gap-2 ml-2">
                    {item.id > 0 ? (
                      <>
                          <button
                            onClick={() => setEditItems(prev => prev.map((i, n) => n === idx ? { ...i, cantidad: Math.max(0, i.cantidad - 1) } : i))}
                            className="min-touch bg-surface rounded"
                            aria-label={`Reducir cantidad de ${item.nombre}`}
                          >
                            <Minus size={14} />
                          </button>
                          <span className="w-8 text-center text-sm">{item.cantidad}</span>
                          <button
                            onClick={() => setEditItems(prev => prev.map((i, n) => n === idx ? { ...i, cantidad: i.cantidad + 1 } : i))}
                            className="min-touch bg-surface rounded"
                            aria-label={`Aumentar cantidad de ${item.nombre}`}
                          >
                            <Plus size={14} />
                          </button>
                      </>
                    ) : (
                      <span className="text-sm text-text-muted">x{item.cantidad}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-text-muted">
              <Calendar size={16} />
              <span>Selecciona fecha de recogida:</span>
            </div>
            <select
              value={fechaRecogida}
              onChange={(e) => { setFechaRecogida(e.target.value); setHoraRecogida('') }}
              className="w-full bg-bg-secondary border border-border rounded-lg p-3"
            >
              <option value="">Elige una fecha...</option>
              {fechasActivas.map(f => (
                <option key={f.id} value={f.fecha}>{formatFecha(f.fecha)}</option>
              ))}
            </select>

            {fechaRecogida && (
              <>
                <label className="block text-sm text-text-muted">Selecciona hora:</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {getHorariosParaFecha(fechaRecogida).map(h => (
                    <button
                      key={h.id}
                      onClick={() => setHoraRecogida(h.hora)}
                      className={`py-2 px-3 rounded-lg text-sm transition ${
                        horaRecogida === h.hora ? 'bg-accent text-carbon' : 'bg-bg-tertiary hover:bg-border'
                      }`}
                      aria-pressed={horaRecogida === h.hora}
                    >
                      {h.hora.slice(0, 5)}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="p-4 border-t border-border">
          <div className="flex justify-between mb-4 text-lg font-bold">
            <span>Total:</span>
            <span className="text-carbon">{total.toFixed(2)}€</span>
          </div>
          <button
            onClick={handleSubmit}
            disabled={updateMutation.isPending}
            className="w-full bg-accent text-carbon py-3 rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {updateMutation.isPending ? (
              <><Loader2 className="animate-spin" size={20} /> Guardando...</>
            ) : (
              <><Check size={20} /> Guardar cambios</>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function MisPedidos() {
  const { addToast } = useToast()
  const queryClient = useQueryClient()
  const [selectedPedido, setSelectedPedido] = useState<number | null>(null)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [editingPedido, setEditingPedido] = useState<PedidoConFeedback | null>(null)

  const { data: pedidos = [], isLoading } = useQuery({
    queryKey: ['misPedidos'],
    queryFn: feedbackApi.getMisPedidos,
    refetchInterval: 60000
  })

  const createFeedbackMutation = useMutation({
    mutationFn: ({ pedido_id, calificacion, comentario }: { pedido_id: number; calificacion: number; comentario: string }) =>
      feedbackApi.create(pedido_id, calificacion, comentario),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['misPedidos'] })
      setSelectedPedido(null)
      setRating(5)
      setComment('')
    }
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => pedidosApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['misPedidos'] })
      addToast('Pedido eliminado correctamente', 'success')
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      addToast(error.response?.data?.message || 'Error al eliminar el pedido', 'error')
    }
  })

  const handleSubmitFeedback = (pedido_id: number) => {
    createFeedbackMutation.mutate({ pedido_id, calificacion: rating, comentario: comment })
  }

  const handleDelete = (pedido: PedidoConFeedback) => {
    if (window.confirm(`¿Eliminar el pedido #${pedido.id}? Esta acción no se puede deshacer.`)) {
      deleteMutation.mutate(pedido.id)
    }
  }

  if (isLoading) {
    return <div className="flex justify-center py-12" role="status" aria-live="polite"><Loader2 className="animate-spin text-accent" size={40} /><span className="sr-only">Cargando pedidos...</span></div>
  }

  return (
    <>
      <Helmet>
        <title>Mis Pedidos | PetriGastro</title>
        <meta name="description" content="Consulta el estado de tus pedidos en PetriGastro. Realiza un seguimiento de tus pedidos de comida artesanal." />
      </Helmet>

      <div className="max-w-4xl mx-auto px-4 py-6 md:py-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8 font-heading">Mis Pedidos</h1>

        {pedidos.length === 0 ? (
          <div className="bg-card rounded-lg shadow p-6 sm:p-8 md:p-12 text-center">
            <p className="text-text-muted text-lg">No tienes pedidos todavía.</p>
            <a href="/menu" className="text-carbon hover:text-accent underline mt-4 inline-block">
              Ver el menú
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            {pedidos.map((pedido: PedidoConFeedback) => (
              <div key={pedido.id} className="bg-card rounded-lg shadow p-4 md:p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-0 mb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-lg">Pedido #{pedido.id}</h3>
                      {pedido.estado === 'pendiente' && (
                        <div className="flex gap-1">
                          <button
                            onClick={() => setEditingPedido(pedido)}
                            className="w-10 h-10 flex items-center justify-center rounded hover:bg-bg-secondary text-text-muted hover:text-accent transition"
                            title="Editar pedido"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(pedido)}
                            className="w-10 h-10 flex items-center justify-center rounded hover:bg-bg-secondary text-text-muted hover:text-error transition"
                            title="Eliminar pedido"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      )}
                    </div>
                    <p className="text-text-muted text-sm">
                      {new Date(pedido.created_at).toLocaleDateString('es-ES', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                    {pedido.fecha_recogida && (
                      <p className="text-carbon text-sm">
                        Recogida: {new Date(pedido.fecha_recogida).toLocaleDateString('es-ES', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'short'
                        })}
                      </p>
                    )}
                  </div>
                  <div className="text-left sm:text-right w-full sm:w-auto">
                    <p className="text-xl sm:text-2xl font-bold text-carbon">{Number(pedido.total).toFixed(2)}€</p>
                    <span className={`px-2 py-1 rounded text-xs ${getEstadoColor(pedido.estado)}`}>
                      {pedido.estado}
                    </span>
                  </div>
                </div>

                {pedido.notas && (
                  <p className="text-sm text-text-muted mb-4">Notas: {pedido.notas}</p>
                )}

                {pedido.items && pedido.items.length > 0 && (
                  <div className="pt-4 mt-4">
                    <p className="text-sm font-medium mb-2">Platos del pedido:</p>
                    <div className="space-y-2">
                      {pedido.items.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            {item.imagen_url && (
                              <img src={item.imagen_url} alt={item.nombre} className="w-8 h-8 rounded object-cover" />
                            )}
                            <span className="text-carbon">{item.nombre}</span>
                          </div>
                          <span className="text-text-muted">
                            x{item.cantidad} · {Number(item.precio_unitario).toFixed(2)}€
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {pedido.estado === 'entregado' && (
                  <>
                    {pedido.calificacion ? (
                      <div className="pt-4 mt-4">
                        <p className="text-sm font-medium mb-2">Tu valoración:</p>
                        <div className="flex items-center gap-1 mb-2" aria-label={`Valoración: ${pedido.calificacion} de 5 estrellas`}>
                          {[1, 2, 3, 4, 5].map(star => (
                            <Star
                              key={star}
                              size={20}
                               className={star <= pedido.calificacion ? 'text-accent fill-accent' : 'text-text-muted'}
                              aria-hidden="true"
                            />
                          ))}
                        </div>
                        {pedido.feedback_comentario && (
                          <p className="text-sm text-text-muted italic">"{pedido.feedback_comentario}"</p>
                        )}
                      </div>
                    ) : selectedPedido === pedido.id ? (
                      <div className="pt-4 mt-4">
                        <p className="text-sm font-medium mb-2">Valora tu pedido:</p>
                        <div className="flex items-center gap-1 mb-3" role="radiogroup" aria-label="Valoración">
                          {[1, 2, 3, 4, 5].map(star => (
                            <button
                              key={star}
                              onClick={() => setRating(star)}
                              className="p-1.5 focus:outline-none"
                              aria-label={`${star} de 5 estrellas`}
                              role="radio"
                              aria-checked={star <= rating}
                            >
                              <Star
                                size={28}
                                className={star <= rating ? 'text-accent fill-accent hover:scale-110 transition' : 'text-text-muted hover:text-accent transition'}
                              />
                            </button>
                          ))}
                        </div>
                        <label htmlFor="feedback-comment" className="sr-only">Comentario</label>
                        <textarea
                          id="feedback-comment"
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          placeholder="Tu comentario (opcional)"
                          className="w-full px-3 py-2 border border-border rounded-lg bg-bg-secondary mb-3"
                          rows={2}
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleSubmitFeedback(pedido.id)}
                            disabled={createFeedbackMutation.isPending}
                            className="px-4 py-2 bg-accent text-carbon rounded-lg hover:opacity-90 disabled:opacity-50"
                          >
                            {createFeedbackMutation.isPending ? 'Enviando...' : 'Enviar'}
                          </button>
                          <button
                            onClick={() => setSelectedPedido(null)}
                            className="px-4 py-2 bg-bg-secondary text-text rounded-lg hover:bg-border"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setSelectedPedido(pedido.id)}
                        className="mt-4 px-4 py-2 bg-accent text-carbon rounded-lg hover:opacity-90"
                      >
                        Valorar pedido
                      </button>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {editingPedido && editingPedido.items && (
        <EditarPedidoModal pedido={editingPedido as PedidoConFeedback & { items: PedidoItem[] }} onClose={() => setEditingPedido(null)} />
      )}
    </>
  )
}