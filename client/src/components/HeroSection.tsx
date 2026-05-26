import { Link } from 'react-router-dom'
import { ArrowRight, Leaf, Flame } from 'lucide-react'
import StatsSection from './StatsSection'

export default function HeroSection({ scrollProgress }: { scrollProgress: number }) {
  return (
    <>
      <div
        className="fixed top-0 left-0 w-full h-1 bg-accent/30 z-[100]"
        role="progressbar"
        aria-valuenow={Math.round(scrollProgress)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Progreso de la página"
      >
        <div
          className="h-full bg-accent transition-all duration-150"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      <section id="inicio" className="relative min-h-screen flex items-center pt-16 overflow-hidden" style={{ background: 'linear-gradient(135deg, var(--color-bg) 0%, var(--color-bg-secondary) 100%)' }}>
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 -left-20 w-96 h-96 rounded-full opacity-30 hidden md:block" style={{ background: 'radial-gradient(circle, var(--color-accent) 0%, transparent 70%)' }} />
          <div className="absolute bottom-20 -right-20 w-80 h-80 rounded-full opacity-20 hidden md:block" style={{ background: 'radial-gradient(circle, var(--color-success) 0%, transparent 70%)' }} />
        </div>

        <div className="max-w-7xl mx-auto px-4 py-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
          <div className="space-y-8">
            <span className="inline-flex items-center gap-2 text-sm font-medium uppercase tracking-wider text-carbon">
              <span className="w-2 h-2 rounded-full bg-accent"></span>
              Cocina Artesanal · Madrid
            </span>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold font-heading leading-tight text-carbon">
              Sabores que<br />
              <em className="font-normal text-carbon">cuentan historias</em>
            </h1>
            <p className="text-xl text-text-muted max-w-lg">
              Platos preparados con pasión, ingredientes de temporada y el toque inconfundible de Chef Petri.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/menu" className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold bg-accent text-carbon transition hover:opacity-90 hover:scale-105">
                <span>Descubre el Menú</span>
                <ArrowRight size={18} />
              </Link>
              <a href="#proceso" className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold border-2 border-carbon text-carbon transition hover:bg-carbon/10">
                Cómo Funciona
              </a>
            </div>
            <StatsSection />
          </div>

          <div className="relative">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&h=600&fit=crop"
                alt="Plato gourmet de cocina artesanal"
                className="w-full h-[300px] md:h-[500px] object-cover"
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
            </div>
            <div className="absolute -bottom-6 -left-6 bg-surface rounded-2xl p-4 shadow-xl flex items-center gap-3 hidden md:flex">
              <div className="w-12 h-12 rounded-full bg-verde-oliva flex items-center justify-center">
                <Leaf className="text-white" size={20} />
              </div>
              <div>
                <div className="font-bold text-carbon">100%</div>
                <div className="text-sm text-text-muted">Ingredientes Frescos</div>
              </div>
            </div>
            <div className="absolute -top-4 -right-4 bg-surface rounded-2xl p-4 shadow-xl flex items-center gap-3 hidden md:flex">
              <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center">
                <Flame className="text-white" size={20} />
              </div>
              <div>
                <div className="font-bold text-carbon">Fuego</div>
                <div className="text-sm text-text-muted">de leña</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
