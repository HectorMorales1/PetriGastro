import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { type ReactNode } from 'react'
import { AuthProvider } from './AuthContext'
import { CartProvider, useCart } from './CartContext'
import { ThemeProvider } from './ThemeContext'
import { ToastProvider } from './ToastContext'

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <HelmetProvider>
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <ThemeProvider>
              <AuthProvider>
                <CartProvider>
                  <ToastProvider>
                    {children}
                  </ToastProvider>
                </CartProvider>
              </AuthProvider>
            </ThemeProvider>
          </MemoryRouter>
        </QueryClientProvider>
      </HelmetProvider>
    )
  }
}

const mockPlato = {
  id: 1,
  nombre: 'Test Plato',
  descripcion: 'Descripción test',
  precio: 10.50,
  categoria_id: 1,
  categoria: 'Entrantes',
  imagen_url: '',
  disponible: true,
  destacado: false,
}

describe('CartContext', () => {
  beforeEach(() => {
    localStorage.removeItem('petriCart')
  })

  it('starts with empty cart', () => {
    const { result } = renderHook(() => useCart(), { wrapper: createWrapper() })
    expect(result.current.cart).toEqual([])
    expect(result.current.total).toBe(0)
  })

  it('adds item to cart', () => {
    const { result } = renderHook(() => useCart(), { wrapper: createWrapper() })
    act(() => { result.current.addItem(mockPlato) })
    expect(result.current.cart).toHaveLength(1)
    expect(result.current.cart[0].nombre).toBe('Test Plato')
    expect(result.current.cart[0].cantidad).toBe(1)
  })

  it('increments quantity when adding same item', () => {
    const { result } = renderHook(() => useCart(), { wrapper: createWrapper() })
    act(() => { result.current.addItem(mockPlato) })
    act(() => { result.current.addItem(mockPlato) })
    expect(result.current.cart).toHaveLength(1)
    expect(result.current.cart[0].cantidad).toBe(2)
  })

  it('removes item from cart', () => {
    const { result } = renderHook(() => useCart(), { wrapper: createWrapper() })
    act(() => { result.current.addItem(mockPlato) })
    act(() => { result.current.removeItem(1) })
    expect(result.current.cart).toHaveLength(0)
  })

  it('updates quantity', () => {
    const { result } = renderHook(() => useCart(), { wrapper: createWrapper() })
    act(() => { result.current.addItem(mockPlato) })
    act(() => { result.current.updateQuantity(1, 5) })
    expect(result.current.cart[0].cantidad).toBe(5)
  })

  it('removes item when quantity set to 0', () => {
    const { result } = renderHook(() => useCart(), { wrapper: createWrapper() })
    act(() => { result.current.addItem(mockPlato) })
    act(() => { result.current.updateQuantity(1, 0) })
    expect(result.current.cart).toHaveLength(0)
  })

  it('calculates total correctly', () => {
    const { result } = renderHook(() => useCart(), { wrapper: createWrapper() })
    act(() => { result.current.addItem(mockPlato) })
    act(() => { result.current.addItem({ ...mockPlato, id: 2, precio: 5.25 }) })
    expect(result.current.total).toBe(15.75)
  })

  it('clears cart', () => {
    const { result } = renderHook(() => useCart(), { wrapper: createWrapper() })
    act(() => { result.current.addItem(mockPlato) })
    act(() => { result.current.clearCart() })
    expect(result.current.cart).toHaveLength(0)
  })

  it('toggles isOpen', () => {
    const { result } = renderHook(() => useCart(), { wrapper: createWrapper() })
    expect(result.current.isOpen).toBe(false)
    act(() => { result.current.setIsOpen(true) })
    expect(result.current.isOpen).toBe(true)
  })
})
