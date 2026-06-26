import { useState, useMemo } from 'react'
import { Clock, ArrowRight, ArrowLeft, Star } from 'lucide-react'
import { MOCK_SERVICES } from '../../lib/mockData'
import Logo from '../../components/ui/Logo'

const CATEGORIES = ['Todos', 'Corte', 'Color', 'Tratamientos', 'Otros']

const CAT_DESC = {
  Corte:        'Cortes personalizados para todo tipo de cabello y estilo.',
  Color:        'Técnicas de coloración modernas: balayage, mechas y tintados.',
  Tratamientos: 'Alisados, hidrataciones y tratamientos de nutrición profunda.',
  Otros:        'Manicure, peinados de evento y servicios adicionales.',
}

const CAT_BG = {
  Corte:        'from-stone-900  to-stone-700',
  Color:        'from-pink-950   to-rose-800',
  Tratamientos: 'from-amber-950  to-amber-700',
  Otros:        'from-indigo-950 to-indigo-700',
}

function formatDuration(min) {
  if (min < 60) return `${min} min`
  const h = Math.floor(min / 60)
  const m = min % 60
  return m ? `${h}h ${m}min` : `${h} hora${h > 1 ? 's' : ''}`
}

export default function ServiciosPublico() {
  const [cat, setCat] = useState('Todos')

  const filtered = useMemo(() =>
    MOCK_SERVICES.filter(s => cat === 'Todos' || s.category === cat),
    [cat]
  )

  const byCategory = useMemo(() =>
    CATEGORIES.slice(1).reduce((acc, c) => {
      acc[c] = MOCK_SERVICES.filter(s => s.category === c)
      return acc
    }, {}),
    []
  )

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <header className="sticky top-0 z-20 bg-white/95 backdrop-blur border-b border-dark-100">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Logo size="sm" href="/" />
          <nav className="hidden md:flex items-center gap-6 text-sm text-dark-500">
            <a href="/galeria"  className="hover:text-dark-900 transition-colors">Galería</a>
            <a href="/mis-puntos" className="hover:text-dark-900 transition-colors">Mis puntos</a>
            <a href="/agendar" className="btn-primary text-xs px-4 py-2">Reservar hora</a>
          </nav>
          <a href="/" className="md:hidden text-sm text-dark-400 flex items-center gap-1">
            <ArrowLeft size={14}/> Volver
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-dark-900 text-white py-20 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'radial-gradient(circle, #C8B89A 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        <div className="relative max-w-2xl mx-auto">
          <p className="text-brand-400 text-xs tracking-[0.3em] uppercase mb-4">Nuestros servicios</p>
          <h1 className="font-serif text-5xl font-light mb-4">Lo que hacemos</h1>
          <p className="text-dark-400 text-sm leading-relaxed max-w-md mx-auto">
            Cortes, color, tratamientos y más — aplicados con técnica y pasión en el corazón de Puerto Varas.
          </p>
          <a href="/agendar"
            className="inline-flex items-center gap-2 mt-8 px-6 py-3 bg-brand-400 text-white rounded-xl text-sm font-medium hover:bg-brand-500 transition-colors">
            Reservar hora <ArrowRight size={15}/>
          </a>
        </div>
      </section>

      {/* Category tabs */}
      <div className="sticky top-16 z-10 bg-white border-b border-dark-100">
        <div className="max-w-5xl mx-auto px-6 flex gap-1 overflow-x-auto py-3 no-scrollbar">
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setCat(c)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all flex-shrink-0 ${
                cat === c
                  ? 'bg-dark-900 text-white'
                  : 'text-dark-500 hover:bg-dark-50'
              }`}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Services */}
      <div className="max-w-5xl mx-auto px-6 py-12">
        {cat === 'Todos' ? (
          /* All: grouped by category */
          <div className="space-y-14">
            {CATEGORIES.slice(1).map(category => (
              <section key={category}>
                <div className="flex items-end justify-between mb-6">
                  <div>
                    <h2 className="font-serif text-2xl text-dark-900">{category}</h2>
                    <p className="text-sm text-dark-400 mt-1">{CAT_DESC[category]}</p>
                  </div>
                  <button onClick={() => setCat(category)} className="text-xs text-brand-500 hover:underline flex items-center gap-1">
                    Ver solo {category} <ArrowRight size={12}/>
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {byCategory[category].map(s => (
                    <ServicePublicCard key={s.id} service={s} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          /* Filtered */
          <div>
            <div className="mb-8">
              <h2 className="font-serif text-2xl text-dark-900">{cat}</h2>
              <p className="text-sm text-dark-400 mt-1">{CAT_DESC[cat]}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map(s => <ServicePublicCard key={s.id} service={s} />)}
            </div>
          </div>
        )}
      </div>

      {/* CTA Banner */}
      <section className="bg-dark-50 border-t border-dark-100 py-16 px-6 text-center">
        <h2 className="font-serif text-3xl text-dark-900 mb-3">¿Lista para tu cambio?</h2>
        <p className="text-dark-500 text-sm mb-6">Reserva tu hora en línea — fácil, rápido y sin llamadas.</p>
        <a href="/agendar"
          className="inline-flex items-center gap-2 px-8 py-3.5 bg-dark-900 text-white rounded-xl text-sm font-medium hover:bg-dark-700 transition-colors">
          Agendar ahora <ArrowRight size={15}/>
        </a>
      </section>

      {/* Footer */}
      <footer className="border-t border-dark-100 py-8 px-6 text-center text-xs text-dark-400">
        <Logo size="sm" />
        <div className="mt-4 flex items-center justify-center gap-4 text-dark-400">
          <span>Mar–Vie 9:30–19:00</span>
          <span>·</span>
          <span>Sáb 10:00–18:00</span>
          <span>·</span>
          <a href="https://wa.me/56929993799" className="hover:text-dark-700 transition-colors">+56 9 2999 3799</a>
        </div>
        <p className="mt-3">© {new Date().getFullYear()} La Pelukeria · Puerto Varas, Chile</p>
      </footer>
    </div>
  )
}

function ServicePublicCard({ service }) {
  const dur = formatDuration(service.duration)
  const loyaltyPts = Math.floor(service.price * 0.001)

  return (
    <div className="group border border-dark-100 rounded-2xl p-5 hover:border-brand-300 hover:shadow-card-hover transition-all bg-white">
      <h3 className="font-medium text-dark-900 mb-1">{service.name}</h3>
      {service.description && (
        <p className="text-xs text-dark-500 mb-4 leading-relaxed line-clamp-3">{service.description}</p>
      )}
      <div className="flex items-center justify-between pt-4 border-t border-dark-50">
        <div className="flex items-center gap-1.5 text-xs text-dark-400">
          <Clock size={12}/> {dur}
        </div>
        <div className="text-right">
          <p className="font-semibold text-dark-900">${service.price.toLocaleString('es-CL')}</p>
          <p className="text-[10px] text-brand-500 flex items-center gap-0.5 justify-end mt-0.5">
            <Star size={9} fill="currentColor"/> +{loyaltyPts} pts
          </p>
        </div>
      </div>
      <a href="/agendar"
        className="mt-3 w-full flex items-center justify-center gap-1 py-2 rounded-xl text-xs font-medium border border-dark-200 text-dark-600 hover:bg-dark-900 hover:text-white hover:border-dark-900 transition-all group-hover:border-brand-400 group-hover:text-brand-600">
        Reservar <ArrowRight size={11}/>
      </a>
    </div>
  )
}
