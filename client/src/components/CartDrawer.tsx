import { useState } from 'react'
import { X, Minus, Plus, Trash2, Loader2, ShoppingBag } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { pedidosApi } from '../services/api'

export default function CartDrawer() {
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const { cart, isOpen, setIsOpen, removeItem, updateQuantity, total, clearCart } = useCart()

  if (!isOpen) return null

  const handleApiCheckout = async () => {
    setSubmitting(true)
    setError('')
    try {
      await pedidosApi.create({
        items: cart.map(item => ({ id: item.id, precio: item.precio, cantidad: item.cantidad })),
        notas: ''
      })
      setSubmitted(true)
      clearCart()
    } catch (err) {
      setError(err.response?.data?.message || 'Error al procesar el pedido')
    }
    setSubmitting(false)
  }

  const handleWhatsApp = () => {
    const message = cart.map(item => 
      `• ${item.nombre}: ${item.cantidad}x - ${(item.precio * item.cantidad).toFixed(2)}€`
    ).join('\n')

    const totalText = `\nTotal: ${total.toFixed(2)}€`
    const fullMessage = encodeURIComponent(`Hola, me gustaría hacer un pedido:\n\n${message}${totalText}`)
    window.open(`https://wa.me/34600123456?text=${fullMessage}`, '_blank')
  }

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
                    <p className="text-accent font-bold">{item.precio.toFixed(2)}€</p>
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
              <div className="text-center text-success font-semibold py-4">
                <ShoppingBag className="mx-auto mb-2" size={32} />
                <p>¡Pedido realizado con éxito!</p>
              </div>
            ) : (
              <>
                <div className="flex justify-between mb-4 text-lg font-bold">
                  <span>Total:</span>
                  <span className="text-accent">{total.toFixed(2)}€</span>
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
                  onClick={handleWhatsApp}
                  className="w-full mt-2 py-2 rounded-lg border border-accent text-accent font-medium hover:bg-accent/10 transition text-sm"
                >
                  Pedir por WhatsApp
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