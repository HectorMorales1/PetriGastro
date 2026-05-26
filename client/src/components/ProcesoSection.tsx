import { Utensils, CalendarCheck, Flame, Smile } from 'lucide-react'

const steps = [
  { num: '01', icon: Utensils, title: 'Elige', desc: 'Navega por nuestro menú y selecciona los platos que más te apetecen.' },
  { num: '02', icon: CalendarCheck, title: 'Pide', desc: 'Confirma tu pedido y elige el horario de recogida.' },
  { num: '03', icon: Flame, title: 'Preparamos', desc: 'Cada plato se cocina al momento con ingredientes frescos.' },
  { num: '04', icon: Smile, title: 'Disfrutas', desc: 'Recoge tu pedido o recíbelo en casa. Saborea la diferencia.' }
]

export default function ProcesoSection() {
  return (
    <section id="proceso" className="py-20 px-4 bg-bg-secondary">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-2 rounded-full text-sm font-medium uppercase tracking-wider mb-4 bg-surface text-carbon">Experiencia</span>
          <h2 className="text-4xl font-bold font-heading text-carbon">Del fuego a tu mesa</h2>
          <p className="text-text-muted mt-4 max-w-2xl mx-auto">Un proceso artesanal pensado para que disfrutes sin complicaciones</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {steps.map((step, i) => (
            <div key={i} className="relative bg-surface rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-border">
              <div className="absolute -top-3 left-6 w-10 h-10 rounded-full bg-accent flex items-center justify-center text-carbon font-bold shadow-md">
                {step.num}
              </div>
              <div className="w-14 h-14 rounded-full bg-accent/15 flex items-center justify-center mt-4 mb-4">
                <step.icon className="text-accent" size={28} aria-hidden="true" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-carbon">{step.title}</h3>
              <p className="text-text-muted text-sm">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
