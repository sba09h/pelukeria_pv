import { useState, useMemo } from 'react'
import {
  DollarSign, Plus, Lock, Unlock, ChevronDown, ChevronUp,
  CreditCard, Banknote, Smartphone, ArrowLeftRight,
  TrendingUp, Gift, X, Check, Calendar, Printer,
  ShoppingBag, AlertCircle, History
} from 'lucide-react'
import { format, parseISO, isToday } from 'date-fns'
import { es } from 'date-fns/locale'
import { MOCK_CASH_ENTRIES, MOCK_SERVICES } from '../../lib/mockData'
import Modal from '../../components/ui/Modal'
import { useAuth } from '../../context/AuthContext'

// ── Constants ────────────────────────────────────────────────────────────────
const METHODS = [
  { id: 'efectivo',      label: 'Efectivo',      icon: Banknote,        color: 'text-green-600',  bg: 'bg-green-50  border-green-200' },
  { id: 'debito',        label: 'Débito',         icon: CreditCard,      color: 'text-blue-600',   bg: 'bg-blue-50   border-blue-200'  },
  { id: 'credito',       label: 'Crédito',        icon: CreditCard,      color: 'text-purple-600', bg: 'bg-purple-50 border-purple-200'},
  { id: 'transferencia', label: 'Transferencia',  icon: Smartphone,      color: 'text-indigo-600', bg: 'bg-indigo-50 border-indigo-200'},
]

const METHOD_MAP = Object.fromEntries(METHODS.map(m => [m.id, m]))

// ── New Entry Form ────────────────────────────────────────────────────────────
function EntryForm({ onSave, onClose }) {
  const [form, setForm] = useState({
    client:          '',
    service:         '',
    amount:          '',
    method:          'efectivo',
    loyalty_discount: 0,
    notes:           '',
  })
  const f = k => v => setForm(p => ({ ...p, [k]: v }))
  const net = Number(form.amount) - (form.loyalty_discount || 0)

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="label-xs">Cliente</label>
          <input className="input" placeholder="Nombre del cliente" value={form.client} onChange={e => f('client')(e.target.value)} />
        </div>
        <div className="col-span-2">
          <label className="label-xs">Servicio</label>
          <select className="input" value={form.service} onChange={e => f('service')(e.target.value)}>
            <option value="">Seleccionar…</option>
            {MOCK_SERVICES.map(s => (
              <option key={s.id} value={s.name}>{s.name} — ${s.price.toLocaleString('es-CL')}</option>
            ))}
            <option value="Otro">Otro</option>
          </select>
        </div>
        <div>
          <label className="label-xs">Monto cobrado (CLP) *</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400 text-sm">$</span>
            <input type="number" min="0" className="input pl-7" placeholder="0"
              value={form.amount} onChange={e => f('amount')(e.target.value)} />
          </div>
        </div>
        <div>
          <label className="label-xs">Descuento loyalty</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400 text-sm">$</span>
            <input type="number" min="0" className="input pl-7" placeholder="0"
              value={form.loyalty_discount} onChange={e => f('loyalty_discount')(Number(e.target.value))} />
          </div>
        </div>
      </div>

      {/* Payment method */}
      <div>
        <label className="label-xs mb-2">Método de pago *</label>
        <div className="grid grid-cols-2 gap-2">
          {METHODS.map(m => {
            const Icon = m.icon
            return (
              <button key={m.id} onClick={() => f('method')(m.id)}
                className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                  form.method === m.id
                    ? 'border-dark-900 bg-dark-900 text-white'
                    : 'border-dark-200 hover:border-dark-300'
                }`}>
                <Icon size={15} className={form.method === m.id ? 'text-white' : m.color} />
                <span className="text-sm font-medium">{m.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Net total */}
      {form.amount > 0 && (
        <div className="p-4 bg-dark-900 text-white rounded-xl flex justify-between items-center">
          <div>
            <p className="text-xs text-white/50">Total neto</p>
            {form.loyalty_discount > 0 && (
              <p className="text-xs text-brand-400 mt-0.5">
                Descuento loyalty: -${Number(form.loyalty_discount).toLocaleString('es-CL')}
              </p>
            )}
          </div>
          <p className="text-2xl font-light">${net.toLocaleString('es-CL')}</p>
        </div>
      )}

      <div className="flex gap-2 pt-1">
        <button className="btn-secondary flex-1" onClick={onClose}>Cancelar</button>
        <button className="btn-primary flex-1" disabled={!form.amount || !form.method}
          onClick={() => onSave(form)}>
          Registrar ingreso
        </button>
      </div>
    </div>
  )
}

// ── Day Summary Card ─────────────────────────────────────────────────────────
function DaySummary({ entries, onClose }) {
  const total    = entries.reduce((s, e) => s + e.amount, 0)
  const discounts = entries.reduce((s, e) => s + (e.loyalty_discount || 0), 0)
  const byMethod = METHODS.map(m => ({
    ...m,
    amount: entries.filter(e => e.method === m.id).reduce((s, e) => s + e.amount, 0),
    count:  entries.filter(e => e.method === m.id).length,
  })).filter(m => m.amount > 0)

  return (
    <div className="space-y-5">
      <div className="text-center">
        <p className="text-xs text-dark-500 uppercase tracking-wider mb-1">Total del día</p>
        <p className="font-serif text-4xl text-dark-900 font-light">${total.toLocaleString('es-CL')}</p>
        {discounts > 0 && (
          <p className="text-xs text-brand-600 mt-1 flex items-center justify-center gap-1">
            <Gift size={11}/> Descuentos loyalty aplicados: ${discounts.toLocaleString('es-CL')}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 bg-dark-50 rounded-xl text-center">
          <p className="text-lg font-semibold text-dark-900">{entries.length}</p>
          <p className="text-[10px] text-dark-400 uppercase tracking-wide">servicios</p>
        </div>
        <div className="p-3 bg-dark-50 rounded-xl text-center">
          <p className="text-lg font-semibold text-dark-900">${Math.round(total/entries.length).toLocaleString('es-CL')}</p>
          <p className="text-[10px] text-dark-400 uppercase tracking-wide">ticket promedio</p>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-medium text-dark-500 uppercase tracking-wider">Por método de pago</p>
        {byMethod.map(m => {
          const Icon = m.icon
          return (
            <div key={m.id} className={`flex items-center gap-3 p-3 rounded-xl border ${m.bg}`}>
              <Icon size={15} className={m.color} />
              <div className="flex-1">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-dark-800">{m.label}</span>
                  <span className="text-sm font-semibold text-dark-900">${m.amount.toLocaleString('es-CL')}</span>
                </div>
                <div className="w-full h-1 bg-white/60 rounded-full mt-1.5 overflow-hidden">
                  <div className="h-full rounded-full bg-current opacity-40" style={{ width: `${(m.amount/total)*100}%` }}/>
                </div>
              </div>
              <span className="text-xs text-dark-400">{m.count} pago{m.count!==1?'s':''}</span>
            </div>
          )
        })}
      </div>

      <div className="space-y-1 max-h-48 overflow-y-auto border border-dark-100 rounded-xl divide-y divide-dark-50">
        {entries.map(e => {
          const m = METHOD_MAP[e.method]
          const Icon = m?.icon || DollarSign
          return (
            <div key={e.id} className="flex items-center gap-3 px-3 py-2.5">
              <Icon size={13} className={m?.color || 'text-dark-400'} />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-dark-800 truncate">{e.client || '—'}</p>
                <p className="text-[10px] text-dark-400 truncate">{e.service}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-xs font-semibold text-dark-900">${e.amount.toLocaleString('es-CL')}</p>
                {e.loyalty_discount > 0 && (
                  <p className="text-[10px] text-brand-500">-${e.loyalty_discount.toLocaleString('es-CL')}</p>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <div className="flex gap-2">
        <button className="btn-secondary flex-1" onClick={onClose}>Cerrar</button>
        <button className="btn-primary flex-1 flex items-center justify-center gap-1.5" onClick={() => window.print()}>
          <Printer size={14}/> Imprimir cierre
        </button>
      </div>
    </div>
  )
}

// ── History Table ─────────────────────────────────────────────────────────────
function HistoryTable({ entries }) {
  const byDate = useMemo(() => {
    const days = {}
    entries.forEach(e => {
      if (!days[e.date]) days[e.date] = []
      days[e.date].push(e)
    })
    return Object.entries(days)
      .sort(([a],[b]) => new Date(b) - new Date(a))
      .map(([date, items]) => ({
        date,
        items,
        total: items.reduce((s, e) => s + e.amount, 0),
        closed: items.every(e => e.closed),
      }))
  }, [entries])

  const [expanded, setExpanded] = useState(null)

  return (
    <div className="space-y-2">
      {byDate.map(({ date, items, total, closed }) => (
        <div key={date} className="card overflow-hidden">
          <button
            className="w-full flex items-center gap-4 px-5 py-4 hover:bg-dark-50 transition-colors"
            onClick={() => setExpanded(d => d === date ? null : date)}>
            <div className="flex-1 flex items-center gap-4 text-left">
              <div>
                <p className="text-sm font-medium text-dark-900 capitalize">
                  {format(parseISO(date), "EEEE d 'de' MMMM", { locale: es })}
                </p>
                <p className="text-xs text-dark-400 mt-0.5">{items.length} servicio{items.length!==1?'s':''}</p>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ml-auto ${
                isToday(parseISO(date))
                  ? 'bg-blue-50 border-blue-200 text-blue-700'
                  : closed
                    ? 'bg-green-50 border-green-200 text-green-700'
                    : 'bg-amber-50 border-amber-200 text-amber-700'
              }`}>
                {isToday(parseISO(date)) ? 'Hoy' : closed ? 'Cerrado' : 'Abierto'}
              </span>
            </div>
            <p className="font-semibold text-dark-900 text-base">${total.toLocaleString('es-CL')}</p>
            {expanded === date ? <ChevronUp size={15} className="text-dark-400"/> : <ChevronDown size={15} className="text-dark-400"/>}
          </button>

          {expanded === date && (
            <div className="border-t border-dark-100 divide-y divide-dark-50">
              {/* Method breakdown */}
              <div className="px-5 py-3 flex gap-4 bg-dark-50/50">
                {METHODS.map(m => {
                  const mTotal = items.filter(e => e.method === m.id).reduce((s,e) => s+e.amount, 0)
                  if (!mTotal) return null
                  const Icon = m.icon
                  return (
                    <div key={m.id} className="flex items-center gap-1.5 text-xs">
                      <Icon size={11} className={m.color}/>
                      <span className="text-dark-500">{m.label}:</span>
                      <span className="font-semibold text-dark-800">${mTotal.toLocaleString('es-CL')}</span>
                    </div>
                  )
                })}
              </div>
              {/* Entries */}
              {items.map(e => {
                const m = METHOD_MAP[e.method]
                const Icon = m?.icon || DollarSign
                return (
                  <div key={e.id} className="flex items-center gap-3 px-5 py-3">
                    <Icon size={13} className={m?.color || 'text-dark-400'}/>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm text-dark-800">{e.client || '—'}</span>
                      <span className="text-xs text-dark-400 ml-2">{e.service}</span>
                    </div>
                    {e.loyalty_discount > 0 && (
                      <span className="text-xs text-brand-500 flex items-center gap-0.5">
                        <Gift size={10}/> -{e.loyalty_discount.toLocaleString('es-CL')}
                      </span>
                    )}
                    <span className="font-semibold text-dark-900 text-sm">${e.amount.toLocaleString('es-CL')}</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function Caja() {
  const { isAdmin, profile } = useAuth()

  const [entries,  setEntries]  = useState(MOCK_CASH_ENTRIES)
  const [modal,    setModal]    = useState(null)  // null | 'new' | 'close' | 'history'
  const [tab,      setTab]      = useState('hoy') // 'hoy' | 'historial'
  const [isClosed, setIsClosed] = useState(false)

  const today = new Date().toISOString().split('T')[0]
  const todayEntries = useMemo(() => entries.filter(e => e.date === today), [entries, today])

  // Stats for today
  const stats = useMemo(() => {
    const total    = todayEntries.reduce((s, e) => s + e.amount, 0)
    const discounts = todayEntries.reduce((s, e) => s + (e.loyalty_discount || 0), 0)
    const byMethod = METHODS.map(m => ({
      ...m,
      amount: todayEntries.filter(e => e.method === m.id).reduce((s, e) => s + e.amount, 0),
    }))
    return { total, discounts, byMethod, count: todayEntries.length }
  }, [todayEntries])

  function handleAddEntry(form) {
    setEntries(prev => [{
      id: 'ca' + Date.now(),
      date: today,
      client:          form.client,
      service:         form.service,
      amount:          Number(form.amount),
      method:          form.method,
      loyalty_discount: form.loyalty_discount || 0,
      closed:          false,
    }, ...prev])
    setModal(null)
  }

  function handleClose() {
    setEntries(prev => prev.map(e => e.date === today ? { ...e, closed: true } : e))
    setIsClosed(true)
    setModal(null)
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Header */}
      <header className="flex items-center gap-4 px-6 py-4 bg-white border-b border-dark-100 flex-shrink-0">
        <h1 className="font-serif text-xl text-dark-900">Caja</h1>
        <span className="text-sm text-dark-400 capitalize">
          {format(new Date(), "EEEE d 'de' MMMM", { locale: es })}
        </span>

        {isClosed && (
          <span className="text-xs px-2.5 py-1 bg-green-50 border border-green-200 text-green-700 rounded-full font-medium flex items-center gap-1">
            <Lock size={11}/> Caja cerrada
          </span>
        )}

        <div className="flex border border-dark-200 rounded-lg overflow-hidden ml-auto">
          {[['hoy','Hoy'],['historial','Historial']].map(([t,l]) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 text-xs font-medium transition-colors ${
                tab === t ? 'bg-dark-900 text-white' : 'text-dark-500 hover:bg-dark-50'
              }`}>{l}
            </button>
          ))}
        </div>

        {tab === 'hoy' && !isClosed && (
          <div className="flex gap-2">
            <button onClick={() => setModal('new')} className="btn-primary text-xs flex items-center gap-1.5">
              <Plus size={13}/> Registrar ingreso
            </button>
            {isAdmin && todayEntries.length > 0 && (
              <button onClick={() => setModal('close')}
                className="btn-secondary text-xs flex items-center gap-1.5 text-dark-700">
                <Lock size={13}/> Cerrar caja
              </button>
            )}
          </div>
        )}
      </header>

      {/* HOY tab */}
      {tab === 'hoy' && (
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto space-y-6">

            {/* Big total */}
            <div className="card p-6 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-dark-900 to-dark-800" />
              <div className="absolute inset-0 opacity-[0.03]"
                style={{ backgroundImage: 'radial-gradient(circle, #C8B89A 1px, transparent 1px)', backgroundSize: '24px 24px' }}/>
              <div className="relative z-10">
                <p className="text-white/50 text-xs uppercase tracking-widest mb-2">Ingresos del día</p>
                <p className="font-serif text-5xl text-white font-light">
                  ${stats.total.toLocaleString('es-CL')}
                </p>
                <p className="text-white/40 text-sm mt-2">{stats.count} servicio{stats.count !== 1 ? 's' : ''} realizados</p>
                {stats.discounts > 0 && (
                  <p className="text-brand-400 text-xs mt-1 flex items-center justify-center gap-1">
                    <Gift size={11}/> Descuentos loyalty: ${stats.discounts.toLocaleString('es-CL')}
                  </p>
                )}
              </div>
            </div>

            {/* By method */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {stats.byMethod.map(m => {
                const Icon = m.icon
                return (
                  <div key={m.id} className={`rounded-xl border p-4 ${m.bg}`}>
                    <div className="flex items-center justify-between mb-2">
                      <Icon size={16} className={m.color}/>
                      <span className="text-[10px] text-dark-400 uppercase tracking-wide">{m.label}</span>
                    </div>
                    <p className={`text-lg font-semibold ${m.amount > 0 ? 'text-dark-900' : 'text-dark-300'}`}>
                      ${m.amount.toLocaleString('es-CL')}
                    </p>
                  </div>
                )
              })}
            </div>

            {/* Entries list */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-dark-700">Registros del día</h3>
                {todayEntries.length > 0 && (
                  <button onClick={() => setModal('summary')} className="text-xs text-brand-600 hover:underline">
                    Ver resumen completo →
                  </button>
                )}
              </div>

              {todayEntries.length === 0 ? (
                <div className="card py-16 text-center text-dark-400">
                  <DollarSign size={32} className="mx-auto mb-3 opacity-30"/>
                  <p className="text-sm">Sin ingresos registrados hoy.</p>
                  <button onClick={() => setModal('new')} className="btn-primary text-xs mt-4 mx-auto flex items-center gap-1">
                    <Plus size={13}/> Registrar primer ingreso
                  </button>
                </div>
              ) : (
                <div className="card overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-dark-50 border-b border-dark-100">
                        {['Cliente','Servicio','Pago','Loyalty','Monto'].map(h => (
                          <th key={h} className="text-left px-4 py-3 text-[10px] font-semibold text-dark-500 uppercase tracking-wider">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-dark-50">
                      {todayEntries.map(e => {
                        const m = METHOD_MAP[e.method]
                        const Icon = m?.icon || DollarSign
                        return (
                          <tr key={e.id} className="hover:bg-dark-50 transition-colors">
                            <td className="px-4 py-3 text-sm font-medium text-dark-900">{e.client || '—'}</td>
                            <td className="px-4 py-3 text-sm text-dark-600">{e.service || '—'}</td>
                            <td className="px-4 py-3">
                              <div className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border ${m?.bg || ''}`}>
                                <Icon size={11} className={m?.color || ''}/>
                                <span className={m?.color || ''}>{m?.label || e.method}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              {e.loyalty_discount > 0 ? (
                                <span className="text-xs text-brand-600 flex items-center gap-0.5 font-medium">
                                  <Gift size={11}/> -${e.loyalty_discount.toLocaleString('es-CL')}
                                </span>
                              ) : <span className="text-xs text-dark-300">—</span>}
                            </td>
                            <td className="px-4 py-3 text-sm font-semibold text-dark-900">
                              ${e.amount.toLocaleString('es-CL')}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                    <tfoot className="bg-dark-50 border-t border-dark-200">
                      <tr>
                        <td colSpan={4} className="px-4 py-3 text-xs font-semibold text-dark-600 uppercase tracking-wide">Total del día</td>
                        <td className="px-4 py-3 text-base font-bold text-dark-900">${stats.total.toLocaleString('es-CL')}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </div>

            {/* Close caja CTA */}
            {!isClosed && isAdmin && todayEntries.length > 0 && (
              <div className="flex items-center gap-4 p-4 bg-dark-50 border border-dark-200 rounded-xl">
                <AlertCircle size={18} className="text-dark-400 flex-shrink-0"/>
                <div className="flex-1">
                  <p className="text-sm font-medium text-dark-800">¿Listo para cerrar el día?</p>
                  <p className="text-xs text-dark-500 mt-0.5">El cierre registra los totales y marca todos los ingresos como cerrados.</p>
                </div>
                <button onClick={() => setModal('close')}
                  className="btn-primary text-xs flex items-center gap-1.5 flex-shrink-0">
                  <Lock size={13}/> Cerrar caja
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* HISTORIAL tab — admin only */}
      {tab === 'historial' && (
        <div className="flex-1 overflow-y-auto p-6">
          {!isAdmin ? (
            <div className="flex flex-col items-center justify-center h-64 text-dark-400 gap-2">
              <Lock size={32} className="opacity-30"/>
              <p className="text-sm">Solo el administrador puede ver el historial de cierres.</p>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto">
              <h3 className="text-sm font-medium text-dark-600 mb-4">Historial de cierres</h3>
              <HistoryTable entries={entries} />
            </div>
          )}
        </div>
      )}

      {/* ── Modals ── */}
      <Modal open={modal === 'new'} onClose={() => setModal(null)} title="Registrar ingreso" size="md">
        <EntryForm onSave={handleAddEntry} onClose={() => setModal(null)} />
      </Modal>

      <Modal open={modal === 'close'} onClose={() => setModal(null)} title="Cerrar caja del día" size="sm">
        <div className="space-y-5">
          <div className="p-5 bg-dark-50 rounded-xl text-center">
            <p className="text-xs text-dark-500 uppercase tracking-wider mb-1">Total a cerrar</p>
            <p className="font-serif text-4xl text-dark-900 font-light">${stats.total.toLocaleString('es-CL')}</p>
            <p className="text-xs text-dark-400 mt-1">{stats.count} servicios registrados</p>
          </div>
          <p className="text-sm text-dark-600 text-center">
            Esta acción marcará todos los ingresos de hoy como cerrados. ¿Confirmar cierre de caja?
          </p>
          <div className="flex gap-2">
            <button className="btn-secondary flex-1" onClick={() => setModal(null)}>Cancelar</button>
            <button className="btn-primary flex-1 flex items-center justify-center gap-1.5" onClick={handleClose}>
              <Lock size={14}/> Confirmar cierre
            </button>
          </div>
        </div>
      </Modal>

      <Modal open={modal === 'summary'} onClose={() => setModal(null)} title="Resumen del día" size="md">
        <DaySummary entries={todayEntries} onClose={() => setModal(null)} />
      </Modal>
    </div>
  )
}
