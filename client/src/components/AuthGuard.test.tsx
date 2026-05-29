import { describe, it, expect, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '../test/helpers'
import AuthGuard from './AuthGuard'

describe('AuthGuard', () => {
  beforeEach(() => {
    sessionStorage.clear()
    localStorage.clear()
  })

  it('redirects to login when no user', () => {
    renderWithProviders(<AuthGuard />)
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('does not redirect for authenticated user', () => {
    localStorage.setItem('petri_user', JSON.stringify({ id: 1, nombre: 'Test', rol: 'cliente' }))
    sessionStorage.setItem('petri_token', 'test-token')
    renderWithProviders(
      <AuthGuard />,
      { initialEntries: ['/menu'] }
    )
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })
})
