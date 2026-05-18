import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useAuth } from '../context/AuthContext'

export default function Register() {
  const [nombre, setNombre] = useState('')
  const [apellidos, setApellidos] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden')
      return
    }

    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres')
      return
    }

    setLoading(true)
    const result = await register(nombre, apellidos, email, password)
    if (result.success) {
      navigate('/')
    } else {
      setError(result.error || 'Error al registrar')
    }
    setLoading(false)
  }

  return (
    <>
      <Helmet>
        <title>Registro | PetriGastro</title>
      </Helmet>

      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-surface rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-center mb-8 font-heading">Crear Cuenta</h1>

          {error && (
            <div className="bg-error/10 border border-error/30 text-error px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Nombre</label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full px-4 py-3 border border-border rounded-lg bg-bg-secondary"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Apellidos</label>
              <input
                type="text"
                value={apellidos}
                onChange={(e) => setApellidos(e.target.value)}
                className="w-full px-4 py-3 border border-border rounded-lg bg-bg-secondary"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-border rounded-lg bg-bg-secondary"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-border rounded-lg bg-bg-secondary"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Confirmar Contraseña</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 border border-border rounded-lg bg-bg-secondary"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-accent text-white py-3 rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50"
            >
              {loading ? 'Registrando...' : 'Crear Cuenta'}
            </button>
          </form>

          <p className="text-center mt-6 text-text-muted">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="text-accent hover:underline">
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </>
  )
}