import { Loader2 } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useToast } from '../../context/ToastContext'
import { usuariosApi } from '../../services/api'

export function UsuariosManager() {
  const queryClient = useQueryClient()
  const { addToast } = useToast()

  const { data: usuariosResp, isLoading, isError, error } = useQuery({
    queryKey: ['usuarios'],
    queryFn: () => usuariosApi.getAll({ limit: 100 })
  })
  const usuarios = usuariosResp?.data ?? []

  const updateRolMutation = useMutation({
    mutationFn: ({ id, rol }: { id: number; rol: string }) => usuariosApi.updateRol(id, rol),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] })
      addToast('Rol actualizado correctamente', 'success')
    },
    onError: () => addToast('Error al cambiar el rol', 'error')
  })

  const deleteUserMutation = useMutation({
    mutationFn: (id: number) => usuariosApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] })
      addToast('Usuario eliminado correctamente', 'success')
    },
    onError: () => addToast('Error al eliminar el usuario', 'error')
  })

  if (isLoading) {
    return <div className="flex items-center justify-center py-12" role="status" aria-live="polite"><Loader2 className="animate-spin text-accent" size={40} /><span className="sr-only">Cargando usuarios...</span></div>
  }

  if (isError) {
    return (
      <div className="text-center py-12" role="alert">
        <p className="text-error text-lg font-medium">Error al cargar usuarios</p>
        <p className="text-text-muted mt-2">{(error as { message?: string })?.message || 'Intenta recargar la página'}</p>
        <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-accent text-carbon rounded-lg hover:opacity-90">
          Recargar
        </button>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-2xl font-bold font-heading mb-6">Gestión de Usuarios</h2>

      <div className="bg-surface rounded-lg shadow overflow-x-auto overscroll-x-contain">
        <table className="w-full responsive-table">
          <thead className="bg-bg-secondary">
            <tr>
              <th className="px-4 py-3 text-left">Nombre</th>
              <th className="px-4 py-3 text-left">Email</th>
              <th className="px-4 py-3 text-left">Rol</th>
              <th className="px-4 py-3 text-left">Estado</th>
              <th className="px-4 py-3 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((user: { id: number; nombre: string; apellidos: string; email: string; rol: string; estado_solicitud: string }) => (
              <tr key={user.id} className="border-t border-border">
                <td className="px-4 py-3 font-medium" data-label="Nombre">
                  {user.nombre} {user.apellidos}
                </td>
                <td className="px-4 py-3 text-text-muted" data-label="Email">{user.email}</td>
                <td className="px-4 py-3" data-label="Rol">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                    user.rol === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {user.rol}
                  </span>
                </td>
                <td className="px-4 py-3" data-label="Estado">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                    user.estado_solicitud === 'aprobado' || !user.estado_solicitud
                      ? 'bg-green-100 text-green-800'
                      : user.estado_solicitud === 'pendiente'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {user.estado_solicitud || 'aprobado'}
                  </span>
                </td>
                <td className="px-4 py-3 text-center" data-label="Acciones">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => {
                        const newRol = user.rol === 'admin' ? 'cliente' : 'admin'
                        if (confirm(`¿Cambiar el rol de ${user.nombre} ${user.apellidos} a "${newRol}"?`)) {
                          updateRolMutation.mutate({ id: user.id, rol: newRol })
                        }
                      }}
                      disabled={updateRolMutation.isPending}
                      className="px-3 py-1.5 rounded-lg bg-accent/20 text-carbon font-medium text-sm hover:bg-accent/30 transition disabled:opacity-50"
                    >
                      Cambiar Rol
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`¿Eliminar al usuario ${user.nombre} ${user.apellidos}? Esta acción no se puede deshacer.`)) {
                          deleteUserMutation.mutate(user.id)
                        }
                      }}
                      disabled={deleteUserMutation.isPending}
                      className="px-3 py-1.5 rounded-lg bg-error/20 text-error font-medium text-sm hover:bg-error/30 transition disabled:opacity-50"
                    >
                      Borrar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {usuarios.length === 0 && !isLoading && (
          <p className="text-center py-8 text-text-muted">No hay usuarios registrados.</p>
        )}
      </div>
    </div>
  )
}
