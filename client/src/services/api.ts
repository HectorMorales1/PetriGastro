import axios from 'axios'
import { QueryClient } from '@tanstack/react-query'
import { safeGetItem, safeSetItem, safeRemoveItem } from '../utils/storage'

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

const AUTH_ROUTES = ['/auth/login', '/auth/register']

;['petri_user', 'petriCart', 'petri_theme'].forEach(key => {
  if (safeGetItem(key) === null) {
    localStorage.removeItem(key)
  }
})
;['petri_token', 'petri_refresh_token'].forEach(key => {
  if (safeGetItem(key, 'session') === null) {
    sessionStorage.removeItem(key)
  }
})

export const api = axios.create({
  baseURL: API_URL
})

api.interceptors.request.use((config) => {
  const token = safeGetItem('petri_token', 'session')
  if (token) {
    config.headers.Authorization = `Bearer ${token.trim()}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    if (error.response?.status === 401 && !originalRequest._retry) {
      const isAuthRoute = AUTH_ROUTES.some(route => originalRequest.url?.includes(route))
      if (isAuthRoute) {
        return Promise.reject(error)
      }
      originalRequest._retry = true
      try {
        const refreshToken = safeGetItem('petri_refresh_token', 'session')
        if (refreshToken) {
          const response = await fetch(`${API_URL}/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken })
          })
          if (response.ok) {
            const data = await response.json()
            if (data.token) {
              safeSetItem('petri_token', data.token, 'session')
              safeSetItem('petri_refresh_token', data.refreshToken || '', 'session')
              originalRequest.headers.Authorization = `Bearer ${data.token}`
              return api(originalRequest)
            }
          }
        }
      } catch (e) {
        console.error('Error al refrescar token:', e)
      }
      safeRemoveItem('petri_token', 'session')
      safeRemoveItem('petri_refresh_token', 'session')
      safeRemoveItem('petri_user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
      refetchOnWindowFocus: false,
      retry: 2
    }
  }
})

export const platosApi = {
  getAll: (params) => api.get('/platos', { params }).then(r => r.data),
  getById: (id) => api.get(`/platos/${id}`).then(r => r.data),
  create: (data) => api.post('/platos', data).then(r => r.data),
  update: (id, data) => api.put(`/platos/${id}`, data).then(r => r.data),
  delete: (id) => api.delete(`/platos/${id}`).then(r => r.data)
}

export const categoriasApi = {
  getAll: (params) => api.get('/categorias', { params }).then(r => r.data),
  create: (data: { nombre: string; icono?: string; orden?: number }) => api.post('/categorias', data).then(r => r.data),
  update: (id: number, data: { nombre?: string; icono?: string; orden?: number }) => api.put(`/categorias/${id}`, data).then(r => r.data),
  delete: (id: number) => api.delete(`/categorias/${id}`).then(r => r.data)
}

export const pedidosApi = {
  create: (data) => api.post('/pedidos', data).then(r => r.data),
  getAll: (params?) => api.get('/pedidos', { params }).then(r => r.data),
  getMine: () => api.get('/pedidos/mis-pedidos').then(r => r.data),
  getStats: (filter?: string) => api.get('/pedidos/stats', { params: { filter } }).then(r => r.data),
  updateEstado: (id, estado) => api.put(`/pedidos/${id}/estado`, { estado }).then(r => r.data),
  update: (id, data) => api.put(`/pedidos/${id}`, data).then(r => r.data),
  delete: (id) => api.delete(`/pedidos/${id}`).then(r => r.data)
}

export const authApi = {
  login: (email, password) => api.post('/auth/login', { email, password }).then(r => r.data),
  register: (nombre, apellidos, email, password) => api.post('/auth/register', { nombre, apellidos, email, password }).then(r => r.data),
  verificarEmail: (token) => api.post('/auth/verificar', { token }).then(r => r.data),
  invalidateSessions: () => api.post('/auth/invalidate-sessions').then(r => r.data)
}

export const usuariosApi = {
  getSolicitudes: () => api.get('/usuarios/solicitudes').then(r => r.data),
  getAll: (params?) => api.get('/usuarios', { params }).then(r => r.data),
  aprobar: (id) => api.put(`/usuarios/${id}/aprobar`).then(r => r.data),
  rechazar: (id, motivo) => api.put(`/usuarios/${id}/rechazar`, { motivo }).then(r => r.data),
  delete: (id: number) => api.delete(`/usuarios/${id}`).then(r => r.data),
  updateRol: (id: number, rol: string) => api.put(`/usuarios/${id}/rol`, { rol }).then(r => r.data)
}

export const fechasApi = {
  getAll: () => api.get('/fechas').then(r => r.data),
  create: (fecha: string, horarios: string[]) => api.post('/fechas', { fecha, horarios }).then(r => r.data),
  update: (id: number, activo: boolean, horarios: { hora: string }[]) => api.put(`/fechas/${id}`, { activo, horarios }).then(r => r.data),
  toggleActivo: (id: number, activo: boolean) => api.put(`/fechas/${id}`, { activo }).then(r => r.data),
  delete: (id: number) => api.delete(`/fechas/${id}`).then(r => r.data)
}

export const configApi = {
  get: () => api.get('/config').then(r => r.data),
  update: (clave: string, valor: string) => api.put('/config', { clave, valor }).then(r => r.data),
  generarFechas: () => api.post('/config/generar-fechas').then(r => r.data)
}

export const uploadApi = {
  imagen: (file: File) => {
    const formData = new FormData()
    formData.append('imagen', file)
    return api.post('/upload/imagen', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }).then(r => r.data)
  }
}

export const feedbackApi = {
  create: (pedido_id: number, calificacion: number, comentario?: string) => 
    api.post('/feedback', { pedido_id, calificacion, comentario }).then(r => r.data),
  getByPedido: (pedido_id: number) => 
    api.get(`/feedback/pedido/${pedido_id}`).then(r => r.data),
  getMisPedidos: () => 
    api.get('/feedback/mis-pedidos').then(r => r.data)
}
