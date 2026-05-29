import { describe, it, expect } from 'vitest'
import request from 'supertest'
import { createTestApp, createTestToken, createExpiredToken } from './helpers'

const app = createTestApp()

describe('Auth - Authentication & Authorization', () => {
  describe('POST /api/auth/register', () => {
    it('should reject registration with missing fields', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'test@test.com' })
      expect(res.status).toBe(400)
    })

    it('should reject registration with short password', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          nombre: 'Test',
          email: 'new-test@test.com',
          password: '123'
        })
      expect(res.status).toBe(400)
    })

    it('should reject registration with invalid email', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          nombre: 'Test',
          email: 'not-an-email',
          password: 'password123'
        })
      expect(res.status).toBe(400)
    })
  })

  describe('POST /api/auth/login', () => {
    it('should reject login with missing credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({})
      expect(res.status).toBe(400)
    })

    it('should reject login with invalid email format', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'bademail', password: 'any' })
      expect(res.status).toBe(400)
    })
  })

  describe('GET /api/auth/me', () => {
    it('should reject unauthenticated request', async () => {
      const res = await request(app).get('/api/auth/me')
      expect(res.status).toBe(401)
    })

    it('should reject request without Bearer prefix', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Invalid token')
      expect(res.status).toBe(401)
    })

    it('should reject expired token', async () => {
      const token = createExpiredToken()
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`)
      expect(res.status).toBe(401)
    })
  })

  describe('POST /api/auth/refresh', () => {
    it('should reject refresh without body', async () => {
      const res = await request(app)
        .post('/api/auth/refresh')
        .send({})
      expect(res.status).toBe(400)
    })
  })
})

describe('Authorization - Route Protection', () => {
  describe('Admin-only routes', () => {
    const adminRoutes = [
      { method: 'post', path: '/api/platos', body: { nombre: 'test', precio: 10, categoria_id: 1 } },
      { method: 'put', path: '/api/platos/1', body: { nombre: 'test' } },
      { method: 'delete', path: '/api/platos/1' },
      { method: 'post', path: '/api/categorias', body: { nombre: 'test' } },
      { method: 'put', path: '/api/categorias/1', body: { nombre: 'test' } },
      { method: 'delete', path: '/api/categorias/1' },
      { method: 'get', path: '/api/pedidos' },
      { method: 'get', path: '/api/pedidos/stats' },
      { method: 'get', path: '/api/usuarios' },
      { method: 'get', path: '/api/usuarios/solicitudes' },
    ]

    adminRoutes.forEach(({ method, path, body }) => {
      it(`should reject ${method.toUpperCase()} ${path} for non-admin users`, async () => {
        const token = createTestToken({ rol: 'cliente' })
        let res
        switch (method) {
          case 'post':
            res = await request(app).post(path).set('Authorization', `Bearer ${token}`).send(body)
            break
          case 'put':
            res = await request(app).put(path).set('Authorization', `Bearer ${token}`).send(body)
            break
          case 'delete':
            res = await request(app).delete(path).set('Authorization', `Bearer ${token}`)
            break
          case 'get':
            res = await request(app).get(path).set('Authorization', `Bearer ${token}`)
            break
        }
        expect(res!.status).toBe(403)
      })
    })
  })
})

describe('API - Public Endpoints', () => {
  it('GET /api/platos returns array', async () => {
    const res = await request(app).get('/api/platos')
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
  })

  it('GET /api/platos supports category filter', async () => {
    const res = await request(app).get('/api/platos').query({ categoria: '1' })
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
  })

  it('GET /api/categorias returns array', async () => {
    const res = await request(app).get('/api/categorias')
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
  })

  it('GET /api/fechas returns array', async () => {
    const res = await request(app).get('/api/fechas')
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
  })

  it('GET /api/config returns object', async () => {
    const res = await request(app).get('/api/config')
    expect(res.status).toBe(200)
    expect(typeof res.body).toBe('object')
  })

  it('GET / returns health check', async () => {
    const res = await request(app).get('/')
    expect(res.status).toBe(200)
    expect(res.body.status).toBe('ok')
    expect(res.body.service).toBe('PetriGastro API')
  })

  it('GET /nonexistent returns 404', async () => {
    const res = await request(app).get('/nonexistent-route')
    expect(res.status).toBe(404)
  })
})
