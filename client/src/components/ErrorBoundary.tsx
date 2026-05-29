import { Component, type ReactNode, type ErrorInfo } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('ErrorBoundary caught:', error, errorInfo)
  }

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback
      return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] px-4 text-center" role="alert">
          <h2 className="text-2xl font-bold mb-2">Algo sali&oacute; mal</h2>
          <p className="text-text-muted mb-4">Hubo un error al cargar esta secci&oacute;n.</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-accent text-carbon rounded-lg hover:opacity-90 transition"
          >
            Recargar p&aacute;gina
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
