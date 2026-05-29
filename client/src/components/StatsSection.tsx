export default function StatsSection() {
  const stats = [
    { number: '500+', label: 'Pedidos' },
    { number: '4.9', label: 'Valoración' },
    { number: '15+', label: 'Años exp.' }
  ]

  return (
    <div className="flex gap-6 sm:gap-8 pt-4">
      {stats.map((stat, i) => (
        <div key={i} className="text-center">
          <div className="text-xl sm:text-2xl font-bold text-carbon">{stat.number}</div>
          <div className="text-sm text-text-muted">{stat.label}</div>
        </div>
      ))}
    </div>
  )
}
