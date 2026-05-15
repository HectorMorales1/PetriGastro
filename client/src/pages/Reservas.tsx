import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { reservasApi } from '../services/api'

export default function Reservas() {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    fecha: '',
    hora: '',
    personas: 2,
    notas: ''
  })
  const [enviado, setEnviado] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      await reservasApi.create(formData)
      setEnviado(true)
      setFormData({
        nombre: '',
        email: '',
        telefono: '',
        fecha: '',
        hora: '',
        personas: 2,
        notas: ''
      })
    } catch (error) {
      console.error('Error:', error)
    }

    setLoading(false)
  }

  const horas = [
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '19:00', '19:30', '20:00', '20:30', '21:00', '21:30', '22:00'
  ]

  return (
    <>
      <Helmet>
        <title>Reservas | PetriGastro</title>
        <meta name="description" content="Reserva tu mesa en PetriGastro. Gastronomía mediterránea en Valencia." />
      </Helmet>

      <div className="bg-accent text-white py-16 text-center">
        <h1 className="text-4xl font-bold font-heading">Reserva tu Mesa</h1>
        <p className="mt-4 text-xl">Te esperamos para una experiencia gastronómica única</p>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-12">
        {enviado ? (
          <div className="bg-success/20 border border-success/40 text-success px-6 py-4 rounded-lg text-center">
            <h3 className="text-xl font-bold mb-2">¡Reserva enviada!</h3>
            <p>Te contactaremos para confirmar tu reserva.</p>
            <button
              onClick={() => setEnviado(false)}
              className="mt-4 text-success underline"
            >
              Hacer otra reserva
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6 bg-surface p-8 rounded-lg shadow-lg">
            <div>
              <label className="block text-sm font-medium mb-2">Nombre *</label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-border rounded-lg bg-bg-secondary"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-border rounded-lg bg-bg-secondary"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Teléfono *</label>
                <input
                  type="tel"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-border rounded-lg bg-bg-secondary"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Fecha *</label>
                <input
                  type="date"
                  name="fecha"
                  value={formData.fecha}
                  onChange={handleChange}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 border border-border rounded-lg bg-bg-secondary"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Hora *</label>
                <select
                  name="hora"
                  value={formData.hora}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-border rounded-lg bg-bg-secondary"
                  required
                >
                  <option value="">Seleccionar</option>
                  {horas.map(h => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Comensales *</label>
                <select
                  name="personas"
                  value={formData.personas}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-border rounded-lg bg-bg-secondary"
                >
                  {[1,2,3,4,5,6,7,8,9,10].map(n => (
                    <option key={n} value={n}>{n} {n === 1 ? 'persona' : 'personas'}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Notas adicionales</label>
              <textarea
                name="notas"
                value={formData.notas}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-3 border border-border rounded-lg bg-bg-secondary"
                placeholder="Alergias, preferencias, ocasión especial..."
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-accent text-white py-4 rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50"
            >
              {loading ? 'Enviando...' : 'Confirmar Reserva'}
            </button>
          </form>
        )}
      </div>
    </>
  )
}