import axios from 'axios'
import { QueryClient } from '@tanstack/react-query'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('petri_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

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
  getAll: () => api.get('/pedidos').then(r => r.data),
  getMine: () => api.get('/pedidos/mios').then(r => r.data),
  getStats: (filter?: string) => api.get('/pedidos/stats', { params: { filter } }).then(r => r.data),
  updateEstado: (id, estado) => api.put(`/pedidos/${id}/estado`, { estado }).then(r => r.data)
}

export const reservasApi = {
  create: (data) => api.post('/reservas', data).then(r => r.data),
  getAll: () => api.get('/reservas').then(r => r.data)
}

export const authApi = {
  login: (email, password) => api.post('/auth/login', { email, password }).then(r => r.data),
  register: (nombre, apellidos, email, password) => api.post('/auth/register', { nombre, apellidos, email, password }).then(r => r.data)
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