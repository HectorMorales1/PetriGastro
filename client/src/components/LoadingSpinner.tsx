export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]" role="status" aria-live="polite">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2" style={{ borderColor: '#C4785A' }}></div>
      <span className="sr-only">Cargando...</span>
    </div>
  )
}
