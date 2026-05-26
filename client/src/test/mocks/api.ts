import { vi } from 'vitest'

export const mockPlatos = [
  { id: 1, nombre: 'Ensalada César', descripcion: 'Lechuga, pollo, croutons', precio: 9.50, categoria_id: 1, disponible: true, destacado: false, categoria: 'Entrantes' },
  { id: 2, nombre: 'Spaghetti Bolognese', descripcion: 'Pasta con salsa', precio: 12.00, categoria_id: 2, disponible: true, destacado: true, categoria: 'Principales' },
]

export const mockCategorias = [
  { id: 1, nombre: 'Entrantes', icono: '🥗', orden: 1 },
  { id: 2, nombre: 'Principales', icono: '🍝', orden: 2 },
]

export function setupApiMocks() {
  vi.mock('../services/api', () => ({
    API_URL: 'http://localhost:3000/api',
    platosApi: {
      getAll: vi.fn().mockResolvedValue(mockPlatos),
      getById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    categoriasApi: {
      getAll: vi.fn().mockResolvedValue(mockCategorias),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    pedidosApi: {
      create: vi.fn(),
      getAll: vi.fn(),
      getMine: vi.fn(),
      getStats: vi.fn(),
      updateEstado: vi.fn(),
    },
    authApi: {
      login: vi.fn(),
      register: vi.fn(),
      verificarEmail: vi.fn(),
    },
    usuariosApi: {
      getSolicitudes: vi.fn(),
      getAll: vi.fn(),
      aprobar: vi.fn(),
      rechazar: vi.fn(),
      delete: vi.fn(),
      updateRol: vi.fn(),
    },
    fechasApi: {
      getAll: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      toggleActivo: vi.fn(),
      delete: vi.fn(),
    },
    configApi: {
      get: vi.fn(),
      update: vi.fn(),
      generarFechas: vi.fn(),
    },
    uploadApi: {
      imagen: vi.fn(),
    },
    feedbackApi: {
      create: vi.fn(),
      getByPedido: vi.fn(),
      getMisPedidos: vi.fn(),
    },
  }))
}
