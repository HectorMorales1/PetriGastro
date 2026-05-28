import { useState, useMemo, useCallback } from 'react'
import { X, Minus, Plus, Trash2, Loader2, ShoppingBag, Calendar } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useCart } from '../context/CartContext'
import { useToast } from '../context/ToastContext'
import { pedidosApi, fechasApi } from '../services/api'
import type { Pedido } from '../types'

export default function CartDrawer() {
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [orderResult, setOrderResult] = useState<{ type: 'success'; pedido: Pedido } | { type: 'error'; message: string } | null>(null)
  const { addToast } = useToast()
  const [fechaSeleccionada, setFechaSeleccionada] = useState('')
  const [horaSeleccionada, setHoraSeleccionada] = useState('')
  const { cart, isOpen, setIsOpen, removeItem, updateQuantity, total, clearCart } = useCart()

  const { data: fechas = [] } = useQuery({
    queryKey: ['fechas', 'cart'],
    queryFn: () => fechasApi.getAll(),
    enabled: isOpen,
    staleTime: 60000
  })

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

  const formatFecha = useCallback((fechaStr: string) => {
    const fecha = new Date(fechaStr)
    return fecha.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })
  }, [])

  const getHorariosParaFecha = useCallback((fechaSel: string) => {
    const fechaConfig = fechas.find(f => f.fecha === fechaSel)
    if (fechaConfig?.horarios?.length > 0) {
      return fechaConfig.horarios.filter(h => h.disponible)
    }
    return [
      { id: 1, hora: '12:00' },
      { id: 2, hora: '13:00' },
      { id: 3, hora: '14:00' },
      { id: 4, hora: '19:00' },
      { id: 5, hora: '20:00' },
      { id: 6, hora: '21:00' }
    ]
  }, [fechas])

  const handleApiCheckout = useCallback(async () => {
    if (!fechaSeleccionada) {
      setError('Por favor selecciona una fecha de recogida')
      return
    }
    if (!horaSeleccionada) {
      setError('Por favor selecciona una hora de recogida')
      return
    }

    setSubmitting(true)
    setError('')
    try {
      const result = await pedidosApi.create({
        items: cart.map(item => ({ id: item.id, precio: item.precio, cantidad: item.cantidad })),
        notas: horaSeleccionada ? `Recoger a las ${horaSeleccionada.slice(0, 5)}` : '',
        fecha_recogida: fechaSeleccionada
      })
      setIsOpen(false)
      setOrderResult({ type: 'success', pedido: result })
      clearCart()
      setFechaSeleccionada('')
      setHoraSeleccionada('')

    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      const msg = error.response?.data?.message || 'Error al procesar el pedido'
      setIsOpen(false)
      setOrderResult({ type: 'error', message: msg })

    }
    setSubmitting(false)
  }, [fechaSeleccionada, horaSeleccionada, cart, clearCart])

  return (
    <>
      {orderResult && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setOrderResult(null)}
          role="dialog"
          aria-modal="true"
          aria-label={orderResult.type === 'success' ? 'Pedido realizado' : 'Error al procesar el pedido'}
        >
          <div className="absolute inset-0 bg-black/90" />
          <div
            className="relative bg-surface rounded-2xl max-w-md w-full p-6 text-center space-y-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {orderResult.type === 'success' ? (
              <>
                <div className="bg-green-100 rounded-full p-4 w-16 h-16 mx-auto flex items-center justify-center">
                  <ShoppingBag className="text-green-600" size={32} />
                </div>
                <div>
                  <p className="text-xl font-bold text-green-600">¡Pedido realizado!</p>
                  <p className="text-text-muted">Tu pedido ha sido recibido</p>
                </div>
                <div className="bg-bg-tertiary rounded-lg p-4 text-left space-y-2">
                  <div className="flex justify-between">
                    <span className="text-text-muted">Número de pedido:</span>
                    <span className="font-bold">#{orderResult.pedido.id}</span>
                  </div>
                  {orderResult.pedido.fecha_recogida && (
                    <div className="flex justify-between">
                      <span className="text-text-muted">Fecha de recogida:</span>
                      <span className="font-medium text-carbon">
                        {new Date(orderResult.pedido.fecha_recogida).toLocaleDateString('es-ES', {
                          weekday: 'long', day: 'numeric', month: 'long'
                        })}
                      </span>
                    </div>
                  )}
                  {orderResult.pedido.notas && (
                    <div className="flex justify-between">
                      <span className="text-text-muted">Hora:</span>
                      <span className="font-medium">{orderResult.pedido.notas.replace('Recoger a las ', '').slice(0, 5)}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-2 border-t border-border">
                    <span className="text-text-muted">Total:</span>
                    <span className="font-bold text-carbon">{Number(orderResult.pedido.total).toFixed(2)}€</span>
                  </div>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-800">
                    <strong>Próximos pasos:</strong> Recibirás una confirmación cuando el pedido esté listo.
                    Puedes seguir el estado en "Mis Pedidos".
                  </p>
                </div>
                <button
                  onClick={() => setOrderResult(null)}
                  className="w-full py-3 bg-accent text-carbon rounded-lg font-medium hover:opacity-90"
                >
                  Cerrar
                </button>
              </>
            ) : (
              <>
                <div className="bg-red-100 rounded-full p-4 w-16 h-16 mx-auto flex items-center justify-center">
                  <X className="text-red-600" size={32} />
                </div>
                <div>
                  <p className="text-xl font-bold text-red-600">Error al procesar el pedido</p>
                  <p className="text-text-muted">{orderResult.message}</p>
                </div>
                <button
                  onClick={() => setOrderResult(null)}
                  className="w-full py-3 bg-accent text-carbon rounded-lg font-medium hover:opacity-90"
                >
                  Cerrar
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {isOpen && (
        <div
      className="fixed inset-0 z-50 flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-label="Carrito de compras"
    >
      <div
        className="absolute inset-0 bg-black/90"
        onClick={() => setIsOpen(false)}
      />
      <div className="relative w-full max-w-md bg-surface h-full shadow-xl flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-xl font-bold font-heading">Tu Carrito</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-bg-secondary rounded-full"
            aria-label="Cerrar carrito"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {cart.length === 0 ? (
            <p className="text-center text-text-muted" role="status">Tu carrito está vacío</p>
          ) : (
            <div className="space-y-4">
              {cart.map(item => (
                <div key={item.id} className="flex gap-4 border-b border-border pb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold">{item.nombre}</h3>
                    <p className="text-carbon font-bold">{Number(item.precio).toFixed(2)}€</p>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.cantidad - 1)}
                        className="p-1 bg-bg-tertiary rounded"
                        aria-label={`Reducir cantidad de ${item.nombre}`}
                      >
                        <Minus size={16} />
                      </button>
                      <span className="w-8 text-center" aria-live="polite">{item.cantidad}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.cantidad + 1)}
                        className="p-1 bg-bg-tertiary rounded"
                        aria-label={`Aumentar cantidad de ${item.nombre}`}
                      >
                        <Plus size={16} />
                      </button>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="ml-auto text-error hover:opacity-80"
                        aria-label={`Eliminar ${item.nombre} del carrito`}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {cart.length > 0 && (
          <div className="p-4 border-t border-border">
                <div className="flex justify-between mb-4 text-lg font-bold">
                  <span>Total:</span>
                  <span className="text-carbon">{total.toFixed(2)}€</span>
                </div>

                <div className="mb-4 space-y-3">
                  <div className="flex items-center gap-2 text-sm text-text-muted">
                    <Calendar size={16} />
                    <span>Selecciona fecha de recogida:</span>
                  </div>
                  <select
                    value={fechaSeleccionada}
                    onChange={(e) => { setFechaSeleccionada(e.target.value); setHoraSeleccionada('') }}
                    className="w-full bg-bg-tertiary border border-border rounded-lg p-3 text-text"
                  >
                    <option value="">Elige una fecha...</option>
                    {fechasActivas.length === 0 ? (
                      <option value="" disabled>No hay fechas disponibles</option>
                    ) : (
                      fechasActivas.map((f) => (
                        <option key={f.id} value={f.fecha}>
                          {formatFecha(f.fecha)}
                        </option>
                      ))
                    )}
                  </select>
                  {fechasActivas.length === 0 && (
                    <p className="text-sm text-text-muted mt-2">
                      No hay fechas disponibles. Vuelve más tarde.
                    </p>
                  )}

                  {fechaSeleccionada && (
                    <>
                      <label className="block text-sm text-text-muted">Selecciona hora:</label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {getHorariosParaFecha(fechaSeleccionada).map(h => (
                          <button
                            key={h.id}
                            onClick={() => setHoraSeleccionada(h.hora)}
                            className={`py-2 px-3 rounded-lg text-sm transition ${
                              horaSeleccionada === h.hora
                                ? 'bg-accent text-carbon'
                                : 'bg-bg-tertiary text-text hover:bg-border'
                            }`}
                            aria-pressed={horaSeleccionada === h.hora}
                            aria-label={`${typeof h.hora === 'string' ? h.hora.slice(0, 5) : h.hora}`}
                          >
                            {typeof h.hora === 'string' ? h.hora.slice(0, 5) : h.hora}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {error && (
                  <p className="text-error text-sm mb-2" role="alert">{error}</p>
                )}

                <button
                  onClick={handleApiCheckout}
                  disabled={submitting}
                  className="w-full bg-accent text-carbon py-3 rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <><Loader2 className="animate-spin" size={20} /> Procesando...</>
                  ) : (
                    `Realizar Pedido (${total.toFixed(2)}€)`
                  )}
                </button>

                <button
                  onClick={() => { if (window.confirm('¿Vaciar el carrito? Se perderán todos los productos añadidos.')) clearCart() }}
                  className="w-full mt-2 text-text-muted hover:text-error text-sm"
                >
                  Vaciar carrito
                </button>
          </div>
        )}
      </div>
    </div>
      )}
    </>
  )
}