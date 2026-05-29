import { Pool } from 'pg'
import jwt from 'jsonwebtoken'
import app from '../app'

export function createTestApp() {
  return app
}

export async function createTestPool(): Promise<Pool> {
  const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10) || 5432,
    database: process.env.DB_NAME || 'petrigastro_test',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
  })
  return pool
}

export function createTestToken(overrides: Partial<{
  id: number
  email: string
  nombre: string
  apellidos: string
  rol: string
  estado_solicitud: string
  token_version: number
}> = {}): string {
  const payload = {
    id: overrides.id ?? 999,
    email: overrides.email ?? 'test@test.com',
    nombre: overrides.nombre ?? 'Test',
    apellidos: overrides.apellidos ?? 'User',
    rol: overrides.rol ?? 'cliente',
    estado_solicitud: overrides.estado_solicitud ?? 'aprobado',
    token_version: overrides.token_version ?? 0,
  }
  return jwt.sign(payload, process.env.JWT_SECRET || 'test-secret', { expiresIn: '15m' })
}

export function createExpiredToken(): string {
  return jwt.sign(
    { id: 999, email: 'test@test.com', rol: 'cliente' },
    process.env.JWT_SECRET || 'test-secret',
    { expiresIn: '0s' }
  )
}
