import { createContext, useContext, useState, useEffect } from 'react'

const CartContext = createContext(null)

const _petriCart = localStorage.getItem('petriCart')
if (_petriCart === 'undefined' || _petriCart === 'null') {
  localStorage.removeItem('petriCart')
}

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    const stored = localStorage.getItem('petriCart')
    if (!stored) return []
    try {
      const parsed = JSON.parse(stored)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  })
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    localStorage.setItem('petriCart', JSON.stringify(cart))
  }, [cart])

  const addItem = (plato) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === plato.id)
      if (existing) {
        return prev.map(item =>
          item.id === plato.id
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        )
      }
      return [...prev, { ...plato, cantidad: 1 }]
    })
    setIsOpen(true)
  }

  const removeItem = (id) => {
    setCart(prev => prev.filter(item => item.id !== id))
  }

  const updateQuantity = (id, cantidad) => {
    if (cantidad <= 0) {
      removeItem(id)
      return
    }
    setCart(prev => prev.map(item =>
      item.id === id ? { ...item, cantidad } : item
    ))
  }

  const clearCart = () => {
    setCart([])
  }

  const total = cart.reduce((sum, item) => sum + (item.precio * item.cantidad), 0)

  return (
    <CartContext.Provider value={{
      cart,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      total,
      isOpen,
      setIsOpen
    }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within CartProvider')
  }
  return context
}