export interface User {
  id: number
  nombre: string
  apellidos: string
  email: string
  rol: 'admin' | 'cliente'
}

export interface Plato {
  id: number
  nombre: string
  descripcion: string
  precio: number
  categoria_id: number
  categoria?: string
  imagen_url: string
  disponible: boolean
  destacado: boolean
}

export interface Categoria {
  id: number
  nombre: string
  icono: string
}

export interface CartItem extends Plato {
  cantidad: number
}

export interface Pedido {
  id: number
  usuario_id: number
  usuario?: { nombre: string }
  total: number
  notas: string
  estado: 'pendiente' | 'confirmado' | 'preparando' | 'preparado' | 'entregado' | 'cancelado'
  created_at: string
}

export interface Reserva {
  id: number
  nombre: string
  email: string
  telefono: string
  fecha: string
  hora: string
  personas: number
  notas: string
  estado: 'pendiente' | 'confirmado' | 'cancelado'
}

export interface Testimonial {
  id: number
  rating: number
  text: string
  author: string
  role: string
  avatar: string
}
