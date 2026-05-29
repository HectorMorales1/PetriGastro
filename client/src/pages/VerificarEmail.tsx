import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { authApi } from '../services/api'

export default function VerificarEmail() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setMessage('Token de verificación no encontrado.')
      return
    }

    authApi.verificarEmail(token)
      .then((data) => {
        setStatus('success')
        setMessage(data.message || 'Correo verificado correctamente.')
      })
      .catch((err) => {
        setStatus('error')
        setMessage(err.response?.data?.message || 'Error al verificar el correo.')
      })
  }, [token])

  return (
    <>
      <Helmet>
        <title>Verificar Correo | PetriGastro</title>
      </Helmet>

      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="bg-card rounded-lg shadow-lg p-5 sm:p-8 max-w-md w-full text-center">
          {status === 'loading' && (
            <div className="py-8 space-y-4" role="status" aria-live="polite">
              <Loader2 className="animate-spin text-accent mx-auto" size={48} />
              <p className="text-text-muted">Verificando tu correo...</p>
            </div>
          )}

          {status === 'success' && (
            <div className="py-8 space-y-4" role="alert" aria-live="assertive">
              <CheckCircle className="text-success mx-auto" size={48} />
              <h2 className="text-2xl font-bold text-carbon">¡Correo verificado!</h2>
              <p className="text-text-muted">{message}</p>
              <p className="text-text-muted">Ahora tu solicitud está pendiente de aprobación por el administrador.</p>
              <Link
                to="/login"
                className="inline-block mt-4 px-6 py-3 bg-accent text-carbon rounded-lg font-semibold hover:opacity-90 transition"
              >
                Ir al inicio de sesión
              </Link>
            </div>
          )}

          {status === 'error' && (
            <div className="py-8 space-y-4" role="alert" aria-live="assertive">
              <XCircle className="text-error mx-auto" size={48} />
              <h2 className="text-2xl font-bold text-carbon">Error de verificación</h2>
              <p className="text-text-muted">{message}</p>
              <Link
                to="/login"
                className="inline-block mt-4 px-6 py-3 bg-accent text-carbon rounded-lg font-semibold hover:opacity-90 transition"
              >
                Volver al inicio de sesión
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
