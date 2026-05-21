import { Navigate, useLocation, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Loader2 } from 'lucide-react'

interface AuthGuardProps {
  requiredRole?: 'admin' | 'cliente'
}

export default function AuthGuard({ requiredRole }: AuthGuardProps) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <Loader2 className="animate-spin text-accent" size={40} />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (requiredRole && user.rol !== requiredRole) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
