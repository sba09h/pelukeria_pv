import { useState, useMemo } from 'react'
import {
  Search, Plus, User, Phone, Cake, Star,
  ChevronRight, X, Edit2, Clock, Scissors,
  Gift, AlertCircle, Check, Hash
} from 'lucide-react'
import { format, parseISO, differenceInYears } from 'date-fns'
import { es } from 'date-fns/locale'
import { MOCK_CLIENTS, MOCK_VISITS, LOYALTY_CONFIG } from '../../lib/mockData'
import Modal from '../../components/ui/Modal'
import { useAuth } from '../../context/AuthContext'

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatRUT(value) {
  const clean = value.replace(/[^0-9kK]/g, '').toUpperCase()
  if (clean.length <= 1) return clean
  const dv   = clean.slice(-1)
  const body = clean.slice(0, -1).replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  return `${body}-${dv}`
}

function validateRUT(rut) {
  const clean = rut.replace(/[^0-9kK]/g, '').toUpperCase()
  if (clean.length < 2) return false
  const dv   = clean.slice(-1)
  const body = clean.slice(0, -1)
  let sum = 0, mul = 2
  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body[i]) * mul
    mul = mul === 7 ? 2 : mul + 1
  }
  const expected = 11 - (sum % 11)
  const valid = expected === 11 ? '0' : expected === 10 ? 'K' : String(expected)
  return dv === valid
}

function loyaltyLevel(points) {
  const levels = [...LOYALTY_CONFIG.levels].reverse()
  return levels.find(l => points >= l.points) || null
}

function LoyaltyBar({ points }) {
  const levels  = LOYALTY_CONFIG.levels
  const max     = levels[levels.length - 1].points
  const pct     = Math.min((points / max) * 100, 100)
  const current = loyaltyLevel(points)
  const next    = levels.find(l => l.points > points)

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs">
        <span className="font-semibold text-dark-800">{points} pts</span>
        {next && <span className="text-dark-400">Faltan {next.points - points} pts para: {next.reward}</span>}
        {!next && <span className="text-amber-600 font-medium">Nivel máximo alcanzado</span>}
      </div>
      <div className="h-2 bg-dark-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-brand-400 to-brand-600 transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex gap-2">
        {levels.map(l => (
          <div key={l.points} className={`text-[10px] px-2 py-0.5 rounded-full border ${
            points >= l.points
              ? 'bg-brand-100 border-brand-300 text-brand-700 font-medium'
              : 'bg-dark-50 border-dark-200 text-dark-400'
          }`}>
            {l.points} pts
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Client Form ───────────────────────────────────────────────────────────────
function ClientForm({ initial = {}, onSave, onClose }) {
  const [form, setForm] = useState({
    name:       initial.name       || '',
    rut:        initial.rut        || '',
    phone:      initial.phone      || '',
    email:      initial.email      || '',
    birth_date: initial.birth_date || '',
    notes:      initial.notes      || '',
  })
  const [rutError, setRutError] = useState('')
  const f = k => v => setForm(p => ({ ...p, [k]: v }))

  function handleRUT(e) {
    const val = formatRUT(e.target.value)
    f('rut')(val)
    if (val.length > 5) setRutError(validateRUT(val) ? '' : 'RUT inválido')
    else setRutError('')
  }

  const valid = form.name && form.rut && form.phone && !rutError

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="block text-xs font-medium text-dark-500 mb-1.5 uppercase tracking-wider">Nombre completo *</label>
          <input className="input" placeholder="María González" value={form.name} onChange={e => f('name')(e.target.value)} />
        </div>
        <div>
          <label className="block text-xs font-medium text-dark-500 mb-1.5 uppercase tracking-wider">RUT *</label>
          <input className={`input ${rutError ? 'border-red-400' : ''}`} placeholder="12.345.678-9"
            value={form.rut} onChange={handleRUT} maxLength={12} />
          {rutError && <p className="text-xs text-red-500 mt-1">{rutError}</p>}
        </div>
        <div>
          <label className="block text-xs font-medium text-dark-500 mb-1.5 uppercase tracking-wider">Teléfono *</label>
          <input className="input" placeholder="9 XXXX XXXX" type="tel"
            value={form.phone} onChange={e => f('phone')(e.target.value.replace(/\D/g,'').slice(0,9))} />
        </div>
        <div>
          <label className="block text-xs font-medium text-dark-500 mb-1.5 uppercase tracking-wider">Email</label>
          <input className="input" placeholder="correo@email.com" type="email"
            value={form.email} onChange={e => f('email')(e.target.value)} />
        </div>
        <div>
          <label className="block text-xs font-medium text-dark-500 mb-1.5 uppercase tracking-wider">Fecha de nacimiento</label>
          <input className="input" type="date" value={form.birth_date} onChange={e => f('birth_date')(e.target.value)} />
        </div>
        <div className="col-span-2">
          <label className="block text-xs font-medium text-dark-500 mb-1.5 uppercase tracking-wider">Notas internas</label>
          <textarea className="input resize-none h-20" placeholder="Alergias, preferencias, observaciones…"
            value={form.notes} onChange={e => f('notes')(e.target.value)} />
        </div>
      </div>
      <div className="flex gap-2 pt-1">
        <button className="btn-secondary flex-1" onClick={onClose}>Cancelar</button>
        <button className="btn-primary flex-1" disabled={!valid} onClick={() => onSave(form)}>
          {initial.id ? 'Guardar cambios' : 'Crear cliente'}
        </button>
      </div>
    </div>
  )
}

// ── Client Detail Panel ───────────────────────────────────────────────────────
function ClientDetail({ client, visits, onEdit, onAdjustPoints, onClose, isAdmin }) {
  const [tab, setTab] = useState('historial')
  const clientVisits = visits.filter(v => v.client_id === client.id)
    .sort((a, b) => new Date(b.date) - new Date(a.date))
  const totalSpent = clientVisits.reduce((s, v) => s + v.price, 0)
  const age = client.birth_date
    ? differenceInYears(new Date(), parseISO(client.birth_date))
    : null

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-start gap-4 p-6 border-b border-dark-100">
        <div className="w-14 h-14 rounded-2xl bg-dark-900 flex items-center justify-center text-white text-xl font-serif flex-shrink-0">
          {client.name.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="font-serif text-xl text-dark-900">{client.name}</h2>
            {loyaltyLevel(client.loyalty_points) && (
              <span className="text-[10px] px-2 py-0.5 bg-amber-100 text-amber-700 border border-amber-200 rounded-full font-medium">
                ★ {loyaltyLevel(client.loyalty_points).reward}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-1 text-sm text-dark-500">
            <span className="flex items-center gap-1"><Hash size={12} />{client.rut}</span>
            <span className="flex items-center gap-1"><Phone size={12} />+56 {client.phone}</span>
            {age && <span className="flex items-center gap-1"><Cake size={12} />{age} años</span>}
          </div>
        </div>
        <div className="flex gap-2">
          {isAdmin && (
            <button onClick={onEdit} className="p-2 rounded-lg border border-dark-200 hover:bg-dark-50 transition-colors">
              <Edit2 size={14} className="text-dark-500" />
            </button>
          )}
          <button onClick={onClose} className="p-2 rounded-lg border border-dark-200 hover:bg-dark-50 transition-colors">
            <X size={14} className="text-dark-500" />
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 divide-x divide-dark-100 border-b border-dark-100">
        {[
          { label: 'Visitas', value: clientVisits.length },
          { label: 'Total gastado', value: `$${(totalSpent/1000).toFixed(0)}k` },
          { label: 'Puntos loyalty', value: client.loyalty_points },
        ].map(({ label, value }) => (
          <div key={label} className="text-center py-4">
            <p className="text-lg font-semibold text-dark-900">{value}</p>
            <p className="text-[10px] text-dark-400 uppercase tracking-wide mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-dark-100 px-6">
        {['historial', 'loyalty', 'info'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-3 text-xs font-medium capitalize transition-colors border-b-2 ${
              tab === t ? 'border-dark-900 text-dark-900' : 'border-transparent text-dark-400 hover:text-dark-700'
            }`}>
            {t === 'historial' ? 'Historial' : t === 'loyalty' ? 'Loyalty' : 'Info'}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto p-6">
        {tab === 'historial' && (
          <div className="space-y-3">
            {clientVisits.length === 0 ? (
              <p className="text-sm text-dark-400 text-center py-8">Sin visitas registradas aún.</p>
            ) : clientVisits.map(v => (
              <div key={v.id} className="flex items-start gap-3 p-4 bg-dark-50 rounded-xl">
                <div className="w-8 h-8 rounded-lg bg-white border border-dark-200 flex items-center justify-center flex-shrink-0">
                  <Scissors size={14} className="text-dark-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-dark-900">{v.service}</p>
                  <p className="text-xs text-dark-500 mt-0.5">{v.peluquero}</p>
                  {v.redeemed && (
                    <span className="text-[10px] text-amber-600 font-medium flex items-center gap-1 mt-1">
                      <Gift size={10} /> Canje aplicado: {v.redeemed_points} pts
                    </span>
                  )}
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-semibold text-dark-900">${v.price.toLocaleString('es-CL')}</p>
                  <p className="text-[10px] text-dark-400 mt-0.5">
                    {format(parseISO(v.date), "d MMM yyyy", { locale: es })}
                  </p>
                  <p className="text-[10px] text-brand-600 font-medium mt-0.5">+{v.points_earned} pts</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'loyalty' && (
          <div className="space-y-5">
            <LoyaltyBar points={client.loyalty_points} />

            <div className="space-y-2">
              <p className="text-xs font-medium text-dark-500 uppercase tracking-wider">Niveles de canje</p>
              {LOYALTY_CONFIG.levels.map(l => (
                <div key={l.points}
                  className={`flex items-center justify-between p-3 rounded-xl border ${
                    client.loyalty_points >= l.points
                      ? 'bg-brand-50 border-brand-200'
                      : 'bg-dark-50 border-dark-100'
                  }`}>
                  <div className="flex items-center gap-2">
                    {client.loyalty_points >= l.points
                      ? <Check size={14} className="text-brand-600" />
                      : <Star size={14} className="text-dark-300" />
                    }
                    <span className="text-sm text-dark-800">{l.reward}</span>
                  </div>
                  <span className={`text-xs font-semibold ${client.loyalty_points >= l.points ? 'text-brand-700' : 'text-dark-400'}`}>
                    {l.points} pts
                  </span>
                </div>
              ))}
            </div>

            {isAdmin && (
              <div className="pt-2 border-t border-dark-100">
                <p className="text-xs font-medium text-dark-500 uppercase tracking-wider mb-3">Ajuste manual (admin)</p>
                <div className="flex gap-2">
                  <button onClick={() => onAdjustPoints(client.id, 50, 'Manual admin +50 pts')}
                    className="btn-secondary text-xs flex-1">+ 50 pts</button>
                  <button onClick={() => onAdjustPoints(client.id, -50, 'Canje manual -50 pts')}
                    className="btn-secondary text-xs flex-1 text-red-600 border-red-200 hover:bg-red-50">- 50 pts</button>
                </div>
                {client.loyalty_points >= LOYALTY_CONFIG.levels[0].points && (
                  <button onClick={() => onAdjustPoints(client.id, -LOYALTY_CONFIG.levels[0].points, `Canje: ${LOYALTY_CONFIG.levels[0].reward}`)}
                    className="btn-brand text-xs w-full mt-2">
                    Registrar canje — {LOYALTY_CONFIG.levels[0].reward}
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {tab === 'info' && (
          <div className="space-y-3">
            {[
              { label: 'RUT',             value: client.rut  },
              { label: 'Teléfono',        value: `+56 ${client.phone}` },
              { label: 'Email',           value: client.email || '—'  },
              { label: 'Fecha nacimiento',value: client.birth_date ? format(parseISO(client.birth_date), "d 'de' MMMM yyyy", { locale: es }) : '—' },
              { label: 'Edad',            value: age ? `${age} años` : '—' },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between items-center py-2.5 border-b border-dark-100 last:border-0">
                <span className="text-xs text-dark-500 uppercase tracking-wide">{label}</span>
                <span className="text-sm font-medium text-dark-800">{value}</span>
              </div>
            ))}
            {client.notes && (
              <div className="mt-3 p-3 bg-amber-50 border border-amber-100 rounded-xl">
                <p className="text-xs text-amber-700 font-medium mb-1 flex items-center gap-1">
                  <AlertCircle size={12} /> Nota interna
                </p>
                <p className="text-sm text-amber-800">{client.notes}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function Clientes() {
  const { isAdmin } = useAuth()

  const [clients, setClients] = useState(MOCK_CLIENTS)
  const [visits]              = useState(MOCK_VISITS)
  const [search, setSearch]   = useState('')
  const [selected, setSelected] = useState(null)
  const [modal, setModal]     = useState(null) // 'new' | 'edit'

  const filtered = useMemo(() => {
    const q = search.toLowerCase().replace(/[.\-]/g, '')
    if (!q) return clients
    return clients.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.rut.replace(/[.\-]/g, '').toLowerCase().includes(q) ||
      c.phone.includes(q)
    )
  }, [clients, search])

  function handleSave(form) {
    if (modal === 'edit' && selected) {
      setClients(prev => prev.map(c => c.id === selected.id ? { ...c, ...form } : c))
      setSelected(prev => ({ ...prev, ...form }))
    } else {
      const newClient = { id: 'c' + Date.now(), loyalty_points: 0, ...form }
      setClients(prev => [...prev, newClient])
    }
    setModal(null)
  }

  function handleAdjustPoints(clientId, delta, reason) {
    setClients(prev => prev.map(c =>
      c.id === clientId ? { ...c, loyalty_points: Math.max(0, c.loyalty_points + delta) } : c
    ))
    setSelected(prev => prev ? { ...prev, loyalty_points: Math.max(0, prev.loyalty_points + delta) } : prev)
  }

  const clientVisitCount = (id) => visits.filter(v => v.client_id === id).length

  return (
    <div className="flex h-screen overflow-hidden bg-dark-50">
      {/* ── Left: list ── */}
      <div className={`flex flex-col bg-white border-r border-dark-100 transition-all ${selected ? 'w-96' : 'flex-1'}`}>
        {/* Header */}
        <div className="px-6 py-5 border-b border-dark-100">
          <div className="flex items-center justify-between mb-4">
            <h1 className="font-serif text-xl text-dark-900">Clientes</h1>
            {isAdmin && (
              <button onClick={() => setModal('new')} className="btn-primary text-xs flex items-center gap-1.5">
                <Plus size={13} /> Nuevo cliente
              </button>
            )}
          </div>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" />
            <input
              className="input pl-9"
              placeholder="Buscar por nombre o RUT…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X size={13} className="text-dark-400 hover:text-dark-700" />
              </button>
            )}
          </div>
          <p className="text-xs text-dark-400 mt-2">{filtered.length} cliente{filtered.length !== 1 ? 's' : ''}</p>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-dark-400 text-sm">
              <User size={32} className="mx-auto mb-3 opacity-30" />
              No se encontraron clientes
            </div>
          ) : filtered.map(client => {
            const vcnt   = clientVisitCount(client.id)
            const isSelected = selected?.id === client.id
            const lvl    = loyaltyLevel(client.loyalty_points)
            return (
              <button
                key={client.id}
                onClick={() => setSelected(client)}
                className={`w-full text-left flex items-center gap-3 px-6 py-4 border-b border-dark-50 transition-colors ${
                  isSelected ? 'bg-dark-900 text-white' : 'hover:bg-dark-50'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-serif font-medium flex-shrink-0 ${
                  isSelected ? 'bg-white/10 text-white' : 'bg-dark-100 text-dark-700'
                }`}>
                  {client.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${isSelected ? 'text-white' : 'text-dark-900'}`}>
                    {client.name}
                  </p>
                  <p className={`text-xs truncate mt-0.5 ${isSelected ? 'text-white/60' : 'text-dark-500'}`}>
                    {client.rut} · {vcnt} visita{vcnt !== 1 ? 's' : ''}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className={`flex items-center gap-1 text-xs font-medium ${
                    isSelected ? 'text-brand-300' : 'text-brand-600'
                  }`}>
                    <Star size={11} fill="currentColor" />
                    {client.loyalty_points}
                  </div>
                  {lvl && (
                    <p className={`text-[10px] mt-0.5 ${isSelected ? 'text-white/50' : 'text-dark-400'}`}>
                      {lvl.reward.split(' ').slice(0,2).join(' ')}
                    </p>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Right: detail ── */}
      {selected && (
        <div className="flex-1 flex flex-col bg-white overflow-hidden">
          <ClientDetail
            client={selected}
            visits={visits}
            onEdit={() => setModal('edit')}
            onAdjustPoints={handleAdjustPoints}
            onClose={() => setSelected(null)}
            isAdmin={isAdmin}
          />
        </div>
      )}

      {/* ── Modals ── */}
      <Modal
        open={modal === 'new'}
        onClose={() => setModal(null)}
        title="Nuevo cliente"
        size="md"
      >
        <ClientForm onSave={handleSave} onClose={() => setModal(null)} />
      </Modal>

      <Modal
        open={modal === 'edit'}
        onClose={() => setModal(null)}
        title="Editar cliente"
        size="md"
      >
        <ClientForm initial={selected || {}} onSave={handleSave} onClose={() => setModal(null)} />
      </Modal>
    </div>
  )
}
