import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useAuth } from '../context/AuthContext'
import { ArrowRight, UserPlus } from 'lucide-react'

export default function Login() {
  const [isRegisterMode, setIsRegisterMode] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nombre, setNombre] = useState('')
  const [apellidos, setApellidos] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login, register } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/'

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const result = await login(email, password)
    setLoading(false)
    if (result.success) {
      navigate(from, { replace: true })
    } else {
      setError(result.error || 'Credenciales inválidas')
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setError('')
    if (regPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden')
      return
    }
    if (regPassword.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres')
      return
    }
    setLoading(true)
    const result = await register(nombre, apellidos, regEmail, regPassword)
    setLoading(false)
    if (result.success) {
      navigate(from, { replace: true })
    } else {
      setError(result.error || 'Error al registrarse')
    }
  }

  return (
    <>
      <Helmet>
        <title>{isRegisterMode ? 'Solicitar Acceso' : 'Login'} | PetriGastro</title>
      </Helmet>

      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <svg className="w-16 h-16 mx-auto mb-4" viewBox="0 0 100 100" fill="none">
              <circle cx="50" cy="50" r="45" className="fill-accent"/>
              <path d="M30 50 Q50 30 70 50 Q50 70 30 50" className="fill-carbon"/>
            </svg>
            <h1 className="text-3xl font-bold font-heading text-carbon">PetriGastro</h1>
            <p className="text-text-muted mt-2">
              {isRegisterMode ? 'Solicita tu acceso al sistema' : 'Accede a tu cuenta'}
            </p>
          </div>

          <div className="bg-surface rounded-lg shadow-lg p-8">
            {error && (
              <div className="bg-error/10 border border-error/30 text-error px-4 py-3 rounded mb-4 text-sm">
                {error}
              </div>
            )}

            {!isRegisterMode ? (
              <form onSubmit={handleLogin} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-carbon">Correo electrónico</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-border rounded-lg bg-bg-secondary text-carbon focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition"
                    placeholder="tu@correo.com"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-carbon">Contraseña</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-border rounded-lg bg-bg-secondary text-carbon focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition"
                    placeholder="••••••••"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-accent text-white py-3 rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Iniciar Sesión</span>
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5 text-carbon">Nombre</label>
                    <input
                      type="text"
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      className="w-full px-4 py-3 border border-border rounded-lg bg-bg-secondary text-carbon focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition"
                      placeholder="Juan"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5 text-carbon">Apellidos</label>
                    <input
                      type="text"
                      value={apellidos}
                      onChange={(e) => setApellidos(e.target.value)}
                      className="w-full px-4 py-3 border border-border rounded-lg bg-bg-secondary text-carbon focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition"
                      placeholder="García López"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-carbon">Correo electrónico</label>
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-border rounded-lg bg-bg-secondary text-carbon focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition"
                    placeholder="tu@correo.com"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-carbon">Contraseña</label>
                  <input
                    type="password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-border rounded-lg bg-bg-secondary text-carbon focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition"
                    placeholder="Mínimo 8 caracteres"
                    minLength={8}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-carbon">Confirmar contraseña</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-border rounded-lg bg-bg-secondary text-carbon focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition"
                    placeholder="Repite la contraseña"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-accent text-white py-3 rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Solicitar Acceso</span>
                      <UserPlus size={18} />
                    </>
                  )}
                </button>
              </form>
            )}

            <div className="mt-6 pt-5 border-t border-border">
              {!isRegisterMode ? (
                <button
                  type="button"
                  onClick={() => { setIsRegisterMode(true); setError('') }}
                  className="w-full text-accent font-medium hover:underline text-sm text-center"
                >
                  ¿No tienes cuenta? Solicita acceso aquí
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => { setIsRegisterMode(false); setError('') }}
                  className="w-full text-accent font-medium hover:underline text-sm text-center"
                >
                  ¿Ya tienes cuenta? Inicia sesión
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
