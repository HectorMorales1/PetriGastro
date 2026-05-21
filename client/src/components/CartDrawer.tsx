import { useState, useEffect, useMemo, useCallback } from 'react'
import { X, Minus, Plus, Trash2, Loader2, ShoppingBag, Calendar } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useToast } from '../context/ToastContext'
import { pedidosApi, fechasApi } from '../services/api'
import type { Pedido } from '../types'

interface FechaDisponible {
  id: number
  fecha: string
  activo?: boolean
  horarios: { id: number; hora: string; disponible: boolean }[]
}

export default function CartDrawer() {
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [pedidoInfo, setPedidoInfo] = useState<Pedido | null>(null)
  const [error, setError] = useState('')
  const { addToast } = useToast()
  const [fechas, setFechas] = useState<FechaDisponible[]>([])
  const [fechaSeleccionada, setFechaSeleccionada] = useState('')
  const [horaSeleccionada, setHoraSeleccionada] = useState('')
  const { cart, isOpen, setIsOpen, removeItem, updateQuantity, total, clearCart } = useCart()

  useEffect(() => {
    if (isOpen) {
      fechasApi.getAll().then(setFechas).catch(() => {
        addToast('Error al cargar fechas disponibles', 'error')
      })
    }
  }, [isOpen, addToast])

  const fechasActivas = useMemo(
    () => fechas.filter(f => f.activo && f.horarios?.length > 0),
    [fechas]
  )

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
        notas: horaSeleccionada ? `Recoger a las ${horaSeleccionada}` : '',
        fecha_recogida: fechaSeleccionada
      })
      setPedidoInfo(result)
      setSubmitted(true)
      clearCart()
      setFechaSeleccionada('')
      setHoraSeleccionada('')
    } catch (err) {
      setError(err.response?.data?.message || 'Error al procesar el pedido')
    }
    setSubmitting(false)
  }, [fechaSeleccionada, horaSeleccionada, cart, clearCart])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={() => setIsOpen(false)}
      />
      <div className="relative w-full max-w-md bg-surface h-full shadow-xl flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-xl font-bold font-heading">Tu Carrito</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-bg-secondary rounded-full"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {cart.length === 0 ? (
            <p className="text-center text-text-muted">Tu carrito está vacío</p>
          ) : (
            <div className="space-y-4">
              {cart.map(item => (
                <div key={item.id} className="flex gap-4 border-b border-border pb-4">
                  <div className="w-20 h-20 bg-bg-tertiary rounded-lg flex-shrink-0">
                    {item.imagen_url && (
                      <img src={item.imagen_url} alt={item.nombre} className="w-full h-full object-cover rounded-lg" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{item.nombre}</h3>
                    <p className="text-accent font-bold">{Number(item.precio).toFixed(2)}€</p>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.cantidad - 1)}
                        className="p-1 bg-bg-tertiary rounded"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="w-8 text-center">{item.cantidad}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.cantidad + 1)}
                        className="p-1 bg-bg-tertiary rounded"
                      >
                        <Plus size={16} />
                      </button>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="ml-auto text-error hover:opacity-80"
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
            {submitted ? (
              <div className="text-center py-4 space-y-4">
                <div className="bg-green-100 rounded-full p-4 w-16 h-16 mx-auto flex items-center justify-center">
                  <ShoppingBag className="text-green-600" size={32} />
                </div>
                <div>
                  <p className="text-xl font-bold text-green-600">¡Pedido realizado!</p>
                  <p className="text-text-muted">Tu pedido ha sido recibido</p>
                </div>
                {pedidoInfo && (
                  <div className="bg-bg-tertiary rounded-lg p-4 text-left space-y-2">
                    <div className="flex justify-between">
                      <span className="text-text-muted">Número de pedido:</span>
                      <span className="font-bold">#{pedidoInfo.id}</span>
                    </div>
                    {pedidoInfo.fecha_recogida && (
                      <div className="flex justify-between">
                        <span className="text-text-muted">Fecha de recogida:</span>
                        <span className="font-medium text-accent">
                          {new Date(pedidoInfo.fecha_recogida).toLocaleDateString('es-ES', { 
                            weekday: 'long', day: 'numeric', month: 'long' 
                          })}
                        </span>
                      </div>
                    )}
                    {pedidoInfo.notas && (
                      <div className="flex justify-between">
                        <span className="text-text-muted">Hora:</span>
                        <span className="font-medium">{pedidoInfo.notas.replace('Recoger a las ', '')}</span>
                      </div>
                    )}
                    <div className="flex justify-between pt-2 border-t border-border">
                      <span className="text-text-muted">Total:</span>
                      <span className="font-bold text-accent">{Number(pedidoInfo.total).toFixed(2)}€</span>
                    </div>
                  </div>
                )}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-800">
                    <strong>Próximos pasos:</strong> Recibirás una confirmación cuando el pedido esté listo. 
                    Puedes seguir el estado en "Mis Pedidos".
                  </p>
                </div>
                <button
                  onClick={() => { setSubmitted(false); setPedidoInfo(null) }}
                  className="w-full py-3 bg-accent text-white rounded-lg font-medium hover:opacity-90"
                >
                  Hacer otro pedido
                </button>
              </div>
            ) : (
              <>
                <div className="flex justify-between mb-4 text-lg font-bold">
                  <span>Total:</span>
                  <span className="text-accent">{total.toFixed(2)}€</span>
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
                      <div className="grid grid-cols-3 gap-2">
                        {getHorariosParaFecha(fechaSeleccionada).map(h => (
                          <button
                            key={h.id}
                            onClick={() => setHoraSeleccionada(h.hora)}
                            className={`py-2 px-3 rounded-lg text-sm transition ${
                              horaSeleccionada === h.hora
                                ? 'bg-accent text-white'
                                : 'bg-bg-tertiary text-text hover:bg-border'
                            }`}
                          >
                            {h.hora.slice(0, 5)}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {error && (
                  <p className="text-error text-sm mb-2">{error}</p>
                )}

                <button
                  onClick={handleApiCheckout}
                  disabled={submitting}
                  className="w-full bg-accent text-white py-3 rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <><Loader2 className="animate-spin" size={20} /> Procesando...</>
                  ) : (
                    `Realizar Pedido (${total.toFixed(2)}€)`
                  )}
                </button>

                <button
                  onClick={clearCart}
                  className="w-full mt-2 text-text-muted hover:text-error text-sm"
                >
                  Vaciar carrito
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}