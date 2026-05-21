import { createContext, useContext, useState, useEffect, useMemo, type ReactNode } from 'react'
import { safeGetItem } from '../utils/storage'
import type { Plato, CartItem } from '../types'

interface CartContextType {
  cart: CartItem[]
  addItem: (plato: Plato) => void
  removeItem: (id: number) => void
  updateQuantity: (id: number, cantidad: number) => void
  clearCart: () => void
  total: number
  isOpen: boolean
  setIsOpen: (open: boolean) => void
}

const CartContext = createContext<CartContextType | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>(() => {
  const [cart, setCart] = useState(() => {
    const stored = safeGetItem('petriCart')
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

  const total = useMemo(() =>
    cart.reduce((sum, item) => sum + (item.precio * item.cantidad), 0),
    [cart]
  )

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