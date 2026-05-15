import { createContext, useContext, useState, useEffect } from 'react'
import { authApi } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedUser = localStorage.getItem('petri_user')
    const token = localStorage.getItem('petri_token')
    if (storedUser && token) {
      setUser(JSON.parse(storedUser))
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    try {
      const data = await authApi.login(email, password)
      localStorage.setItem('petri_token', data.token)
      localStorage.setItem('petri_user', JSON.stringify(data.user))
      setUser(data.user)
      return { success: true }
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Error al iniciar sesión' }
    }
  }

  const register = async (nombre, apellidos, email, password) => {
    try {
      const data = await authApi.register(nombre, apellidos, email, password)
      localStorage.setItem('petri_token', data.token)
      localStorage.setItem('petri_user', JSON.stringify(data.user))
      setUser(data.user)
      return { success: true }
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Error al registrarse' }
    }
  }

  const logout = () => {
    localStorage.removeItem('petri_token')
    localStorage.removeItem('petri_user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
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