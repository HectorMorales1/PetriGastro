import { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useAuth } from '../context/AuthContext'
import { ArrowRight, UserPlus } from 'lucide-react'

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const [isRegisterMode, setIsRegisterMode] = useState(location.state?.registerMode || false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nombre, setNombre] = useState('')
  const [apellidos, setApellidos] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [aceptaTerminos, setAceptaTerminos] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const { login, register } = useAuth()
  const from = location.state?.from?.pathname || '/'

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccessMessage('')
    setLoading(true)
    const result = await login(email, password)
    setLoading(false)
    if (result.success) {
      navigate(from, { replace: true })
    } else {
      if (result.estado_solicitud === 'pendiente_verificacion') {
        setError('Debes verificar tu correo electrónico primero. Revisa tu bandeja de entrada.')
      } else if (result.estado_solicitud === 'pendiente') {
        setError('Tu solicitud está pendiente de aprobación por el administrador.')
      } else if (result.estado_solicitud === 'rechazado') {
        setError(result.error || 'Tu solicitud ha sido rechazada.')
      } else {
        setError(result.error || 'Credenciales inválidas')
      }
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccessMessage('')
    if (regPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden')
      return
    }
    if (regPassword.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres')
      return
    }
    if (!aceptaTerminos) {
      setError('Debes aceptar los términos y condiciones y la política de privacidad')
      return
    }
    setLoading(true)
    const result = await register(nombre, apellidos, regEmail, regPassword)
    setLoading(false)
    if (result.success && result.pending) {
      setSuccessMessage(result.message || 'Se ha enviado un correo de verificación. Revisa tu bandeja de entrada para confirmar tu dirección de correo.')
      setNombre('')
      setApellidos('')
      setRegEmail('')
      setRegPassword('')
      setConfirmPassword('')
      setAceptaTerminos(false)
    } else if (result.success) {
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

      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-6">
            <img src="/logo.png" alt="PetriGastro" className="w-52 h-52 mx-auto mb-6 rounded-full object-cover" />
            <h1 className="text-3xl font-bold font-heading text-carbon">PetriGastro</h1>
            <p className="text-text-muted mt-2">
              {isRegisterMode ? 'Solicita tu acceso al sistema' : 'Accede a tu cuenta'}
            </p>
          </div>

          <div className="bg-card rounded-lg shadow-lg p-8">
            {error && (
              <div className="bg-error/10 border border-error/30 text-error px-4 py-3 rounded mb-4 text-sm" role="alert">
                {error}
              </div>
            )}
            {successMessage && (
              <div className="bg-success/10 border border-success/30 text-success px-4 py-3 rounded mb-4 text-sm" role="alert" aria-live="polite">
                {successMessage}
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
                    className="w-full px-4 py-3 border border-border rounded-lg bg-bg-secondary text-carbon focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition dark:bg-white dark:text-black dark:placeholder:text-gray-400"
                    placeholder="tu@correo.com"
                    autoComplete="email"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-carbon">Contraseña</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-border rounded-lg bg-bg-secondary text-carbon focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition dark:bg-white dark:text-black dark:placeholder:text-gray-400"
                    placeholder="••••••••"
                    autoComplete="current-password"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-accent text-carbon py-3 rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2"
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
              successMessage ? (
                <div className="text-center py-8 space-y-4">
                  <div className="w-16 h-16 mx-auto bg-success/20 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-text-muted">{successMessage}</p>
                  <button
                    onClick={() => { setIsRegisterMode(false); setSuccessMessage('') }}
                    className="text-carbon font-medium hover:underline"
                  >
                    Volver al inicio de sesión
                  </button>
                </div>
              ) : (
                <form onSubmit={handleRegister} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1.5 text-carbon">Nombre</label>
                      <input
                        type="text"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        className="w-full px-4 py-3 border border-border rounded-lg bg-bg-secondary text-carbon focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition dark:bg-white dark:text-black dark:placeholder:text-gray-400"
                        placeholder="Juan"
                        autoComplete="given-name"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5 text-carbon">Apellidos</label>
                      <input
                        type="text"
                        value={apellidos}
                        onChange={(e) => setApellidos(e.target.value)}
                        className="w-full px-4 py-3 border border-border rounded-lg bg-bg-secondary text-carbon focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition dark:bg-white dark:text-black dark:placeholder:text-gray-400"
                        placeholder="García López"
                        autoComplete="family-name"
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
                      className="w-full px-4 py-3 border border-border rounded-lg bg-bg-secondary text-carbon focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition dark:bg-white dark:text-black dark:placeholder:text-gray-400"
                      placeholder="tu@correo.com"
                      autoComplete="email"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5 text-carbon">Contraseña</label>
                  <input
                    type="password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-border rounded-lg bg-bg-secondary text-carbon focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition dark:bg-white dark:text-black dark:placeholder:text-gray-400"
                    placeholder="Mínimo 8 caracteres"
                    autoComplete="new-password"
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
                    className="w-full px-4 py-3 border border-border rounded-lg bg-bg-secondary text-carbon focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition dark:bg-white dark:text-black dark:placeholder:text-gray-400"
                    placeholder="Repite la contraseña"
                    autoComplete="new-password"
                    required
                  />
                  </div>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={aceptaTerminos}
                      onChange={(e) => setAceptaTerminos(e.target.checked)}
                      className="mt-1 h-4 w-4 rounded border-border text-accent focus:ring-accent/20 cursor-pointer"
                    />
                    <span className="text-sm text-text-muted leading-relaxed">
                      He leído y acepto los{' '}
                      <Link to="/terminos" className="text-accent hover:underline font-medium">términos y condiciones</Link>
                      {' '}y la{' '}
                      <Link to="/privacidad" className="text-accent hover:underline font-medium">política de privacidad</Link>
                    </span>
                  </label>
                  <button
                    type="submit"
                    disabled={loading || !aceptaTerminos}
                    className="w-full bg-accent text-carbon py-3 rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2"
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
              )
            )}

            <div className="mt-6 pt-5 border-t border-border">
              {!isRegisterMode ? (
                <button
                  type="button"
                  onClick={() => { setIsRegisterMode(true); setError(''); setSuccessMessage('') }}
                  className="w-full text-carbon font-medium hover:underline text-sm text-center"
                >
                  ¿No tienes cuenta? Solicita acceso aquí
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => { setIsRegisterMode(false); setError(''); setSuccessMessage(''); setAceptaTerminos(false) }}
                  className="w-full text-carbon font-medium hover:underline text-sm text-center"
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
