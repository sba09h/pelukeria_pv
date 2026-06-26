import { useState, useMemo } from 'react'
import {
  Gift, Star, TrendingUp, Users, Settings,
  Plus, Minus, Check, Edit2, Save, X,
  ChevronRight, Search, ArrowUpRight, ArrowDownRight
} from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { MOCK_CLIENTS, MOCK_VISITS, LOYALTY_CONFIG } from '../../lib/mockData'
import { useAuth } from '../../context/AuthContext'

// ── Helpers ───────────────────────────────────────────────────────────────────
function loyaltyLevel(points, levels) {
  const rev = [...levels].reverse()
  return rev.find(l => points >= l.points) || null
}

function StatCard({ icon, label, value, sub, color = 'dark' }) {
  const colors = {
    dark:   'bg-dark-900 text-white',
    brand:  'bg-brand-400 text-white',
    amber:  'bg-amber-50 text-amber-900 border border-amber-200',
    green:  'bg-green-50 text-green-900 border border-green-200',
  }
  return (
    <div className={`rounded-2xl p-5 ${colors[color]}`}>
      <div className="flex items-start justify-between mb-3">
        <span className="opacity-70">{icon}</span>
      </div>
      <p className="text-2xl font-semibold">{value}</p>
      <p className="text-xs opacity-70 mt-1">{label}</p>
      {sub && <p className="text-[11px] opacity-50 mt-0.5">{sub}</p>}
    </div>
  )
}

// ── Adjust Points Modal ───────────────────────────────────────────────────────
function AdjustModal({ client, onSave, onClose }) {
  const [mode,   setMode]   = useState('add')   // 'add' | 'redeem'
  const [amount, setAmount] = useState(50)
  const [reason, setReason] = useState('')

  const delta = mode === 'add' ? amount : -amount
  const newBalance = Math.max(0, client.loyalty_points + delta)

  return (
    <div className="space-y-5">
      <div className="flex gap-2">
        {[['add','Agregar puntos'],['redeem','Registrar canje']].map(([m, label]) => (
          <button key={m} onClick={() => setMode(m)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              mode === m ? 'bg-dark-900 text-white' : 'bg-dark-50 text-dark-600 hover:bg-dark-100'
            }`}>
            {label}
          </button>
        ))}
      </div>

      <div className="p-4 bg-dark-50 rounded-xl flex items-center justify-between">
        <div>
          <p className="text-xs text-dark-500">Cliente</p>
          <p className="font-medium text-dark-900">{client.name}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-dark-500">Saldo actual</p>
          <p className="font-semibold text-dark-900 flex items-center gap-1">
            <Star size={13} className="text-brand-500" fill="currentColor" />
            {client.loyalty_points} pts
          </p>
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-dark-500 mb-2 uppercase tracking-wider">
          {mode === 'add' ? 'Puntos a agregar' : 'Puntos a canjear'}
        </label>
        <div className="flex items-center gap-3">
          <button onClick={() => setAmount(a => Math.max(1, a - 10))}
            className="w-9 h-9 rounded-lg border border-dark-200 flex items-center justify-center hover:bg-dark-50">
            <Minus size={14} />
          </button>
          <input type="number" min="1" max={mode === 'redeem' ? client.loyalty_points : 9999}
            className="input text-center w-24 font-semibold text-lg"
            value={amount} onChange={e => setAmount(Math.max(1, Number(e.target.value)))} />
          <button onClick={() => setAmount(a => a + 10)}
            className="w-9 h-9 rounded-lg border border-dark-200 flex items-center justify-center hover:bg-dark-50">
            <Plus size={14} />
          </button>
        </div>
        {/* Quick presets */}
        <div className="flex gap-2 mt-2">
          {(mode === 'add' ? [25,50,100,200] : [50,100,200]).map(n => (
            <button key={n} onClick={() => setAmount(n)}
              className={`text-xs px-2.5 py-1 rounded-lg border transition-colors ${
                amount === n ? 'bg-dark-900 text-white border-dark-900' : 'border-dark-200 hover:bg-dark-50'
              }`}>
              {n}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-dark-500 mb-1.5 uppercase tracking-wider">Motivo</label>
        <input className="input" placeholder={mode === 'add' ? 'Ej: Bono bienvenida' : 'Ej: Canje 10% descuento'}
          value={reason} onChange={e => setReason(e.target.value)} />
      </div>

      {/* Preview */}
      <div className={`flex items-center justify-between p-3 rounded-xl ${
        mode === 'add' ? 'bg-green-50 border border-green-200' : 'bg-amber-50 border border-amber-200'
      }`}>
        <span className="text-sm text-dark-700">Nuevo saldo:</span>
        <div className="flex items-center gap-2">
          {mode === 'add'
            ? <ArrowUpRight size={16} className="text-green-600" />
            : <ArrowDownRight size={16} className="text-amber-600" />}
          <span className="font-semibold text-dark-900">{newBalance} pts</span>
        </div>
      </div>

      {mode === 'redeem' && amount > client.loyalty_points && (
        <p className="text-xs text-red-500 flex items-center gap-1">
          <X size={11} /> Puntos insuficientes (tiene {client.loyalty_points} pts)
        </p>
      )}

      <div className="flex gap-2 pt-1">
        <button className="btn-secondary flex-1" onClick={onClose}>Cancelar</button>
        <button
          className="btn-primary flex-1"
          disabled={mode === 'redeem' && amount > client.loyalty_points}
          onClick={() => onSave(client.id, delta, reason || (mode === 'add' ? 'Ajuste manual' : 'Canje manual'))}
        >
          Confirmar
        </button>
      </div>
    </div>
  )
}

// ── Config Editor ─────────────────────────────────────────────────────────────
function ConfigPanel({ config, onSave }) {
  const [cfg, setCfg]         = useState(config)
  const [editing, setEditing] = useState(false)

  function updateLevel(i, key, val) {
    const next = cfg.levels.map((l, idx) => idx === i ? { ...l, [key]: val } : l)
    setCfg(p => ({ ...p, levels: next }))
  }

  function addLevel() {
    setCfg(p => ({
      ...p,
      levels: [...p.levels, { points: 300, reward: 'Nuevo beneficio', type: 'discount', value: 5 }]
    }))
  }

  function removeLevel(i) {
    setCfg(p => ({ ...p, levels: p.levels.filter((_, idx) => idx !== i) }))
  }

  return (
    <div className="card p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-dark-900 flex items-center gap-2">
          <Settings size={15} className="text-dark-500" /> Configuración de puntos
        </h3>
        {!editing
          ? <button onClick={() => setEditing(true)} className="btn-secondary text-xs flex items-center gap-1"><Edit2 size={12}/>Editar</button>
          : <button onClick={() => { onSave(cfg); setEditing(false) }} className="btn-primary text-xs flex items-center gap-1"><Save size={12}/>Guardar</button>
        }
      </div>

      <div>
        <label className="block text-xs font-medium text-dark-500 mb-2 uppercase tracking-wider">
          Tasa de acumulación
        </label>
        {editing ? (
          <div className="flex items-center gap-2">
            <span className="text-sm text-dark-600">1 punto cada</span>
            <input type="number" min="500" step="100"
              className="input w-28 text-center"
              value={Math.round(1 / cfg.points_per_clp)}
              onChange={e => setCfg(p => ({ ...p, points_per_clp: 1 / Number(e.target.value) }))}
            />
            <span className="text-sm text-dark-600">CLP</span>
          </div>
        ) : (
          <p className="text-sm text-dark-700 bg-dark-50 rounded-lg px-3 py-2">
            1 punto por cada <strong>${Math.round(1 / cfg.points_per_clp).toLocaleString('es-CL')}</strong> CLP gastados
          </p>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-xs font-medium text-dark-500 uppercase tracking-wider">Niveles de canje</label>
          {editing && (
            <button onClick={addLevel} className="text-xs text-brand-600 hover:underline flex items-center gap-1">
              <Plus size={11} /> Agregar nivel
            </button>
          )}
        </div>
        <div className="space-y-2">
          {cfg.levels.map((l, i) => (
            <div key={i} className="flex items-center gap-3 p-3 bg-dark-50 rounded-xl">
              {editing ? (
                <>
                  <input type="number" className="input w-20 text-center text-sm"
                    value={l.points} onChange={e => updateLevel(i, 'points', Number(e.target.value))} />
                  <span className="text-xs text-dark-400">pts →</span>
                  <input className="input flex-1 text-sm" value={l.reward}
                    onChange={e => updateLevel(i, 'reward', e.target.value)} />
                  <button onClick={() => removeLevel(i)} className="text-red-400 hover:text-red-600">
                    <X size={14} />
                  </button>
                </>
              ) : (
                <>
                  <div className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                    'bg-brand-100 text-brand-700'
                  }`}>
                    {l.points} pts
                  </div>
                  <ChevronRight size={13} className="text-dark-300" />
                  <span className="text-sm text-dark-700 flex-1">{l.reward}</span>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function Loyalty() {
  const { isAdmin } = useAuth()

  const [clients, setClients] = useState(MOCK_CLIENTS)
  const [config,  setConfig]  = useState(LOYALTY_CONFIG)
  const [search,  setSearch]  = useState('')
  const [adjusting, setAdjusting] = useState(null)
  const [tab, setTab] = useState('overview')

  // Transactions history (derived from visits + mock adjustments)
  const transactions = useMemo(() => [
    ...MOCK_VISITS.flatMap(v => {
      const client = MOCK_CLIENTS.find(c => c.id === v.client_id)
      const items  = []
      if (v.points_earned) items.push({
        id: `${v.id}-e`, client_id: v.client_id, client_name: client?.name,
        type: 'earned', points: v.points_earned, date: v.date, reason: v.service,
      })
      if (v.redeemed) items.push({
        id: `${v.id}-r`, client_id: v.client_id, client_name: client?.name,
        type: 'redeemed', points: v.redeemed_points, date: v.date, reason: 'Canje aplicado',
      })
      return items
    }),
  ].sort((a, b) => new Date(b.date) - new Date(a.date)), [])

  const stats = useMemo(() => ({
    totalPoints: clients.reduce((s, c) => s + c.loyalty_points, 0),
    activeClients: clients.filter(c => c.loyalty_points > 0).length,
    redeemReady:  clients.filter(c => c.loyalty_points >= config.levels[0]?.points).length,
    totalEarned:  transactions.filter(t => t.type === 'earned').reduce((s, t) => s + t.points, 0),
  }), [clients, transactions, config])

  const filteredClients = useMemo(() => {
    const q = search.toLowerCase()
    if (!q) return [...clients].sort((a, b) => b.loyalty_points - a.loyalty_points)
    return clients.filter(c => c.name.toLowerCase().includes(q) || c.rut.includes(q))
      .sort((a, b) => b.loyalty_points - a.loyalty_points)
  }, [clients, search])

  function handleAdjust(clientId, delta, reason) {
    setClients(prev => prev.map(c =>
      c.id === clientId ? { ...c, loyalty_points: Math.max(0, c.loyalty_points + delta) } : c
    ))
    setAdjusting(null)
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl text-dark-900">Loyalty Card</h1>
          <p className="text-sm text-dark-400 mt-0.5">Sistema de puntos y recompensas</p>
        </div>
        <div className="flex border border-dark-200 rounded-lg overflow-hidden">
          {[['overview','Resumen'],['clients','Clientes'],['history','Historial'],['config','Config']].map(([t,l]) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 text-xs font-medium transition-colors ${
                tab === t ? 'bg-dark-900 text-white' : 'text-dark-500 hover:bg-dark-50'
              }`}>
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* OVERVIEW TAB */}
      {tab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard color="dark"  icon={<Star size={20}/>}      label="Puntos circulando" value={stats.totalPoints.toLocaleString()} sub="en todos los clientes" />
            <StatCard color="brand" icon={<Users size={20}/>}     label="Clientes activos"  value={stats.activeClients} sub="con puntos acumulados" />
            <StatCard color="amber" icon={<Gift size={20}/>}      label="Listos para canje" value={stats.redeemReady}  sub={`≥ ${config.levels[0]?.points} pts`} />
            <StatCard color="green" icon={<TrendingUp size={20}/>} label="Puntos otorgados"  value={stats.totalEarned.toLocaleString()} sub="total histórico" />
          </div>

          {/* Top clientes */}
          <div className="card p-6">
            <h3 className="font-medium text-dark-900 mb-4">Top clientes por puntos</h3>
            <div className="space-y-3">
              {[...clients].sort((a,b) => b.loyalty_points - a.loyalty_points).slice(0,5).map((c, i) => {
                const lvl = loyaltyLevel(c.loyalty_points, config.levels)
                const max = config.levels[config.levels.length-1]?.points || 500
                return (
                  <div key={c.id} className="flex items-center gap-3">
                    <span className="text-xs font-bold text-dark-400 w-5 text-right">{i+1}</span>
                    <div className="w-8 h-8 rounded-xl bg-dark-100 flex items-center justify-center text-sm font-serif">
                      {c.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-dark-900 truncate">{c.name}</span>
                        <span className="text-xs font-semibold text-brand-600 ml-2 flex-shrink-0">
                          {c.loyalty_points} pts
                        </span>
                      </div>
                      <div className="h-1.5 bg-dark-100 rounded-full overflow-hidden">
                        <div className="h-full bg-brand-400 rounded-full" style={{ width: `${Math.min((c.loyalty_points/max)*100,100)}%` }}/>
                      </div>
                    </div>
                    {lvl && (
                      <span className="text-[10px] px-2 py-0.5 bg-amber-50 border border-amber-200 text-amber-700 rounded-full whitespace-nowrap">
                        {lvl.reward.split(' ').slice(0,2).join(' ')}
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* CLIENTS TAB */}
      {tab === 'clients' && (
        <div className="space-y-4">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" />
            <input className="input pl-9" placeholder="Buscar cliente…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="card overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-dark-100 bg-dark-50">
                  {['Cliente','RUT','Puntos','Nivel',''].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-[10px] font-semibold text-dark-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-50">
                {filteredClients.map(c => {
                  const lvl = loyaltyLevel(c.loyalty_points, config.levels)
                  const max = config.levels[config.levels.length-1]?.points || 500
                  return (
                    <tr key={c.id} className="hover:bg-dark-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-dark-100 flex items-center justify-center text-sm font-serif">
                            {c.name.charAt(0)}
                          </div>
                          <span className="text-sm font-medium text-dark-900">{c.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-dark-500 font-mono">{c.rut}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-dark-100 rounded-full overflow-hidden">
                            <div className="h-full bg-brand-400 rounded-full" style={{ width: `${Math.min((c.loyalty_points/max)*100,100)}%`}}/>
                          </div>
                          <span className="text-sm font-semibold text-dark-900">{c.loyalty_points}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {lvl
                          ? <span className="text-xs px-2 py-1 bg-amber-50 border border-amber-200 text-amber-700 rounded-full">{lvl.reward}</span>
                          : <span className="text-xs text-dark-400">Sin nivel</span>
                        }
                      </td>
                      <td className="px-4 py-3">
                        {isAdmin && (
                          <button onClick={() => setAdjusting(c)}
                            className="text-xs px-3 py-1.5 rounded-lg border border-dark-200 hover:bg-dark-50 transition-colors text-dark-600">
                            Ajustar
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* HISTORY TAB */}
      {tab === 'history' && (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-100 bg-dark-50">
                {['Fecha','Cliente','Tipo','Motivo','Puntos'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-[10px] font-semibold text-dark-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-50">
              {transactions.map(t => (
                <tr key={t.id} className="hover:bg-dark-50 transition-colors">
                  <td className="px-4 py-3 text-xs text-dark-500">
                    {format(parseISO(t.date), "d MMM yyyy", { locale: es })}
                  </td>
                  <td className="px-4 py-3 text-sm text-dark-800 font-medium">{t.client_name}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      t.type === 'earned' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {t.type === 'earned' ? 'Ganado' : 'Canjeado'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-dark-600">{t.reason}</td>
                  <td className="px-4 py-3">
                    <span className={`text-sm font-semibold flex items-center gap-1 ${
                      t.points > 0 ? 'text-green-600' : 'text-amber-600'
                    }`}>
                      {t.points > 0
                        ? <ArrowUpRight size={14}/>
                        : <ArrowDownRight size={14}/>
                      }
                      {t.points > 0 ? '+' : ''}{t.points}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* CONFIG TAB */}
      {tab === 'config' && isAdmin && (
        <ConfigPanel config={config} onSave={setConfig} />
      )}

      {/* Adjust Modal */}
      {adjusting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setAdjusting(null)}/>
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold">Ajustar puntos</h2>
              <button onClick={() => setAdjusting(null)} className="p-1.5 rounded-lg hover:bg-dark-50">
                <X size={15} className="text-dark-400"/>
              </button>
            </div>
            <AdjustModal client={adjusting} onSave={handleAdjust} onClose={() => setAdjusting(null)}/>
          </div>
        </div>
      )}
    </div>
  )
}
