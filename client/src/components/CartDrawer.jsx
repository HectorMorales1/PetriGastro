import { X, Minus, Plus, Trash2 } from 'lucide-react'
import { useCart } from '../context/CartContext'

export default function CartDrawer() {
  const { cart, isOpen, setIsOpen, removeItem, updateQuantity, total, clearCart } = useCart()

  if (!isOpen) return null

  const handleCheckout = () => {
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
      <div className="relative w-full max-w-md bg-white dark:bg-gray-900 h-full shadow-xl flex flex-col">
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
          <h2 className="text-xl font-bold font-heading">Tu Carrito</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {cart.length === 0 ? (
            <p className="text-center text-gray-500">Tu carrito está vacío</p>
          ) : (
            <div className="space-y-4">
              {cart.map(item => (
                <div key={item.id} className="flex gap-4 border-b dark:border-gray-700 pb-4">
                  <div className="w-20 h-20 bg-gray-200 rounded-lg flex-shrink-0">
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
                        className="p-1 bg-gray-200 dark:bg-gray-700 rounded"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="w-8 text-center">{item.cantidad}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.cantidad + 1)}
                        className="p-1 bg-gray-200 dark:bg-gray-700 rounded"
                      >
                        <Plus size={16} />
                      </button>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="ml-auto text-red-500 hover:text-red-700"
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
          <div className="p-4 border-t dark:border-gray-700">
            <div className="flex justify-between mb-4 text-lg font-bold">
              <span>Total:</span>
              <span className="text-accent">{total.toFixed(2)}€</span>
            </div>
            <button
              onClick={handleCheckout}
              className="w-full bg-accent text-white py-3 rounded-lg font-semibold hover:bg-opacity-90 transition"
            >
              Finalizar Pedido
            </button>
            <button
              onClick={clearCart}
              className="w-full mt-2 text-gray-500 hover:text-red-500 text-sm"
            >
              Vaciar carrito
            </button>
          </div>
        )}
      </div>
    </div>
  )
}