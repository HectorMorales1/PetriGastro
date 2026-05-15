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
  getAll: (params) => api.get('/categorias', { params }).then(r => r.data)
}

export const pedidosApi = {
  create: (data) => api.post('/pedidos', data).then(r => r.data),
  getAll: () => api.get('/pedidos').then(r => r.data),
  getMine: () => api.get('/pedidos/mios').then(r => r.data),
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