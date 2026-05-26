import { useState } from 'react'
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useToast } from '../../context/ToastContext'
import { fechasApi } from '../../services/api'

export function FechasManager() {
  const queryClient = useQueryClient()
  const { addToast } = useToast()
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingFecha, setEditingFecha] = useState<{ id: number; activo: boolean; horarios: string[] } | null>(null)
  const [showAllFechas, setShowAllFechas] = useState(false)
  const [newFecha, setNewFecha] = useState({ fecha: '', horarios: ['12:00', '13:00', '19:00', '20:00', '21:00'] })

  const { data: fechas = [], isLoading: loadingFechas } = useQuery({
    queryKey: ['fechas'],
    queryFn: fechasApi.getAll
  })

  const createFechaMutation = useMutation({
    mutationFn: ({ fecha, horarios }: { fecha: string; horarios: string[] }) =>
      fechasApi.create(fecha, horarios),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fechas'] })
      setShowAddForm(false)
      setNewFecha({ fecha: '', horarios: ['12:00', '13:00', '19:00', '20:00', '21:00'] })
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      addToast(error.response?.data?.message || 'Error al crear la fecha', 'error')
    }
  })

  const updateFechaMutation = useMutation({
    mutationFn: ({ id, activo, horarios }: { id: number; activo: boolean; horarios: { hora: string }[] }) =>
      fechasApi.update(id, activo, horarios),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fechas'] })
      setEditingFecha(null)
    }
  })

  const toggleFechaMutation = useMutation({
    mutationFn: ({ id, activo }: { id: number; activo: boolean }) =>
      fechasApi.toggleActivo(id, activo),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['fechas'] })
  })

  const deleteFechaMutation = useMutation({
    mutationFn: (id: number) => fechasApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['fechas'] })
  })

  const availableHours = ['11:00', '12:00', '13:00', '14:00', '19:00', '20:00', '21:00', '22:00']

  const handleAddFecha = (e: React.FormEvent) => {
    e.preventDefault()
    createFechaMutation.mutate({ fecha: newFecha.fecha, horarios: newFecha.horarios })
  }

  const handleEditFecha = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingFecha) return
    updateFechaMutation.mutate({
      id: editingFecha.id,
      activo: editingFecha.activo,
      horarios: editingFecha.horarios.map((h: string) => ({ hora: h }))
    })
  }

  const toggleHorarioInNewFecha = (hora: string) => {
    setNewFecha(prev => ({
      ...prev,
      horarios: prev.horarios.includes(hora)
        ? prev.horarios.filter(h => h !== hora)
        : [...prev.horarios, hora].sort()
    }))
  }

  const toggleHorarioInEdit = (hora: string) => {
    if (!editingFecha) return
    setEditingFecha(prev => ({
      ...prev,
      horarios: prev.horarios.includes(hora)
        ? prev.horarios.filter((h: string) => h !== hora)
        : [...prev.horarios, hora].sort()
    }))
  }

  if (loadingFechas) {
    return <div className="flex items-center justify-center py-12" role="status" aria-live="polite"><Loader2 className="animate-spin text-accent" size={40} /><span className="sr-only">Cargando fechas...</span></div>
  }

  const fechasFiltradas = showAllFechas ? fechas : fechas.filter((f: { activo: boolean }) => f.activo)

  return (
    <div>
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <h2 className="text-2xl font-bold font-heading">Gestión de Fechas</h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 rounded-lg bg-accent text-carbon font-medium hover:opacity-90 transition flex items-center gap-2"
        >
          <Plus size={20} />
          {showAddForm ? 'Cancelar' : 'Añadir Fecha'}
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAddFecha} className="bg-surface p-6 rounded-lg shadow mb-6 space-y-4">
          <h3 className="text-lg font-semibold">Nueva fecha disponible</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Fecha *</label>
              <input
                type="date"
                value={newFecha.fecha}
                onChange={(e) => setNewFecha({ ...newFecha, fecha: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 border border-border rounded-lg bg-bg-secondary"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Horarios disponibles</label>
              <div className="flex flex-wrap gap-2">
                {availableHours.map(hora => (
                  <button
                    key={hora}
                    type="button"
                    onClick={() => toggleHorarioInNewFecha(hora)}
                    className={`px-3 py-1.5 rounded-lg text-sm transition ${
                      newFecha.horarios.includes(hora)
                        ? 'bg-accent text-carbon'
                        : 'bg-bg-secondary text-text-muted'
                    }`}
                  >
                    {hora}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <button
            type="submit"
            disabled={createFechaMutation.isPending || newFecha.horarios.length === 0}
            className="px-6 py-2 rounded-lg bg-accent text-carbon font-medium hover:opacity-90 transition disabled:opacity-50"
          >
            {createFechaMutation.isPending ? 'Creando...' : 'Crear Fecha'}
          </button>
        </form>
      )}

      <div className="bg-surface p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">
            Fechas disponibles ({fechasFiltradas.length})
          </h3>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showAllFechas}
              onChange={(e) => setShowAllFechas(e.target.checked)}
              className="w-4 h-4 rounded border-border accent-accent"
            />
            <span className="text-sm">Ver inactivas</span>
          </label>
        </div>

        {fechasFiltradas.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-text-muted mb-4">No hay fechas disponibles.</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="text-carbon hover:text-accent underline"
            >
              Añadir primera fecha
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {fechasFiltradas.map((fecha: { id: number; activo: boolean; fecha: string; horarios?: { id: number; hora: string; disponible: boolean }[] }) => (
              <div key={fecha.id} className={`p-4 rounded-lg border ${fecha.activo ? 'border-accent' : 'border-border opacity-60'}`}>
                {editingFecha?.id === fecha.id ? (
                  <form onSubmit={handleEditFecha} className="space-y-3">
                    <div className="flex justify-between items-center">
                      <h4 className="font-bold text-carbon">
                        {new Date(fecha.fecha).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                      </h4>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingFecha(null)}
                          className="px-3 py-1 rounded bg-bg-secondary text-sm"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          disabled={updateFechaMutation.isPending || editingFecha.horarios.length === 0}
                          className="px-3 py-1 rounded bg-accent text-carbon text-sm disabled:opacity-50"
                        >
                          Guardar
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {availableHours.map(hora => (
                        <button
                          key={hora}
                          type="button"
                          onClick={() => toggleHorarioInEdit(hora)}
                          className={`px-3 py-1.5 rounded-lg text-sm transition ${
                            editingFecha.horarios.includes(hora)
                              ? 'bg-accent text-carbon'
                              : 'bg-bg-secondary text-text-muted'
                          }`}
                        >
                          {hora}
                        </button>
                      ))}
                    </div>
                  </form>
                ) : (
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className={`font-bold ${fecha.activo ? 'text-carbon' : 'text-text-muted'}`}>
                        {new Date(fecha.fecha).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                      </h4>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {fecha.horarios?.map((h: { id: number; hora: string; disponible: boolean }) => (
                          <span
                            key={h.id || h.hora}
                            className={`px-2 py-0.5 rounded text-xs ${
                              h.disponible
                                ? 'bg-accent/20 text-accent'
                                : 'bg-gray-100 text-gray-400'
                            }`}
                          >
                            {h.hora}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => setEditingFecha({
                          id: fecha.id,
                          activo: fecha.activo,
                          horarios: fecha.horarios?.map((h: { hora: string }) => h.hora) || []
                        })}
                        className="p-2 rounded hover:bg-bg-secondary text-text-muted hover:text-accent"
                        title="Editar horarios"
                      >
                        <Pencil size={18} />
                      </button>
                      <button
                        onClick={() => toggleFechaMutation.mutate({ id: fecha.id, activo: !fecha.activo })}
                        className={`px-3 py-1 rounded text-xs font-medium ${
                          fecha.activo
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        }`}
                      >
                        {fecha.activo ? '✓ Activo' : '○ Inactivo'}
                      </button>
                      <button
                        onClick={() => { if (confirm('¿Eliminar esta fecha?')) deleteFechaMutation.mutate(fecha.id) }}
                        className="p-2 rounded hover:bg-error/10 text-error"
                        title="Eliminar"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
