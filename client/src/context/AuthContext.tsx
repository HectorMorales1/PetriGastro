import { createContext, useContext, useState, useEffect } from 'react'
import { authApi } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedUser = localStorage.getItem('petri_user')
    const token = localStorage.getItem('petri_token')
    if (storedUser && storedUser !== 'undefined' && token) {
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
    const refreshToken = localStorage.getItem('petri_refresh_token')
    if (!refreshToken) {
      logout()
      return { success: false, error: 'No refresh token' }
    }
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/auth/refresh`, {
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