import { createContext, useContext, useState, useEffect } from 'react'

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
    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
    const data = await response.json()
    if (response.ok) {
      localStorage.setItem('petri_token', data.token)
      localStorage.setItem('petri_user', JSON.stringify(data.user))
      setUser(data.user)
      return { success: true }
    }
    return { success: false, error: data.message }
  }

  const register = async (nombre, email, password) => {
    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, email, password })
    })
    const data = await response.json()
    if (response.ok) {
      localStorage.setItem('petri_token', data.token)
      localStorage.setItem('petri_user', JSON.stringify(data.user))
      setUser(data.user)
      return { success: true }
    }
    return { success: false, error: data.message }
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