import { describe, it, expect, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '../test/helpers'
import MenuCard from './MenuCard'
import { mockPlatos, setupApiMocks } from '../test/mocks/api'

describe('MenuCard', () => {
  beforeEach(() => {
    setupApiMocks()
  })

  it('renders dish name and price', () => {
    renderWithProviders(<MenuCard plato={mockPlatos[0]} />)
    expect(screen.getByText('Ensalada César')).toBeInTheDocument()
    expect(screen.getByText('9.50€')).toBeInTheDocument()
  })

  it('shows "Añadir" button', () => {
    renderWithProviders(<MenuCard plato={mockPlatos[0]} />)
    expect(screen.getByRole('button', { name: /Añadir/ })).toBeInTheDocument()
  })

  it('shows category badge when categoria is present', () => {
    renderWithProviders(<MenuCard plato={mockPlatos[0]} />)
    expect(screen.getByText('Entrantes')).toBeInTheDocument()
  })
})
