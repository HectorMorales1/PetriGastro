export function getEstadoColor(estado: string): string {
  switch (estado) {
    case 'pendiente': return 'bg-yellow-100 text-yellow-800'
    case 'confirmado': return 'bg-blue-100 text-blue-800'
    case 'preparando': return 'bg-orange-100 text-orange-800'
    case 'preparado': return 'bg-purple-100 text-purple-800'
    case 'entregado': return 'bg-green-100 text-green-800'
    case 'cancelado': return 'bg-red-100 text-red-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}
