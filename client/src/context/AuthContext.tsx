import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { authApi, API_URL } from '../services/api'
import { safeGetItem } from '../utils/storage'
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
    const token = safeGetItem('petri_token')
    if (storedUser && token) {
      try {
        const parsed = JSON.parse(storedUser)
        if (parsed && typeof parsed === 'object') {
          setUser(parsed)
        } else {
          localStorage.removeItem('petri_user')
        }
      } catch {
        localStorage.removeItem('petri_user')
      }
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    try {
      const data = await authApi.login(email, password)
      localStorage.setItem('petri_token', data.token)
      localStorage.setItem('petri_refresh_token', data.refreshToken || '')
      localStorage.setItem('petri_user', data.user ? JSON.stringify(data.user) : '')
      setUser(data.user)
      return { success: true }
    } catch (err) {
      const estadoSolicitud = err.response?.data?.estado_solicitud
      return { success: false, error: err.response?.data?.message || 'Error al iniciar sesión', estado_solicitud: estadoSolicitud }
    }
  }

  const register = async (nombre, apellidos, email, password) => {
    try {
      const data = await authApi.register(nombre, apellidos, email, password)
      return { success: true, pending: true, message: data.message }
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Error al registrarse' }
    }
  }

  const logout = () => {
    localStorage.removeItem('petri_token')
    localStorage.removeItem('petri_refresh_token')
    localStorage.removeItem('petri_user')
    setUser(null)
  }

  const refreshToken = async () => {
    const refreshToken = safeGetItem('petri_refresh_token')
    if (!refreshToken) {
      logout()
      return { success: false, error: 'No refresh token' }
    }
    try {
      const response = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken })
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message)

      localStorage.setItem('petri_token', data.token)
      localStorage.setItem('petri_refresh_token', data.refreshToken || '')
      localStorage.setItem('petri_user', data.user ? JSON.stringify(data.user) : '')
      setUser(data.user)
      return { success: true }
    } catch (err) {
      logout()
      return { success: false, error: err.message }
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