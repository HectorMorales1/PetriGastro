import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { authApi, API_URL, api } from '../services/api'
import { safeGetItem, safeSetItem, safeRemoveItem } from '../utils/storage'
import type { User } from '../types'

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; estado_solicitud?: string }>
  register: (nombre: string, apellidos: string, email: string, password: string) => Promise<{ success: boolean; pending?: boolean; message?: string; error?: string }>
  logout: () => void
  refreshToken: () => Promise<{ success: boolean; error?: string }>
  loading: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedUser = safeGetItem('petri_user')
    const token = safeGetItem('petri_token', 'session')
    if (storedUser && token) {
      try {
        const parsed = JSON.parse(storedUser)
        if (parsed && typeof parsed === 'object') {
          setUser(parsed)
        } else {
          safeRemoveItem('petri_user')
        }
      } catch {
        safeRemoveItem('petri_user')
      }
    }
    setLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const data = await authApi.login(email, password)
      safeSetItem('petri_token', data.token, 'session')
      safeSetItem('petri_refresh_token', data.refreshToken || '', 'session')
      safeSetItem('petri_user', data.user ? JSON.stringify(data.user) : '')
      setUser(data.user)
      return { success: true }
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: { estado_solicitud?: string; message?: string } } }
      const estadoSolicitud = apiErr.response?.data?.estado_solicitud
      return { success: false, error: apiErr.response?.data?.message || 'Error al iniciar sesión', estado_solicitud: estadoSolicitud }
    }
  }

  const register = async (nombre: string, apellidos: string, email: string, password: string) => {
    try {
      const data = await authApi.register(nombre, apellidos, email, password)
      return { success: true, pending: true, message: data.message }
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: { message?: string } } }
      return { success: false, error: apiErr.response?.data?.message || 'Error al registrarse' }
    }
  }

  const logout = () => {
    api.post('/auth/invalidate-sessions').catch(() => {})
    safeRemoveItem('petri_token', 'session')
    safeRemoveItem('petri_refresh_token', 'session')
    safeRemoveItem('petri_user')
    setUser(null)
  }

  const refreshToken = async () => {
    const stored = safeGetItem('petri_refresh_token', 'session')
    if (!stored) {
      logout()
      return { success: false, error: 'No refresh token' }
    }
    try {
      const response = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: stored })
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message)

      safeSetItem('petri_token', data.token, 'session')
      safeSetItem('petri_refresh_token', data.refreshToken || '', 'session')
      safeSetItem('petri_user', data.user ? JSON.stringify(data.user) : '')
      setUser(data.user)
      return { success: true }
    } catch (err: unknown) {
      const error = err as Error
      logout()
      return { success: false, error: error.message }
    }
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, refreshToken, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}