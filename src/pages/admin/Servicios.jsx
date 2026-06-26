import { useState, useMemo } from 'react'
import {
  Plus, Edit2, Eye, EyeOff, Clock, DollarSign,
  Scissors, Search, X, Filter, ChevronDown, Save,
  ToggleLeft, ToggleRight, Tag
} from 'lucide-react'
import { MOCK_SERVICES } from '../../lib/mockData'
import Modal from '../../components/ui/Modal'
import { CategoryBadge } from '../../components/ui/Badge'
import { useAuth } from '../../context/AuthContext'

const CATEGORIES = ['Corte', 'Color', 'Tratamientos', 'Otros']

const CATEGORY_ICONS = {
  Corte:        '✂️',
  Color:        '🎨',
  Tratamientos: '✨',
  Otros:        '💅',
}

// ── Service Form ──────────────────────────────────────────────────────────────
function ServiceForm({ initial = {}, onSave, onClose }) {
  const [form, setForm] = useState({
    name:        initial.name        || '',
    description: initial.description || '',
    category:    initial.category    || 'Corte',
    price:       initial.price       || '',
    duration:    initial.duration    || 30,
    active:      initial.active      ?? true,
  })
  const f = k => v => setForm(p => ({ ...p, [k]: v }))
  const valid = form.name && form.price && form.duration

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-dark-500 mb-1.5 uppercase tracking-wider">Nombre del servicio *</label>
        <input className="input" placeholder="Ej: Balayage completo" value={form.name} onChange={e => f('name')(e.target.value)} />
      </div>

      <div>
        <label className="block text-xs font-medium text-dark-500 mb-1.5 uppercase tracking-wider">Descripción</label>
        <textarea className="input resize-none h-20" placeholder="Describe brevemente el servicio…"
          value={form.description} onChange={e => f('description')(e.target.value)} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-dark-500 mb-1.5 uppercase tracking-wider">Categoría *</label>
          <select className="input" value={form.category} onChange={e => f('category')(e.target.value)}>
            {CATEGORIES.map(c => <option key={c} value={c}>{CATEGORY_ICONS[c]} {c}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-dark-500 mb-1.5 uppercase tracking-wider">Duración (min) *</label>
          <select className="input" value={form.duration} onChange={e => f('duration')(Number(e.target.value))}>
            {[15,20,30,45,60,75,90,120,150,180,210,240].map(m => (
              <option key={m} value={m}>{m >= 60 ? `${Math.floor(m/60)}h ${m%60 ? m%60+'min' : ''}`.trim() : `${m} min`}</option>
            ))}
          </select>
        </div>
        <div className="col-span-2">
          <label className="block text-xs font-medium text-dark-500 mb-1.5 uppercase tracking-wider">Precio (CLP) *</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400 text-sm">$</span>
            <input type="number" className="input pl-7" placeholder="15000"
              value={form.price} onChange={e => f('price')(Number(e.target.value))} />
          </div>
          {form.price > 0 && (
            <p className="text-xs text-dark-400 mt-1">
              = ${Number(form.price).toLocaleString('es-CL')} · Genera ~{Math.floor(form.price * 0.001)} puntos loyalty
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between p-3 bg-dark-50 rounded-xl">
        <div>
          <p className="text-sm font-medium text-dark-900">Servicio activo</p>
          <p className="text-xs text-dark-500">Visible en el agendamiento público</p>
        </div>
        <button onClick={() => f('active')(!form.active)} className="transition-colors">
          {form.active
            ? <ToggleRight size={28} className="text-brand-500" />
            : <ToggleLeft  size={28} className="text-dark-300" />
          }
        </button>
      </div>

      <div className="flex gap-2 pt-1">
        <button className="btn-secondary flex-1" onClick={onClose}>Cancelar</button>
        <button className="btn-primary flex-1" disabled={!valid} onClick={() => onSave(form)}>
          {initial.id ? 'Guardar cambios' : 'Crear servicio'}
        </button>
      </div>
    </div>
  )
}

// ── Service Card ──────────────────────────────────────────────────────────────
function ServiceCard({ service, onEdit, onToggle, isAdmin }) {
  const durationLabel = service.duration >= 60
    ? `${Math.floor(service.duration/60)}h${service.duration%60 ? ` ${service.duration%60}min` : ''}`
    : `${service.duration} min`

  return (
    <div className={`card p-5 transition-all hover:shadow-card-hover ${!service.active ? 'opacity-50' : ''}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <span className="text-xl">{CATEGORY_ICONS[service.category]}</span>
          <div>
            <h3 className="font-medium text-dark-900 text-sm leading-tight">{service.name}</h3>
            <CategoryBadge category={service.category} />
          </div>
        </div>
        {isAdmin && (
          <div className="flex gap-1.5 ml-2">
            <button onClick={() => onEdit(service)} className="p-1.5 rounded-lg hover:bg-dark-50 transition-colors">
              <Edit2 size={13} className="text-dark-400" />
            </button>
            <button onClick={() => onToggle(service.id)} className="p-1.5 rounded-lg hover:bg-dark-50 transition-colors">
              {service.active
                ? <Eye    size={13} className="text-dark-400" />
                : <EyeOff size={13} className="text-dark-300" />
              }
            </button>
          </div>
        )}
      </div>

      {service.description && (
        <p className="text-xs text-dark-500 mb-3 leading-relaxed line-clamp-2">{service.description}</p>
      )}

      <div className="flex items-center justify-between pt-3 border-t border-dark-100">
        <div className="flex items-center gap-1 text-xs text-dark-500">
          <Clock size={12} />
          <span>{durationLabel}</span>
        </div>
        <p className="font-semibold text-dark-900">${service.price.toLocaleString('es-CL')}</p>
      </div>

      {!service.active && (
        <div className="mt-2 text-[10px] text-dark-400 text-center">Desactivado</div>
      )}
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function Servicios() {
  const { isAdmin } = useAuth()

  const [services, setServices] = useState(
    MOCK_SERVICES.map(s => ({ ...s, description: s.description || '', active: true }))
  )
  const [search,    setSearch]   = useState('')
  const [catFilter, setCatFilter] = useState('Todos')
  const [showInactive, setShowInactive] = useState(false)
  const [modal,     setModal]    = useState(null)  // null | 'new' | service
  const [view,      setView]     = useState('grid') // 'grid' | 'list'

  const filtered = useMemo(() => {
    return services.filter(s => {
      if (!showInactive && !s.active) return false
      if (catFilter !== 'Todos' && s.category !== catFilter) return false
      if (search) {
        const q = search.toLowerCase()
        return s.name.toLowerCase().includes(q) || s.description?.toLowerCase().includes(q)
      }
      return true
    })
  }, [services, search, catFilter, showInactive])

  // Stats
  const stats = useMemo(() => ({
    total:    services.filter(s => s.active).length,
    avgPrice: Math.round(services.filter(s=>s.active).reduce((s,v) => s + v.price, 0) / services.filter(s=>s.active).length),
    avgDuration: Math.round(services.filter(s=>s.active).reduce((s,v) => s + v.duration, 0) / services.filter(s=>s.active).length),
  }), [services])

  function handleSave(form) {
    if (modal?.id) {
      setServices(prev => prev.map(s => s.id === modal.id ? { ...s, ...form } : s))
    } else {
      setServices(prev => [...prev, { id: 's' + Date.now(), ...form }])
    }
    setModal(null)
  }

  function handleToggle(id) {
    setServices(prev => prev.map(s => s.id === id ? { ...s, active: !s.active } : s))
  }

  const byCategory = CATEGORIES.reduce((acc, cat) => {
    acc[cat] = filtered.filter(s => s.category === cat)
    return acc
  }, {})

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Header */}
      <header className="flex items-center gap-4 px-6 py-4 bg-white border-b border-dark-100 flex-shrink-0 flex-wrap gap-y-3">
        <h1 className="font-serif text-xl text-dark-900">Servicios</h1>

        {/* Stats */}
        <div className="flex gap-4 ml-2">
          {[
            { label: 'activos',       value: stats.total },
            { label: 'precio prom.',  value: `$${Math.round(stats.avgPrice/1000)}k` },
            { label: 'duración prom.',value: `${stats.avgDuration} min` },
          ].map(({ label, value }) => (
            <div key={label} className="text-center">
              <p className="text-sm font-semibold text-dark-900">{value}</p>
              <p className="text-[10px] text-dark-400 uppercase tracking-wide">{label}</p>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 ml-auto flex-wrap">
          {/* Search */}
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" />
            <input className="input pl-9 w-44 text-xs" placeholder="Buscar servicio…"
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>

          {/* Category filter */}
          <select className="input w-36 text-xs" value={catFilter} onChange={e => setCatFilter(e.target.value)}>
            <option value="Todos">Todas las categorías</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          {/* Show inactive */}
          {isAdmin && (
            <label className="flex items-center gap-1.5 text-xs text-dark-500 cursor-pointer select-none">
              <input type="checkbox" className="rounded" checked={showInactive} onChange={e => setShowInactive(e.target.checked)} />
              Ver inactivos
            </label>
          )}

          {/* View toggle */}
          <div className="flex border border-dark-200 rounded-lg overflow-hidden">
            {[['grid','▦'],['list','☰']].map(([v,icon]) => (
              <button key={v} onClick={() => setView(v)}
                className={`px-3 py-1.5 text-sm transition-colors ${view===v ? 'bg-dark-900 text-white' : 'text-dark-500 hover:bg-dark-50'}`}>
                {icon}
              </button>
            ))}
          </div>

          {isAdmin && (
            <button onClick={() => setModal('new')} className="btn-primary text-xs flex items-center gap-1.5">
              <Plus size={13} /> Nuevo servicio
            </button>
          )}
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {view === 'grid' ? (
          /* Grid view — grouped by category */
          <div className="space-y-8 max-w-5xl">
            {CATEGORIES.map(cat => {
              const catServices = byCategory[cat]
              if (!catServices?.length) return null
              return (
                <div key={cat}>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-lg">{CATEGORY_ICONS[cat]}</span>
                    <h2 className="font-medium text-dark-700 text-sm">{cat}</h2>
                    <span className="text-xs text-dark-400 bg-dark-100 px-2 py-0.5 rounded-full">
                      {catServices.length}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {catServices.map(s => (
                      <ServiceCard key={s.id} service={s} onEdit={setModal} onToggle={handleToggle} isAdmin={isAdmin} />
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          /* List view */
          <div className="card overflow-hidden max-w-5xl">
            <table className="w-full">
              <thead>
                <tr className="border-b border-dark-100 bg-dark-50">
                  {['Servicio','Categoría','Duración','Precio','Estado',''].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-[10px] font-semibold text-dark-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-50">
                {filtered.map(s => {
                  const dur = s.duration >= 60
                    ? `${Math.floor(s.duration/60)}h${s.duration%60?` ${s.duration%60}m`:''}`
                    : `${s.duration} min`
                  return (
                    <tr key={s.id} className={`hover:bg-dark-50 transition-colors ${!s.active ? 'opacity-50' : ''}`}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span>{CATEGORY_ICONS[s.category]}</span>
                          <div>
                            <p className="text-sm font-medium text-dark-900">{s.name}</p>
                            {s.description && <p className="text-xs text-dark-400 truncate max-w-[200px]">{s.description}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3"><CategoryBadge category={s.category} /></td>
                      <td className="px-4 py-3 text-sm text-dark-600">{dur}</td>
                      <td className="px-4 py-3 text-sm font-semibold text-dark-900">${s.price.toLocaleString('es-CL')}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          s.active ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-dark-100 text-dark-500'
                        }`}>
                          {s.active ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {isAdmin && (
                          <div className="flex gap-1.5">
                            <button onClick={() => setModal(s)} className="p-1.5 rounded-lg hover:bg-dark-100 transition-colors">
                              <Edit2 size={13} className="text-dark-400" />
                            </button>
                            <button onClick={() => handleToggle(s.id)} className="p-1.5 rounded-lg hover:bg-dark-100 transition-colors">
                              {s.active ? <EyeOff size={13} className="text-dark-400" /> : <Eye size={13} className="text-dark-400" />}
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      <Modal open={!!modal} onClose={() => setModal(null)}
        title={modal === 'new' ? 'Nuevo servicio' : 'Editar servicio'} size="md">
        <ServiceForm initial={modal === 'new' ? {} : modal || {}} onSave={handleSave} onClose={() => setModal(null)} />
      </Modal>
    </div>
  )
}
