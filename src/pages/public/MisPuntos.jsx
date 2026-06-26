import { useState } from 'react'
import { Search, Star, Gift, Check, ChevronRight, ArrowLeft, Clock, Scissors } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { MOCK_CLIENTS, MOCK_VISITS, LOYALTY_CONFIG } from '../../lib/mockData'
import Logo from '../../components/ui/Logo'

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatRUT(value) {
  const clean = value.replace(/[^0-9kK]/g, '').toUpperCase()
  if (clean.length <= 1) return clean
  const dv   = clean.slice(-1)
  const body = clean.slice(0, -1).replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  return `${body}-${dv}`
}

function loyaltyLevel(points) {
  const rev = [...LOYALTY_CONFIG.levels].reverse()
  return rev.find(l => points >= l.points) || null
}

// ── Loyalty Card visual ───────────────────────────────────────────────────────
function LoyaltyCardVisual({ client }) {
  const lvl = loyaltyLevel(client.loyalty_points)
  const max = LOYALTY_CONFIG.levels[LOYALTY_CONFIG.levels.length - 1].points
  const pct = Math.min((client.loyalty_points / max) * 100, 100)
  const next = LOYALTY_CONFIG.levels.find(l => l.points > client.loyalty_points)

  return (
    <div className="relative overflow-hidden rounded-3xl bg-dark-900 text-white p-6 shadow-2xl">
      {/* Background decoration */}
      <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full border border-white/5" />
      <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full border border-white/5" />
      <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-transparent via-brand-500/5 to-brand-500/10" />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="text-white/50 text-[10px] tracking-widest uppercase mb-1">La Pelukeria · Puerto Varas</p>
            <h2 className="font-serif text-2xl font-light">{client.name}</h2>
          </div>
          <div className="text-right">
            <Star size={20} className="text-brand-400 ml-auto mb-1" fill="currentColor"/>
            {lvl && (
              <p className="text-xs text-brand-400 font-medium">{lvl.reward}</p>
            )}
          </div>
        </div>

        {/* Points */}
        <div className="mb-5">
          <p className="text-5xl font-light tracking-tight">
            {client.loyalty_points}
            <span className="text-xl text-white/40 ml-2">pts</span>
          </p>
        </div>

        {/* Progress bar */}
        <div className="mb-3">
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-brand-400 rounded-full transition-all duration-700"
              style={{ width: `${pct}%` }} />
          </div>
        </div>

        {/* Status */}
        <div className="flex justify-between items-center">
          <p className="text-xs text-white/40">
            {next
              ? `Faltan ${next.points - client.loyalty_points} pts para: ${next.reward}`
              : '¡Nivel máximo alcanzado!'
            }
          </p>
          <p className="text-[10px] text-white/30 font-mono">{client.rut}</p>
        </div>
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function MisPuntos() {
  const [rut,    setRut]    = useState('')
  const [result, setResult] = useState(null)  // null | 'not_found' | client
  const [loading, setLoading] = useState(false)

  function handleSearch(e) {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      const clean = rut.replace(/[.\-]/g, '').toUpperCase()
      const found = MOCK_CLIENTS.find(c =>
        c.rut.replace(/[.\-]/g, '').toUpperCase() === clean
      )
      setResult(found || 'not_found')
      setLoading(false)
    }, 600)
  }

  const visits = result && result !== 'not_found'
    ? MOCK_VISITS.filter(v => v.client_id === result.id).sort((a,b) => new Date(b.date)-new Date(a.date))
    : []

  return (
    <div className="min-h-screen bg-gradient-to-b from-dark-900 via-dark-800 to-dark-900">
      {/* Header */}
      <header className="border-b border-white/5">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
          <Logo variant="light" size="sm" />
          <a href="/" className="text-xs text-white/40 hover:text-white/70 flex items-center gap-1 transition-colors">
            <ArrowLeft size={13} /> Volver
          </a>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-10 space-y-8">
        {/* Title */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/5 border border-white/10 mb-4">
            <Star size={24} className="text-brand-400" fill="currentColor" />
          </div>
          <h1 className="font-serif text-3xl text-white font-light">Mis Puntos</h1>
          <p className="text-white/40 text-sm mt-2">Ingresa tu RUT para ver tu saldo y beneficios</p>
        </div>

        {/* Search form */}
        {(!result || result === 'not_found') && (
          <form onSubmit={handleSearch} className="space-y-3">
            <div className="relative">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3.5 text-white placeholder-white/30 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent transition-all"
                placeholder="12.345.678-9"
                value={rut}
                onChange={e => setRut(formatRUT(e.target.value))}
                maxLength={12}
              />
            </div>
            <button
              type="submit"
              disabled={rut.length < 5 || loading}
              className="w-full py-3.5 bg-brand-400 text-white rounded-xl text-sm font-medium hover:bg-brand-500 transition-colors disabled:opacity-50"
            >
              {loading ? 'Buscando…' : 'Ver mis puntos'}
            </button>
          </form>
        )}

        {/* Not found */}
        {result === 'not_found' && (
          <div className="text-center space-y-4">
            <div className="p-6 bg-white/5 border border-white/10 rounded-2xl">
              <p className="text-white/60 text-sm">No encontramos una cuenta asociada al RUT</p>
              <p className="text-white font-mono mt-1">{rut}</p>
              <p className="text-white/40 text-xs mt-3">
                ¿Primera visita? Consulta en recepción para activar tu Loyalty Card.
              </p>
            </div>
            <button
              onClick={() => { setResult(null); setRut('') }}
              className="text-brand-400 text-sm hover:underline"
            >
              Intentar con otro RUT
            </button>
          </div>
        )}

        {/* Result */}
        {result && result !== 'not_found' && (
          <div className="space-y-6">
            <LoyaltyCardVisual client={result} />

            {/* Niveles de canje */}
            <div className="space-y-3">
              <p className="text-xs text-white/40 uppercase tracking-widest font-medium">Beneficios disponibles</p>
              {LOYALTY_CONFIG.levels.map(l => {
                const unlocked = result.loyalty_points >= l.points
                return (
                  <div key={l.points}
                    className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                      unlocked
                        ? 'bg-brand-500/10 border-brand-500/30'
                        : 'bg-white/3 border-white/8 opacity-60'
                    }`}>
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      unlocked ? 'bg-brand-400' : 'bg-white/10'
                    }`}>
                      {unlocked
                        ? <Check size={16} className="text-white" />
                        : <Star size={16} className="text-white/40" />
                      }
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${unlocked ? 'text-white' : 'text-white/50'}`}>
                        {l.reward}
                      </p>
                      <p className={`text-xs mt-0.5 ${unlocked ? 'text-brand-400' : 'text-white/30'}`}>
                        {unlocked ? '¡Disponible para canjear!' : `${l.points - result.loyalty_points} puntos más`}
                      </p>
                    </div>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${
                      unlocked ? 'bg-brand-400/20 text-brand-400' : 'bg-white/5 text-white/30'
                    }`}>
                      {l.points} pts
                    </span>
                  </div>
                )
              })}
              {result.loyalty_points >= LOYALTY_CONFIG.levels[0].points && (
                <p className="text-xs text-white/30 text-center">
                  Muestra esta pantalla en recepción para canjear tu beneficio
                </p>
              )}
            </div>

            {/* Visit history */}
            {visits.length > 0 && (
              <div className="space-y-3">
                <p className="text-xs text-white/40 uppercase tracking-widest font-medium">Últimas visitas</p>
                {visits.slice(0, 5).map(v => (
                  <div key={v.id} className="flex items-center gap-3 p-3 bg-white/5 border border-white/8 rounded-xl">
                    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                      <Scissors size={13} className="text-white/50" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white font-medium truncate">{v.service}</p>
                      <p className="text-xs text-white/40 mt-0.5">
                        {format(parseISO(v.date), "d 'de' MMMM yyyy", { locale: es })}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs font-semibold text-brand-400">+{v.points_earned} pts</p>
                      <p className="text-[10px] text-white/30 mt-0.5">${v.price.toLocaleString('es-CL')}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* CTA */}
            <div className="text-center space-y-3 pt-2">
              <a href="/agendar"
                className="flex items-center justify-center gap-2 w-full py-3.5 bg-white text-dark-900 rounded-xl text-sm font-medium hover:bg-dark-50 transition-colors">
                Reservar hora <ChevronRight size={15}/>
              </a>
              <button
                onClick={() => { setResult(null); setRut('') }}
                className="text-white/30 text-xs hover:text-white/50 transition-colors"
              >
                Consultar otro RUT
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <p className="text-center text-white/20 text-xs pt-4">
          © {new Date().getFullYear()} La Pelukeria · Puerto Varas, Chile
        </p>
      </div>
    </div>
  )
}
