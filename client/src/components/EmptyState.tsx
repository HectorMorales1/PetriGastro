import { Inbox } from 'lucide-react'
import type { ReactNode } from 'react'

interface EmptyStateProps {
  icon?: ReactNode
  title?: string
  message?: string
  action?: ReactNode
}

export default function EmptyState({
  icon = <Inbox size={48} className="opacity-50" />,
  title = 'Sin contenido',
  message = 'No hay elementos disponibles en este momento.',
  action
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center" role="status">
      <div className="text-text-muted mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-text mb-2">{title}</h3>
      <p className="text-text-muted max-w-md mb-6">{message}</p>
      {action}
    </div>
  )
}
