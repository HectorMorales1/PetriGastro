export function Paginacion({ currentPage, totalPages, onPageChange }: {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}) {
  if (totalPages <= 1) return null
  return (
    <div className="flex items-center justify-center gap-2 py-4">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className="px-3 py-1 rounded border border-border disabled:opacity-30 hover:bg-bg-secondary"
        aria-label="Página anterior"
      >
        Anterior
      </button>
      {Array.from({ length: totalPages }, (_, i) => i + 1)
        .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 2)
        .map((p, idx, arr) => (
          <span key={p} className="flex items-center gap-1">
            {idx > 0 && arr[idx - 1] !== p - 1 && <span className="text-text-muted">...</span>}
            <button
              onClick={() => onPageChange(p)}
              className={`w-8 h-8 rounded text-sm font-medium ${
                p === currentPage ? 'bg-accent text-carbon' : 'hover:bg-bg-secondary'
              }`}
              aria-label={`Ir a página ${p}`}
              aria-current={p === currentPage ? 'page' : undefined}
            >
              {p}
            </button>
          </span>
        ))}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="px-3 py-1 rounded border border-border disabled:opacity-30 hover:bg-bg-secondary"
        aria-label="Página siguiente"
      >
        Siguiente
      </button>
    </div>
  )
}
