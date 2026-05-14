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
      cacheTime: 30 * 60 * 1000,
      refetchOnWindowFocus: false,
      retry: 2
    }
  }
})

export const platosApi = {
  getAll: () => api.get('/platos'),
  getById: (id) => api.get(`/platos/${id}`),
  create: (data) => api.post('/platos', data),
  update: (id, data) => api.put(`/platos/${id}`, data),
  delete: (id) => api.delete(`/platos/${id}`)
}

export const categoriasApi = {
  getAll: () => api.get('/categorias')
}

export const pedidosApi = {
  create: (data) => api.post('/pedidos', data),
  getAll: () => api.get('/pedidos'),
  getMine: () => api.get('/pedidos/mios'),
  updateEstado: (id, estado) => api.put(`/pedidos/${id}/estado`, { estado })
}

export const reservasApi = {
  create: (data) => api.post('/reservas', data),
  getAll: () => api.get('/reservas')
}