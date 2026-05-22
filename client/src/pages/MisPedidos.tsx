import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Helmet } from 'react-helmet-async'
import { Star, Loader2 } from 'lucide-react'
import { feedbackApi } from '../services/api'
import { useAuth } from '../context/AuthContext'

interface PedidoConFeedback {
  id: number
  total: string
  estado: string
  created_at: string
  fecha_recogida: string | null
  notas: string | null
  calificacion: number | null
  feedback_comentario: string | null
}

export default function MisPedidos() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [selectedPedido, setSelectedPedido] = useState<number | null>(null)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')

  const { data: pedidos = [], isLoading } = useQuery({
    queryKey: ['misPedidos'],
    queryFn: feedbackApi.getMisPedidos
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

  const handleSubmitFeedback = (pedido_id: number) => {
    createFeedbackMutation.mutate({ pedido_id, calificacion: rating, comentario: comment })
  }

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'pendiente': return 'bg-yellow-100 text-yellow-800'
      case 'confirmado': return 'bg-blue-100 text-blue-800'
      case 'preparando': return 'bg-orange-100 text-orange-800'
      case 'preparado': return 'bg-purple-100 text-purple-800'
      case 'entregado': return 'bg-green-100 text-green-800'
      case 'cancelado': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
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

      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 font-heading">Mis Pedidos</h1>

        {pedidos.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-text-muted text-lg">No tienes pedidos todavía.</p>
            <a href="/menu" className="text-accent hover:underline mt-4 inline-block">
              Ver el menú
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            {pedidos.map((pedido: PedidoConFeedback) => (
              <div key={pedido.id} className="bg-surface rounded-lg shadow p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-lg">Pedido #{pedido.id}</h3>
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
                      <p className="text-accent text-sm">
                        Recogida: {new Date(pedido.fecha_recogida).toLocaleDateString('es-ES', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'short'
                        })}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-accent">{Number(pedido.total).toFixed(2)}€</p>
                    <span className={`px-2 py-1 rounded text-xs ${getEstadoColor(pedido.estado)}`}>
                      {pedido.estado}
                    </span>
                  </div>
                </div>

                {pedido.notas && (
                  <p className="text-sm text-text-muted mb-4">Notas: {pedido.notas}</p>
                )}

                {pedido.estado === 'entregado' && (
                  <>
                    {pedido.calificacion ? (
                      <div className="border-t border-border pt-4 mt-4">
                        <p className="text-sm font-medium mb-2">Tu valoración:</p>
                        <div className="flex items-center gap-1 mb-2" aria-label={`Valoración: ${pedido.calificacion} de 5 estrellas`}>
                          {[1, 2, 3, 4, 5].map(star => (
                            <Star
                              key={star}
                              size={20}
                              className={star <= pedido.calificacion ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
                              aria-hidden="true"
                            />
                          ))}
                        </div>
                        {pedido.feedback_comentario && (
                          <p className="text-sm text-text-muted italic">"{pedido.feedback_comentario}"</p>
                        )}
                      </div>
                    ) : selectedPedido === pedido.id ? (
                      <div className="border-t border-border pt-4 mt-4">
                        <p className="text-sm font-medium mb-2">Valora tu pedido:</p>
                        <div className="flex items-center gap-1 mb-3" role="radiogroup" aria-label="Valoración">
                          {[1, 2, 3, 4, 5].map(star => (
                            <button
                              key={star}
                              onClick={() => setRating(star)}
                              className="focus:outline-none"
                              aria-label={`${star} de 5 estrellas`}
                              role="radio"
                              aria-checked={star <= rating}
                            >
                              <Star
                                size={28}
                                className={star <= rating ? 'text-yellow-400 fill-yellow-400 hover:scale-110 transition' : 'text-gray-300 hover:text-yellow-300 transition'}
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
                            className="px-4 py-2 bg-accent text-white rounded-lg hover:opacity-90 disabled:opacity-50"
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
                        className="mt-4 px-4 py-2 bg-accent text-white rounded-lg hover:opacity-90"
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
    </>
  )
}