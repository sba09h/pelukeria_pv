import { useState, useMemo } from 'react'
import {
  ChevronLeft, ChevronRight, TrendingUp, Users,
  Scissors, DollarSign, ChevronDown, ChevronUp,
  Edit2, Check, X, Info
} from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { MOCK_PELUQUEROS, MOCK_PRODUCCION, MOCK_COMISIONES } from '../../lib/mockData'
import { useAuth } from '../../context/AuthContext'

const MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

const CATEGORY_COLORS = {
  'Corte':        { bar: 'bg-blue-400',   dot: 'bg-blue-400',   text: 'text-blue-700',   bg: 'bg-blue-50'   },
  'Color':        { bar: 'bg-amber-400',  dot: 'bg-amber-400',  text: 'text-amber-700',  bg: 'bg-amber-50'  },
  'Tratamientos': { bar: 'bg-emerald-400',dot: 'bg-emerald-400',text: 'text-emerald-700',bg: 'bg-emerald-50'},
  'Manicure':     { bar: 'bg-pink-400',   dot: 'bg-pink-400',   text: 'text-pink-700',   bg: 'bg-pink-50'   },
  'Otros':        { bar: 'bg-dark-300',   dot: 'bg-dark-300',   text: 'text-dark-500',   bg: 'bg-dark-50'   },
}

// ── Mini bar chart ────────────────────────────────────────────────────────────
function MiniBar({ value, max, color }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0
  return (
    <div className="flex items-center gap-2 w-full">
      <div className="flex-1 h-2 bg-dark-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs text-dark-400 w-8 text-right">{pct}%</span>
    </div>
  )
}

// ── Category breakdown donut (CSS only) ──────────────────────────────────────
function CategoryPie({ data }) {
  // data: [{label, amount, color}]
  const total = data.reduce((s, d) => s + d.amount, 0)
  if (total === 0) return null

  // Build conic-gradient segments
  let cursor = 0
  const segments = data.map(d => {
    const pct = (d.amount / total) * 100
    const seg = { ...d, pct, start: cursor }
    cursor += pct
    return seg
  })

  const gradient = segments
    .map(s => {
      const col = s.cssColor
      return `${col} ${s.start.toFixed(1)}% ${(s.start + s.pct).toFixed(1)}%`
    })
    .join(', ')

  return (
    <div className="relative w-28 h-28 flex-shrink-0">
      <div
        className="w-28 h-28 rounded-full"
        style={{ background: `conic-gradient(${gradient})` }}
      />
      {/* Hole */}
      <div className="absolute inset-3 rounded-full bg-white flex flex-col items-center justify-center">
        <p className="text-[10px] text-dark-400 leading-tight">Total</p>
        <p className="text-xs font-semibold text-dark-900">${Math.round(total/1000)}k</p>
      </div>
    </div>
  )
}

// ── Peluquero detail card ─────────────────────────────────────────────────────
function PeluqueroCard({ p, data, commission, onEditCommission, isAdmin, maxProduction }) {
  const [expanded, setExpanded] = useState(false)
  const [editing, setEditing] = useState(false)
  const [tempPct, setTempPct] = useState(commission)

  const total    = data.reduce((s, d) => s + d.amount, 0)
  const comision = Math.round(total * commission / 100)
  const clients  = [...new Set(data.map(d => d.client))].length

  // Category breakdown
  const cats = {}
  data.forEach(d => {
    cats[d.category] = (cats[d.category] || 0) + d.amount
  })
  const catData = Object.entries(cats)
    .sort((a,b) => b[1] - a[1])
    .map(([label, amount]) => ({
      label, amount,
      cssColor: label === 'Corte' ? '#60a5fa' : label === 'Color' ? '#fbbf24' : label === 'Tratamientos' ? '#34d399' : label === 'Manicure' ? '#f472b6' : '#9ca3af',
      cls: CATEGORY_COLORS[label] || CATEGORY_COLORS['Otros'],
    }))

  function saveCommission() {
    onEditCommission(p.id, Number(tempPct))
    setEditing(false)
  }

  return (
    <div className="card overflow-hidden">
      {/* Header */}
      <div className="p-5 flex items-center gap-4">
        {/* Avatar */}
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center text-white text-base font-semibold flex-shrink-0 shadow-inner"
          style={{ backgroundColor: p.color }}>
          {p.avatar}
        </div>

        {/* Name + stats */}
        <div className="flex-1 min-w-0">
          <p className="font-medium text-dark-900">{p.name}</p>
          <div className="flex items-center gap-4 mt-1">
            <span className="text-xs text-dark-400">{data.length} servicio{data.length !== 1 ? 's' : ''}</span>
            <span className="text-xs text-dark-400">{clients} cliente{clients !== 1 ? 's' : ''}</span>
          </div>
          {/* Mini bar vs max */}
          <div className="mt-2">
            <MiniBar value={total} max={maxProduction} color="bg-dark-900" />
          </div>
        </div>

        {/* Production + commission */}
        <div className="text-right flex-shrink-0">
          <p className="text-lg font-semibold text-dark-900">${total.toLocaleString('es-CL')}</p>
          <div className="flex items-center gap-1.5 justify-end mt-0.5">
            {editing ? (
              <div className="flex items-center gap-1">
                <input
                  type="number" min="0" max="100"
                  className="input !w-14 text-xs py-0.5 text-center"
                  value={tempPct}
                  onChange={e => setTempPct(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') saveCommission(); if (e.key === 'Escape') setEditing(false) }}
                  autoFocus
                />
                <span className="text-xs text-dark-500">%</span>
                <button onClick={saveCommission} className="p-1 rounded hover:bg-green-50 text-green-600"><Check size={12}/></button>
                <button onClick={() => setEditing(false)} className="p-1 rounded hover:bg-red-50 text-red-400"><X size={12}/></button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-dark-400">{commission}%</span>
                {isAdmin && (
                  <button onClick={() => setEditing(true)} className="p-0.5 rounded hover:bg-dark-100 text-dark-300 transition-colors">
                    <Edit2 size={10}/>
                  </button>
                )}
                <span className="text-xs font-medium text-brand-600">=&nbsp;${comision.toLocaleString('es-CL')}</span>
              </div>
            )}
          </div>
        </div>

        {/* Expand toggle */}
        <button onClick={() => setExpanded(e => !e)} className="p-1.5 rounded-lg hover:bg-dark-100 text-dark-400 transition-colors ml-1">
          {expanded ? <ChevronUp size={15}/> : <ChevronDown size={15}/>}
        </button>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t border-dark-100">
          <div className="p-5 flex gap-6">
            {/* Category pie */}
            <CategoryPie data={catData} />

            {/* Category bars */}
            <div className="flex-1 space-y-3">
              <p className="text-xs font-medium text-dark-500 uppercase tracking-wider">Por categoría</p>
              {catData.map(c => (
                <div key={c.label} className="flex items-center gap-3">
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${c.cls.dot}`}/>
                  <span className="text-xs text-dark-700 w-24 flex-shrink-0">{c.label}</span>
                  <div className="flex-1">
                    <MiniBar value={c.amount} max={total} color={c.cls.bar} />
                  </div>
                  <span className="text-xs font-medium text-dark-900 w-20 text-right">${c.amount.toLocaleString('es-CL')}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Service table */}
          <div className="border-t border-dark-100 max-h-52 overflow-y-auto">
            <table className="w-full">
              <thead className="sticky top-0 bg-dark-50">
                <tr>
                  {['Fecha','Cliente','Servicio','Monto'].map(h => (
                    <th key={h} className="text-left px-4 py-2 text-[10px] font-semibold text-dark-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-50">
                {[...data].sort((a,b) => new Date(b.date) - new Date(a.date)).map(d => {
                  const cls = CATEGORY_COLORS[d.category] || CATEGORY_COLORS['Otros']
                  return (
                    <tr key={d.id} className="hover:bg-dark-50 transition-colors">
                      <td className="px-4 py-2.5 text-xs text-dark-500 whitespace-nowrap">
                        {format(parseISO(d.date), 'd MMM', { locale: es })}
                      </td>
                      <td className="px-4 py-2.5 text-xs text-dark-800">{d.client}</td>
                      <td className="px-4 py-2.5">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${cls.bg} ${cls.text}`}>{d.service}</span>
                      </td>
                      <td className="px-4 py-2.5 text-xs font-medium text-dark-900 text-right">${d.amount.toLocaleString('es-CL')}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Comparative Bar Chart ─────────────────────────────────────────────────────
function ComparativeChart({ peluqueros, dataByP, commissions }) {
  const maxProduction = Math.max(...peluqueros.map(p => (dataByP[p.id] || []).reduce((s, d) => s + d.amount, 0)), 1)

  return (
    <div className="card p-6">
      <h3 className="text-sm font-medium text-dark-700 mb-6">Producción comparativa</h3>
      <div className="flex items-end gap-4 h-40">
        {peluqueros.map(p => {
          const data  = dataByP[p.id] || []
          const total = data.reduce((s, d) => s + d.amount, 0)
          const pct   = maxProduction > 0 ? (total / maxProduction) * 100 : 0
          const com   = Math.round(total * (commissions[p.id] || 0) / 100)

          return (
            <div key={p.id} className="flex-1 flex flex-col items-center gap-2">
              {/* Amount label */}
              <p className="text-xs font-semibold text-dark-900">${Math.round(total/1000)}k</p>

              {/* Bar */}
              <div className="w-full flex-1 flex items-end">
                <div
                  className="w-full rounded-t-xl transition-all duration-700 relative overflow-hidden"
                  style={{ height: `${Math.max(pct, 4)}%`, backgroundColor: p.color }}>
                  {/* Commission stripe */}
                  <div
                    className="absolute bottom-0 left-0 right-0 bg-black/20"
                    style={{ height: `${commissions[p.id] || 0}%` }}
                  />
                </div>
              </div>

              {/* Name */}
              <p className="text-[10px] text-dark-600 font-medium text-center leading-tight">
                {p.name.split(' ')[0]}
              </p>
              {/* Commission */}
              <p className="text-[10px] text-dark-400 text-center">
                Comisión: ${Math.round(com/1000)}k
              </p>
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-1.5 mt-5 pt-4 border-t border-dark-100">
        <div className="w-3 h-3 rounded-sm bg-black/20 border border-dark-200"/>
        <span className="text-[10px] text-dark-400">La franja oscura en cada barra representa el % de comisión</span>
      </div>
    </div>
  )
}

// ── Resumen total ─────────────────────────────────────────────────────────────
function ResumenCards({ peluqueros, dataByP, commissions }) {
  const totalProduction = peluqueros.reduce((s, p) => s + (dataByP[p.id] || []).reduce((ss, d) => ss + d.amount, 0), 0)
  const totalComisiones = peluqueros.reduce((s, p) => {
    const prod = (dataByP[p.id] || []).reduce((ss, d) => ss + d.amount, 0)
    return s + Math.round(prod * (commissions[p.id] || 0) / 100)
  }, 0)
  const totalServicios = peluqueros.reduce((s, p) => s + (dataByP[p.id] || []).length, 0)
  const totalClientes  = new Set(peluqueros.flatMap(p => (dataByP[p.id] || []).map(d => d.client))).size

  const cards = [
    { label: 'Producción total',  value: `$${totalProduction.toLocaleString('es-CL')}`,  icon: TrendingUp,  color: 'text-dark-900' },
    { label: 'Total comisiones',  value: `$${totalComisiones.toLocaleString('es-CL')}`,  icon: DollarSign,  color: 'text-brand-600' },
    { label: 'Servicios',         value: totalServicios,                                  icon: Scissors,    color: 'text-dark-600' },
    { label: 'Clientes únicos',   value: totalClientes,                                   icon: Users,       color: 'text-dark-600' },
  ]

  return (
    <div className="grid grid-cols-4 gap-4">
      {cards.map(({ label, value, icon: Icon, color }) => (
        <div key={label} className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-dark-500 uppercase tracking-wide">{label}</p>
            <Icon size={15} className={color}/>
          </div>
          <p className={`text-xl font-semibold ${color}`}>{value}</p>
        </div>
      ))}
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function Produccion() {
  const { isAdmin } = useAuth()

  const now = new Date()
  const [year,        setYear]        = useState(now.getFullYear())
  const [month,       setMonth]       = useState(now.getMonth() + 1) // 1-12
  const [commissions, setCommissions] = useState(MOCK_COMISIONES)

  function prevMonth() {
    if (month === 1) { setMonth(12); setYear(y => y - 1) }
    else setMonth(m => m - 1)
  }
  function nextMonth() {
    if (month === 12) { setMonth(1); setYear(y => y + 1) }
    else setMonth(m => m + 1)
  }

  // Filter production for current month/year
  const monthData = useMemo(() =>
    MOCK_PRODUCCION.filter(d => {
      const dt = parseISO(d.date)
      return dt.getFullYear() === year && dt.getMonth() + 1 === month
    }), [year, month])

  // Group by peluquero
  const dataByP = useMemo(() => {
    const map = {}
    MOCK_PELUQUEROS.forEach(p => { map[p.id] = [] })
    monthData.forEach(d => {
      if (map[d.peluquero_id]) map[d.peluquero_id].push(d)
    })
    return map
  }, [monthData])

  const maxProduction = useMemo(() =>
    Math.max(...MOCK_PELUQUEROS.map(p => (dataByP[p.id] || []).reduce((s, d) => s + d.amount, 0)), 1),
    [dataByP])

  function handleEditCommission(pid, pct) {
    setCommissions(prev => ({ ...prev, [pid]: pct }))
  }

  const hasData = monthData.length > 0

  return (
    <div className="flex flex-col min-h-screen overflow-auto">
      {/* Header */}
      <header className="flex items-center gap-4 px-6 py-4 bg-white border-b border-dark-100 flex-shrink-0 flex-wrap gap-y-2 sticky top-0 z-10">
        <h1 className="font-serif text-xl text-dark-900">Producción</h1>

        {/* Month navigator */}
        <div className="flex items-center gap-2 ml-2">
          <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-dark-100 text-dark-400 transition-colors">
            <ChevronLeft size={16}/>
          </button>
          <div className="text-center min-w-36">
            <p className="text-sm font-medium text-dark-900 capitalize">{MONTHS[month - 1]} {year}</p>
          </div>
          <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-dark-100 text-dark-400 transition-colors">
            <ChevronRight size={16}/>
          </button>
        </div>

        {/* Commission info note */}
        {isAdmin && (
          <div className="flex items-center gap-1.5 text-xs text-dark-400 ml-auto">
            <Info size={12}/>
            Haz clic en el % de cada peluquero para editar su comisión
          </div>
        )}
      </header>

      <div className="flex-1 p-6 space-y-5 max-w-5xl w-full mx-auto">

        {!hasData ? (
          <div className="flex flex-col items-center justify-center py-32 text-dark-400">
            <TrendingUp size={40} className="opacity-20 mb-4"/>
            <p className="text-sm">Sin datos de producción para {MONTHS[month-1]} {year}.</p>
          </div>
        ) : (
          <>
            {/* Summary cards */}
            <ResumenCards peluqueros={MOCK_PELUQUEROS} dataByP={dataByP} commissions={commissions} />

            {/* Chart */}
            <ComparativeChart peluqueros={MOCK_PELUQUEROS} dataByP={dataByP} commissions={commissions} />

            {/* Per-peluquero cards */}
            <div>
              <h3 className="text-sm font-medium text-dark-600 mb-3">Detalle por peluquero</h3>
              <div className="space-y-3">
                {MOCK_PELUQUEROS
                  .slice()
                  .sort((a, b) => {
                    const ta = (dataByP[a.id] || []).reduce((s, d) => s + d.amount, 0)
                    const tb = (dataByP[b.id] || []).reduce((s, d) => s + d.amount, 0)
                    return tb - ta
                  })
                  .map(p => (
                    <PeluqueroCard
                      key={p.id}
                      p={p}
                      data={dataByP[p.id] || []}
                      commission={commissions[p.id] || 0}
                      onEditCommission={handleEditCommission}
                      isAdmin={isAdmin}
                      maxProduction={maxProduction}
                    />
                  ))}
              </div>
            </div>

            {/* Commission summary table */}
            <div className="card overflow-hidden">
              <div className="px-5 py-4 border-b border-dark-100">
                <h3 className="text-sm font-medium text-dark-700">Resumen de pago</h3>
                <p className="text-xs text-dark-400 mt-0.5">Monto a pagar por comisiones — {MONTHS[month-1]} {year}</p>
              </div>
              <table className="w-full">
                <thead>
                  <tr className="bg-dark-50 border-b border-dark-100">
                    {['Peluquero','Producción bruta','% Comisión','Monto comisión','Saldo salón'].map(h => (
                      <th key={h} className="text-left px-5 py-3 text-[10px] font-semibold text-dark-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-50">
                  {MOCK_PELUQUEROS.map(p => {
                    const prod  = (dataByP[p.id] || []).reduce((s, d) => s + d.amount, 0)
                    const pct   = commissions[p.id] || 0
                    const com   = Math.round(prod * pct / 100)
                    const salon = prod - com
                    return (
                      <tr key={p.id} className="hover:bg-dark-50 transition-colors">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-semibold flex-shrink-0"
                              style={{ backgroundColor: p.color }}>
                              {p.avatar}
                            </div>
                            <span className="text-sm font-medium text-dark-900">{p.name.split(' ')[0]}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-sm text-dark-700">${prod.toLocaleString('es-CL')}</td>
                        <td className="px-5 py-3.5">
                          <span className="text-sm font-medium text-dark-900">{pct}%</span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="text-sm font-semibold text-brand-600">${com.toLocaleString('es-CL')}</span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="text-sm text-dark-600">${salon.toLocaleString('es-CL')}</span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
                <tfoot className="bg-dark-50 border-t border-dark-200">
                  <tr>
                    <td className="px-5 py-3 text-xs font-semibold text-dark-600 uppercase tracking-wide" colSpan={1}>Total</td>
                    <td className="px-5 py-3 text-sm font-bold text-dark-900">
                      ${MOCK_PELUQUEROS.reduce((s, p) => s + (dataByP[p.id] || []).reduce((ss, d) => ss + d.amount, 0), 0).toLocaleString('es-CL')}
                    </td>
                    <td/>
                    <td className="px-5 py-3 text-sm font-bold text-brand-600">
                      ${MOCK_PELUQUEROS.reduce((s, p) => {
                        const prod = (dataByP[p.id] || []).reduce((ss, d) => ss + d.amount, 0)
                        return s + Math.round(prod * (commissions[p.id] || 0) / 100)
                      }, 0).toLocaleString('es-CL')}
                    </td>
                    <td className="px-5 py-3 text-sm font-bold text-dark-700">
                      ${MOCK_PELUQUEROS.reduce((s, p) => {
                        const prod = (dataByP[p.id] || []).reduce((ss, d) => ss + d.amount, 0)
                        const com  = Math.round(prod * (commissions[p.id] || 0) / 100)
                        return s + (prod - com)
                      }, 0).toLocaleString('es-CL')}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
