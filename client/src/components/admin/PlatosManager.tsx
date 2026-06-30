import { useState } from 'react'
import { Pencil, X, Loader2 } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useToast } from '../../context/ToastContext'
import { platosApi, categoriasApi, uploadApi } from '../../services/api'
import type { Plato } from '../../types'
import { Paginacion } from './Paginacion'

const ITEMS_PER_PAGE = 10

export function PlatosManager({ pageNum = 1 }: { pageNum?: number }) {
  const queryClient = useQueryClient()
  const { addToast } = useToast()
  const [showForm, setShowForm] = useState(false)
  const [platoPage, setPlatoPage] = useState(pageNum)
  const [uploading, setUploading] = useState(false)
  const [previewImg, setPreviewImg] = useState('')
  const [editingPlato, setEditingPlato] = useState<Plato | null>(null)
  const [editForm, setEditForm] = useState({
    nombre: '', descripcion: '', ingredientes: '', precio: '', categoria_id: '',
    imagen_url: '', disponible: true, destacado: false
  })
  const [form, setForm] = useState({
    nombre: '', descripcion: '', ingredientes: '', precio: '', categoria_id: '',
    imagen_url: '', disponible: true, destacado: false
  })

  const { data: platosResp, isLoading } = useQuery({
    queryKey: ['platos', 'admin', platoPage],
    queryFn: () => platosApi.getAll({ todas: true, page: platoPage, limit: ITEMS_PER_PAGE })
  })
  const platos = Array.isArray(platosResp) ? platosResp : platosResp?.data || []
  const totalPlatoPages = platosResp?.pagination?.totalPages || 0

  const { data: categoriasResp } = useQuery({
    queryKey: ['categorias'],
    queryFn: () => categoriasApi.getAll()
  })
  const categorias = Array.isArray(categoriasResp) ? categoriasResp : []

  const handleImageUpload = async (file: File, setUrl: (url: string) => void) => {
    const reader = new FileReader()
    reader.onload = (event) => setPreviewImg(event.target?.result as string)
    reader.readAsDataURL(file)

    setUploading(true)
    try {
      const result = await uploadApi.imagen(file)
      setUrl(result.url)
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } }
      addToast(err.response?.data?.message || 'Error al subir la imagen. Verifica la configuración de Cloudinary.', 'error')
    }
    setUploading(false)
  }

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    await handleImageUpload(file, (url) => setForm(prev => ({ ...prev, imagen_url: url })))
  }

  const handleEditImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    await handleImageUpload(file, (url) => setEditForm(prev => ({ ...prev, imagen_url: url })))
  }

  const createMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => platosApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platos'] })
      setShowForm(false)
      setForm({ nombre: '', descripcion: '', ingredientes: '', precio: '', categoria_id: '', imagen_url: '', disponible: true, destacado: false })
      setPreviewImg('')
    }
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<{ disponible: boolean; destacado: boolean }> }) => platosApi.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['platos'] })
  })

  const editMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Record<string, unknown> }) => platosApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platos'] })
      setEditingPlato(null)
      setEditForm({ nombre: '', descripcion: '', ingredientes: '', precio: '', categoria_id: '', imagen_url: '', disponible: true, destacado: false })
      setPreviewImg('')
    }
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => platosApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['platos'] })
  })

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    if (uploading) return
    createMutation.mutate({
      ...form,
      precio: parseFloat(form.precio),
      categoria_id: parseInt(form.categoria_id)
    })
  }

  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingPlato) return
    if (uploading) return
    editMutation.mutate({
      id: editingPlato.id,
      data: {
        ...editForm,
        precio: parseFloat(editForm.precio),
        categoria_id: parseInt(editForm.categoria_id)
      }
    })
  }

  const toggleField = (plato: { id: number; [key: string]: unknown }, field: string) => {
    updateMutation.mutate({ id: plato.id, data: { [field]: !plato[field] } as Partial<{ disponible: boolean; destacado: boolean }> })
  }

  const paginatedPlatos = platos

  if (isLoading) {
    return <div className="flex items-center justify-center py-12" role="status" aria-live="polite"><Loader2 className="animate-spin text-accent" size={40} /><span className="sr-only">Cargando platos...</span></div>
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold font-heading">Gestión de Platos</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 rounded-lg bg-accent text-carbon font-medium hover:opacity-90 transition"
        >
          {showForm ? 'Cancelar' : 'Nuevo Plato'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-card p-6 rounded-lg shadow mb-8 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nombre *</label>
              <input type="text" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-lg bg-bg-secondary" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Precio *</label>
              <input type="number" step="0.01" min="0" value={form.precio} onChange={(e) => setForm({ ...form, precio: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-lg bg-bg-secondary" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Categoría *</label>
              <select value={form.categoria_id} onChange={(e) => setForm({ ...form, categoria_id: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-lg bg-bg-secondary" required>
                <option value="">Seleccionar</option>
                {categorias.map((c: { id: number; nombre: string }) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Descripción</label>
              <textarea value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-lg bg-bg-secondary" rows={2} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Ingredientes</label>
              <textarea value={form.ingredientes} onChange={(e) => setForm({ ...form, ingredientes: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-lg bg-bg-secondary" rows={2} placeholder="Ej: Harina, tomate, queso, albahaca" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Imagen</label>
              <input 
                type="file" 
                accept="image/*"
                onChange={handleImageSelect}
                className="w-full px-3 py-2 border border-border rounded-lg bg-bg-secondary file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-accent file:text-white file:cursor-pointer"
              />
              {(previewImg || form.imagen_url) && (
                <div className="mt-2 relative w-24 h-24 rounded-lg overflow-hidden border border-border">
                  <img
                    src={previewImg || form.imagen_url}
                    alt={form.nombre ? `Vista previa de ${form.nombre}` : 'Vista previa de la imagen'}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => { setForm({ ...form, imagen_url: '' }); setPreviewImg('') }}
                    className="absolute top-1 right-1 bg-error text-white rounded-full p-1 hover:opacity-90"
                  >
                    <X size={12} />
                  </button>
                </div>
              )}
              {uploading && <p className="text-sm text-text-muted mt-1">Subiendo imagen...</p>}
            </div>
            <div className="flex items-end gap-6 pb-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.disponible} onChange={(e) => setForm({ ...form, disponible: e.target.checked })}
                  className="w-4 h-4 rounded border-border accent-accent" />
                <span className="text-sm font-medium">Disponible</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.destacado} onChange={(e) => setForm({ ...form, destacado: e.target.checked })}
                  className="w-4 h-4 rounded border-border accent-accent" />
                <span className="text-sm font-medium">Destacado</span>
              </label>
            </div>
          </div>
          <button type="submit" disabled={createMutation.isPending || uploading}
            className="px-6 py-2 rounded-lg bg-accent text-carbon font-medium hover:opacity-90 transition disabled:opacity-50">
            {createMutation.isPending ? 'Creando...' : 'Crear Plato'}
          </button>
        </form>
      )}

      {editingPlato && (
        <form onSubmit={handleEdit} className="bg-card p-6 rounded-lg shadow mb-8 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Editando: {editingPlato.nombre}</h3>
            <button
              type="button"
              onClick={() => { setEditingPlato(null); setEditForm({ nombre: '', descripcion: '', ingredientes: '', precio: '', categoria_id: '', imagen_url: '', disponible: true, destacado: false }); setPreviewImg('') }}
              className="px-3 py-1 rounded bg-bg-secondary text-sm"
            >
              Cancelar
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nombre *</label>
              <input type="text" value={editForm.nombre} onChange={(e) => setEditForm({ ...editForm, nombre: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-lg bg-bg-secondary" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Precio *</label>
              <input type="number" step="0.01" min="0" value={editForm.precio} onChange={(e) => setEditForm({ ...editForm, precio: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-lg bg-bg-secondary" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Categoría *</label>
              <select value={editForm.categoria_id} onChange={(e) => setEditForm({ ...editForm, categoria_id: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-lg bg-bg-secondary" required>
                <option value="">Seleccionar</option>
                {categorias.map((c: { id: number; nombre: string }) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Descripción</label>
              <textarea value={editForm.descripcion} onChange={(e) => setEditForm({ ...editForm, descripcion: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-lg bg-bg-secondary" rows={2} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Ingredientes</label>
              <textarea value={editForm.ingredientes} onChange={(e) => setEditForm({ ...editForm, ingredientes: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-lg bg-bg-secondary" rows={2} placeholder="Ej: Harina, tomate, queso, albahaca" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Imagen</label>
              <input 
                type="file" 
                accept="image/*"
                onChange={handleEditImageSelect}
                className="w-full px-3 py-2 border border-border rounded-lg bg-bg-secondary file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-accent file:text-white file:cursor-pointer"
              />
              {(previewImg || editForm.imagen_url) && (
                <div className="mt-2 relative w-24 h-24 rounded-lg overflow-hidden border border-border">
                  <img
                    src={previewImg || editForm.imagen_url}
                    alt="Vista previa de la imagen"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => { setEditForm({ ...editForm, imagen_url: '' }); setPreviewImg('') }}
                    className="absolute top-1 right-1 bg-error text-white rounded-full p-1 hover:opacity-90"
                  >
                    <X size={12} />
                  </button>
                </div>
              )}
              {uploading && <p className="text-sm text-text-muted mt-1">Subiendo imagen...</p>}
            </div>
            <div className="flex items-end gap-6 pb-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={editForm.disponible} onChange={(e) => setEditForm({ ...editForm, disponible: e.target.checked })}
                  className="w-4 h-4 rounded border-border accent-accent" />
                <span className="text-sm font-medium">Disponible</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={editForm.destacado} onChange={(e) => setEditForm({ ...editForm, destacado: e.target.checked })}
                  className="w-4 h-4 rounded border-border accent-accent" />
                <span className="text-sm font-medium">Destacado</span>
              </label>
            </div>
          </div>
          <button type="submit" disabled={editMutation.isPending || uploading}
            className="px-6 py-2 rounded-lg bg-accent text-carbon font-medium hover:opacity-90 transition disabled:opacity-50">
            {editMutation.isPending ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {paginatedPlatos.map(plato => (
          <div key={plato.id} className="bg-card rounded-lg shadow p-4 space-y-3">
            <div className="flex items-center gap-3">
              {plato.imagen_url ? (
                <img src={plato.imagen_url} alt={plato.nombre} className="w-14 h-14 rounded-lg object-cover shrink-0" />
              ) : (
                <div className="w-14 h-14 rounded-lg bg-bg-secondary flex items-center justify-center text-xl shrink-0">🍽️</div>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-text-muted uppercase">#{plato.id}</span>
                  <span className="font-bold text-carbon shrink-0">{Number(plato.precio || 0).toFixed(2)}€</span>
                </div>
                <h3 className="font-semibold truncate">{plato.nombre}</h3>
                <p className="text-sm text-text-muted truncate">{plato.categoria || '-'}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 pt-2 border-t border-border">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <button
                  onClick={() => toggleField(plato, 'disponible')}
                  className={`w-8 h-5 rounded-full transition relative ${plato.disponible ? 'bg-accent' : 'bg-gray-400 dark:bg-gray-600'}`}
                  role="switch"
                  aria-checked={plato.disponible}
                  aria-label={`${plato.nombre} ${plato.disponible ? 'disponible' : 'no disponible'}`}
                >
                  <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition ${plato.disponible ? 'left-4' : 'left-0.5'}`} />
                </button>
                <span className="text-text-muted">Disponible</span>
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <button
                  onClick={() => toggleField(plato, 'destacado')}
                  className={`w-8 h-5 rounded-full transition relative ${plato.destacado ? 'bg-accent' : 'bg-gray-400 dark:bg-gray-600'}`}
                  role="switch"
                  aria-checked={plato.destacado}
                  aria-label={`${plato.nombre} ${plato.destacado ? 'destacado' : 'no destacado'}`}
                >
                  <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition ${plato.destacado ? 'left-4' : 'left-0.5'}`} />
                </button>
                <span className="text-text-muted">Destacado</span>
              </label>
            </div>
            <div className="flex items-center gap-3 pt-2 border-t border-border">
              <button
                onClick={() => {
                  setEditingPlato(plato)
                  setEditForm({
                    nombre: plato.nombre,
                    descripcion: plato.descripcion || '',
                    ingredientes: plato.ingredientes || '',
                    precio: String(plato.precio),
                    categoria_id: String(plato.categoria_id),
                    imagen_url: plato.imagen_url || '',
                    disponible: plato.disponible,
                    destacado: plato.destacado
                  })
                  setPreviewImg(plato.imagen_url || '')
                }}
                className="text-carbon hover:text-accent transition text-sm flex items-center gap-1"
              >
                <Pencil size={14} />
                Editar
              </button>
              <button
                onClick={() => { if (confirm('¿Eliminar este plato?')) deleteMutation.mutate(plato.id) }}
                className="text-error hover:opacity-80 transition text-sm"
                disabled={deleteMutation.isPending}
              >
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>
      <Paginacion currentPage={platoPage} totalPages={totalPlatoPages} onPageChange={setPlatoPage} />
      {platos.length === 0 && !isLoading && (
        <p className="text-center py-8 text-text-muted">No hay platos registrados.</p>
      )}
    </div>
  )
}
