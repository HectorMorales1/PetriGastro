import { useState } from 'react'
import { Plus, Trash2, Loader2 } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useToast } from '../../context/ToastContext'
import { categoriasApi } from '../../services/api'

export function CategoriasManager() {
  const queryClient = useQueryClient()
  const { addToast } = useToast()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ nombre: '', icono: '🍽️', orden: 0 })

  const { data: categorias = [], isLoading } = useQuery({
    queryKey: ['categorias'],
    queryFn: () => categoriasApi.getAll()
  })

  const createMutation = useMutation({
    mutationFn: (data: { nombre: string; icono: string; orden: number }) => categoriasApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categorias'] })
      setShowForm(false)
      setForm({ nombre: '', icono: '🍽️', orden: 0 })
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      addToast(error.response?.data?.message || 'Error al crear categoría', 'error')
    }
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => categoriasApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categorias'] }),
    onError: () => addToast('Error al eliminar categoría', 'error')
  })

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    createMutation.mutate(form)
  }

  if (isLoading) {
    return <div className="flex items-center justify-center py-12" role="status" aria-live="polite"><Loader2 className="animate-spin text-accent" size={40} /><span className="sr-only">Cargando categorías...</span></div>
  }

  const iconos = ['🍽️', '🍕', '🍔', '🌮', '🍣', '🥗', '🍷', '☕', '🍰', '🥘']

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold font-heading">Gestión de Categorías</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 rounded-lg bg-accent text-carbon font-medium hover:opacity-90 transition flex items-center gap-2"
        >
          <Plus size={20} />
          {showForm ? 'Cancelar' : 'Nueva Categoría'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-card p-6 rounded-lg shadow mb-8 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nombre *</label>
              <input
                type="text"
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-lg bg-bg-secondary"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Icono</label>
              <div className="flex flex-wrap gap-2">
                {iconos.map(icono => (
                  <button
                    key={icono}
                    type="button"
                    onClick={() => setForm({ ...form, icono })}
                    className={`w-11 h-11 sm:w-10 sm:h-10 rounded-lg text-xl flex items-center justify-center transition ${
                      form.icono === icono ? 'bg-accent' : 'bg-bg-secondary hover:bg-border'
                    }`}
                  >
                    {icono}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Orden</label>
              <input
                type="number"
                value={form.orden}
                onChange={(e) => setForm({ ...form, orden: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-border rounded-lg bg-bg-secondary"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={createMutation.isPending || !form.nombre}
            className="px-6 py-2 rounded-lg bg-accent text-carbon font-medium hover:opacity-90 transition disabled:opacity-50"
          >
            {createMutation.isPending ? 'Creando...' : 'Crear Categoría'}
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 gap-4 mx-auto max-w-4xl">
        {categorias.map((cat: { id: number; icono: string; nombre: string; orden: number }) => (
          <div key={cat.id} className="bg-card rounded-lg shadow p-4 md:px-4 md:py-3 space-y-2 md:space-y-0 md:grid md:grid-cols-[1fr_90px_auto] md:gap-4 md:items-center">
            <div className="flex items-center gap-3 min-w-0">
              <span className="text-2xl shrink-0">{cat.icono}</span>
              <h3 className="font-semibold truncate">{cat.nombre}</h3>
            </div>
            <div className="flex md:block justify-between md:text-center">
              <span className="md:hidden text-text-muted text-xs">Orden: </span>
              <span className="text-sm text-text-muted">{cat.orden || 0}</span>
            </div>
            <div className="flex justify-start md:justify-end pt-1 md:pt-0">
              <button
                onClick={() => { if (confirm('¿Eliminar esta categoría?')) deleteMutation.mutate(cat.id) }}
                className="h-11 flex items-center gap-1.5 px-3 rounded-lg text-error hover:bg-error/10 transition text-sm"
                disabled={deleteMutation.isPending}
              >
                <Trash2 size={16} />
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>
      {categorias.length === 0 && !isLoading && (
        <p className="text-center py-8 text-text-muted">No hay categorías registradas.</p>
      )}
    </div>
  )
}
