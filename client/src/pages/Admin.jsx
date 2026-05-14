import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Helmet } from 'react-helmet-async'
import { useAuth } from '../context/AuthContext'
import { platosApi, pedidosApi, categoriasApi, reservasApi } from '../services/api'

export default function Admin() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState('pedidos')

  if (!user || user.rol !== 'admin') {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold">Acceso denegado</h1>
        <p className="mt-2">No tienes permisos para acceder a esta página.</p>
      </div>
    )
  }

  const { data: pedidos = [] } = useQuery({
    queryKey: ['pedidos'],
    queryFn: pedidosApi.getAll
  })

  const { data: reservas = [] } = useQuery({
    queryKey: ['reservas'],
    queryFn: reservasApi.getAll
  })

  const { data: categorias = [] } = useQuery({
    queryKey: ['categorias'],
    queryFn: categoriasApi.getAll
  })

  const updatePedidoMutation = useMutation({
    mutationFn: ({ id, estado }) => pedidosApi.updateEstado(id, estado),
    onSuccess: () => queryClient.invalidateQueries(['pedidos'])
  })

  const tabs = [
    { id: 'pedidos', label: 'Pedidos' },
    { id: 'reservas', label: 'Reservas' },
    { id: 'platos', label: 'Platos' },
    { id: 'categorias', label: 'Categorías' }
  ]

  return (
    <>
      <Helmet>
        <title>Admin | PetriGastro</title>
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 font-heading">Panel de Administración</h1>

        <div className="flex gap-2 mb-6 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg whitespace-nowrap transition ${
                activeTab === tab.id ? 'bg-accent text-white' : 'bg-gray-200 dark:bg-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'pedidos' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left">ID</th>
                  <th className="px-4 py-3 text-left">Cliente</th>
                  <th className="px-4 py-3 text-left">Total</th>
                  <th className="px-4 py-3 text-left">Estado</th>
                  <th className="px-4 py-3 text-left">Fecha</th>
                  <th className="px-4 py-3 text-left">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {pedidos.map(pedido => (
                  <tr key={pedido.id} className="border-t dark:border-gray-700">
                    <td className="px-4 py-3">#{pedido.id}</td>
                    <td className="px-4 py-3">{pedido.usuario?.nombre || 'Cliente'}</td>
                    <td className="px-4 py-3">{pedido.total?.toFixed(2)}€</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs ${
                        pedido.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-800' :
                        pedido.estado === 'confirmado' ? 'bg-blue-100 text-blue-800' :
                        pedido.estado === 'entregado' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {pedido.estado}
                      </span>
                    </td>
                    <td className="px-4 py-3">{new Date(pedido.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <select
                        value={pedido.estado}
                        onChange={(e) => updatePedidoMutation.mutate({ id: pedido.id, estado: e.target.value })}
                        className="text-sm border rounded px-2 py-1"
                      >
                        <option value="pendiente">Pendiente</option>
                        <option value="confirmado">Confirmado</option>
                        <option value="preparando">Preparando</option>
                        <option value="entregado">Entregado</option>
                        <option value="cancelado">Cancelado</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'reservas' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left">Nombre</th>
                  <th className="px-4 py-3 text-left">Teléfono</th>
                  <th className="px-4 py-3 text-left">Fecha</th>
                  <th className="px-4 py-3 text-left">Hora</th>
                  <th className="px-4 py-3 text-left">Personas</th>
                  <th className="px-4 py-3 text-left">Estado</th>
                </tr>
              </thead>
              <tbody>
                {reservas.map(reserva => (
                  <tr key={reserva.id} className="border-t dark:border-gray-700">
                    <td className="px-4 py-3">{reserva.nombre}</td>
                    <td className="px-4 py-3">{reserva.telefono}</td>
                    <td className="px-4 py-3">{reserva.fecha}</td>
                    <td className="px-4 py-3">{reserva.hora}</td>
                    <td className="px-4 py-3">{reserva.personas}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs ${
                        reserva.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-800' :
                        reserva.estado === 'confirmado' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {reserva.estado}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'platos' && (
          <div className="text-center py-8 text-gray-500">
            <p>Gestión de platos - Ver estructura actual en data/menu.json</p>
          </div>
        )}

        {activeTab === 'categorias' && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categorias.map(cat => (
              <div key={cat.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow text-center">
                <span className="text-3xl">{cat.icono}</span>
                <p className="font-semibold mt-2">{cat.nombre}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}