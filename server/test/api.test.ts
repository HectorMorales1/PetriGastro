import { describe, it, expect } from 'vitest'
import request from 'supertest'
import { createTestApp } from './helpers'

const app = createTestApp()

describe('API Health Check', () => {
  it('GET / returns status ok', async () => {
    const res = await request(app).get('/')
    expect(res.status).toBe(200)
    expect(res.body.status).toBe('ok')
    expect(res.body.service).toBe('PetriGastro API')
  })

  it('GET /api/platos returns platos list', async () => {
    const res = await request(app).get('/api/platos')
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
  })

  it('GET /api/categorias returns categorias list', async () => {
    const res = await request(app).get('/api/categorias')
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
  })
})
