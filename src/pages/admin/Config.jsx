import { useState } from 'react'
import {
  Clock, Users, Store, Plus, Edit2, Trash2, Save,
  Check, X, AlertCircle, Palette, Phone, MapPin,
  Instagram, Globe, ChevronRight, Power
} from 'lucide-react'
import { MOCK_PELUQUEROS, BUSINESS_HOURS } from '../../lib/mockData'
import Modal from '../../components/ui/Modal'
import { useAuth } from '../../context/AuthContext'

// ── Constants ────────────────────────────────────────────────────────────────
const DAYS = [
  { key: 1, label: 'Lunes' },
  { key: 2, label: 'Martes' },
  { key: 3, label: 'Miércoles' },
  { key: 4, label: 'Jueves' },
  { key: 5, label: 'Viernes' },
  { key: 6, label: 'Sábado' },
  { key: 0, label: 'Domingo' },
]

const AVATAR_COLORS = [
  '#C8B89A','#A89880','#8A7A66','#B5A89A',
  '#6B8F71','#7B9EC0','#C07B8F','#9B7BC0',
]

const TIMES = Array.from({ length: 24 * 2 }, (_, i) => {
  const h = Math.floor(i / 2).toString().padStart(2, '0')
  const m = i % 2 === 0 ? '00' : '30'
  return `${h}:${m}`
})

// ── SaveBanner ────────────────────────────────────────────────────────────────
function SaveBanner({ onSave, onDiscard }) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4
      bg-dark-900 text-white px-6 py-3.5 rounded-2xl shadow-2xl border border-white/10">
      <AlertCircle size={16} className="text-brand-400 flex-shrink-0"/>
      <span className="text-sm">Tienes cambios sin guardar</span>
      <div className="flex gap-2 ml-2">
        <button onClick={onDiscard}
          className="px-3 py-1.5 text-xs rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
          Descartar
        </button>
        <button onClick={onSave}
          className="px-4 py-1.5 text-xs rounded-lg bg-brand-400 hover:bg-brand-500 transition-colors font-medium flex items-center gap-1.5">
          <Save size={12}/> Guardar
        </button>
      </div>
    </div>
  )
}

// ── Tab: Horarios ─────────────────────────────────────────────────────────────
function HorariosTab() {
  const [hours,   setHours]   = useState(BUSINESS_HOURS)
  const [dirty,   setDirty]   = useState(false)
  const [saved,   setSaved]   = useState(false)

  function toggleDay(key) {
    setHours(prev => ({
      ...prev,
      [key]: prev[key] ? null : { open: '09:00', close: '19:00' }
    }))
    setDirty(true)
    setSaved(false)
  }

  function updateTime(key, field, val) {
    setHours(prev => ({ ...prev, [key]: { ...prev[key], [field]: val } }))
    setDirty(true)
    setSaved(false)
  }

  function save() {
    setDirty(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  function discard() {
    setHours(BUSINESS_HOURS)
    setDirty(false)
  }

  return (
    <div className="space-y-3 max-w-xl">
      <p className="text-sm text-dark-500 mb-5">
        Define los horarios de atención por día. Los días cerrados no aparecerán disponibles en el sistema de agendamiento.
      </p>

      {DAYS.map(({ key, label }) => {
        const h = hours[key]
        const open = !!h
        return (
          <div key={key}
            className={`rounded-xl border transition-all ${
              open ? 'border-dark-200 bg-white' : 'border-dark-100 bg-dark-50'
            }`}>
            <div className="flex items-center gap-4 px-5 py-4">
              {/* Toggle */}
              <button onClick={() => toggleDay(key)}
                className={`relative inline-flex h-5 w-9 flex-shrink-0 rounded-full transition-colors duration-200 focus:outline-none ${
                  open ? 'bg-dark-900' : 'bg-dark-200'
                }`}>
                <span className={`inline-block h-4 w-4 mt-0.5 rounded-full bg-white shadow transition-transform duration-200 ${
                  open ? 'translate-x-4' : 'translate-x-0.5'
                }`}/>
              </button>

              {/* Day */}
              <span className={`w-24 text-sm font-medium ${open ? 'text-dark-900' : 'text-dark-400'}`}>
                {label}
              </span>

              {/* Hours */}
              {open ? (
                <div className="flex items-center gap-2 ml-auto">
                  <select value={h.open} onChange={e => updateTime(key, 'open', e.target.value)}
                    className="input !w-24 text-sm text-center py-1.5">
                    {TIMES.map(t => <option key={t}>{t}</option>)}
                  </select>
                  <span className="text-dark-400 text-sm">→</span>
                  <select value={h.close} onChange={e => updateTime(key, 'close', e.target.value)}
                    className="input !w-24 text-sm text-center py-1.5">
                    {TIMES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
              ) : (
                <span className="ml-auto text-xs text-dark-400 italic">Cerrado</span>
              )}
            </div>
          </div>
        )
      })}

      {/* Save inline */}
      <div className="flex items-center justify-between pt-3">
        {saved && (
          <span className="text-sm text-green-600 flex items-center gap-1.5">
            <Check size={14}/> Horarios guardados
          </span>
        )}
        <div className={`flex gap-2 ${saved ? '' : 'ml-auto'}`}>
          {dirty && (
            <button onClick={discard} className="btn-secondary text-sm">Descartar</button>
          )}
          <button onClick={save} disabled={!dirty}
            className={`btn-primary text-sm flex items-center gap-1.5 ${!dirty ? 'opacity-40 cursor-not-allowed' : ''}`}>
            <Save size={14}/> Guardar horarios
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Peluquero Form ────────────────────────────────────────────────────────────
function PeluqueroForm({ initial = {}, onSave, onClose }) {
  const [name,  setName]  = useState(initial.name  || '')
  const [color, setColor] = useState(initial.color || AVATAR_COLORS[0])
  const [role,  setRole]  = useState(initial.role  || 'peluquero')
  const [email, setEmail] = useState(initial.email || '')
  const [phone, setPhone] = useState(initial.phone || '')
  const initials = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?'

  return (
    <div className="space-y-5">
      {/* Preview */}
      <div className="flex items-center gap-4 p-4 bg-dark-50 rounded-xl">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-lg font-semibold shadow-inner flex-shrink-0"
          style={{ backgroundColor: color }}>
          {initials}
        </div>
        <div>
          <p className="font-medium text-dark-900">{name || 'Nombre del peluquero'}</p>
          <p className="text-xs text-dark-500 capitalize">{role}</p>
        </div>
      </div>

      <div>
        <label className="label-xs">Nombre completo *</label>
        <input className="input" placeholder="Ej: Ely Cortamelpelo"
          value={name} onChange={e => setName(e.target.value)} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label-xs">Rol</label>
          <select className="input" value={role} onChange={e => setRole(e.target.value)}>
            <option value="peluquero">Peluquero/a</option>
            <option value="recepcionista">Recepcionista</option>
            <option value="admin">Administrador</option>
          </select>
        </div>
        <div>
          <label className="label-xs">Teléfono</label>
          <input className="input" placeholder="+56 9 ..." value={phone} onChange={e => setPhone(e.target.value)} />
        </div>
      </div>

      <div>
        <label className="label-xs">Email</label>
        <input type="email" className="input" placeholder="nombre@lapelukeria.cl"
          value={email} onChange={e => setEmail(e.target.value)} />
      </div>

      {/* Color picker */}
      <div>
        <label className="label-xs mb-2">Color en agenda</label>
        <div className="flex gap-2 flex-wrap mt-1.5">
          {AVATAR_COLORS.map(c => (
            <button key={c} onClick={() => setColor(c)}
              className={`w-8 h-8 rounded-xl transition-all ${color === c ? 'ring-2 ring-offset-2 ring-dark-900 scale-110' : 'hover:scale-105'}`}
              style={{ backgroundColor: c }} />
          ))}
        </div>
      </div>

      <div className="flex gap-2 pt-1">
        <button className="btn-secondary flex-1" onClick={onClose}>Cancelar</button>
        <button className="btn-primary flex-1" disabled={!name}
          onClick={() => onSave({ name, color, role, email, phone, avatar: initials })}>
          {initial.id ? 'Guardar cambios' : 'Agregar peluquero'}
        </button>
      </div>
    </div>
  )
}

// ── Tab: Peluqueros ───────────────────────────────────────────────────────────
function PeluquerosTab() {
  const [staff,    setStaff]    = useState(
    MOCK_PELUQUEROS.map(p => ({ ...p, role: 'peluquero', active: true }))
  )
  const [modal,    setModal]    = useState(null)  // null | 'new' | 'edit'
  const [selected, setSelected] = useState(null)
  const [saved,    setSaved]    = useState(false)

  function handleSave(form) {
    if (modal === 'edit') {
      setStaff(prev => prev.map(p => p.id === selected.id ? { ...p, ...form } : p))
    } else {
      setStaff(prev => [...prev, { id: 'p' + Date.now(), ...form, active: true }])
    }
    setModal(null)
    setSelected(null)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function toggleActive(id) {
    setStaff(prev => prev.map(p => p.id === id ? { ...p, active: !p.active } : p))
  }

  function remove(id) {
    if (confirm('¿Eliminar este peluquero? Esta acción no se puede deshacer.')) {
      setStaff(prev => prev.filter(p => p.id !== id))
    }
  }

  return (
    <div className="space-y-4 max-w-2xl">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm text-dark-500">
          {staff.filter(p => p.active).length} activo{staff.filter(p => p.active).length !== 1 ? 's' : ''} de {staff.length}
        </p>
        <div className="flex items-center gap-3">
          {saved && (
            <span className="text-sm text-green-600 flex items-center gap-1.5">
              <Check size={13}/> Guardado
            </span>
          )}
          <button onClick={() => setModal('new')} className="btn-primary text-sm flex items-center gap-1.5">
            <Plus size={14}/> Agregar peluquero
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {staff.map(p => {
          const initials = p.avatar || p.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
          return (
            <div key={p.id}
              className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                p.active ? 'bg-white border-dark-200' : 'bg-dark-50 border-dark-100 opacity-60'
              }`}>
              <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white text-sm font-semibold flex-shrink-0"
                style={{ backgroundColor: p.color }}>
                {initials}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-dark-900">{p.name}</p>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="text-xs text-dark-400 capitalize">{p.role || 'peluquero'}</span>
                  {p.email && <span className="text-xs text-dark-400">· {p.email}</span>}
                </div>
              </div>

              <div className="flex items-center gap-1.5 flex-shrink-0">
                {/* Active toggle */}
                <button onClick={() => toggleActive(p.id)} title={p.active ? 'Desactivar' : 'Activar'}
                  className={`p-1.5 rounded-lg transition-colors ${
                    p.active
                      ? 'text-green-600 hover:bg-green-50'
                      : 'text-dark-300 hover:bg-dark-100'
                  }`}>
                  <Power size={14}/>
                </button>

                <button onClick={() => { setSelected(p); setModal('edit') }}
                  className="p-1.5 rounded-lg hover:bg-dark-100 text-dark-400 transition-colors">
                  <Edit2 size={14}/>
                </button>

                <button onClick={() => remove(p.id)}
                  className="p-1.5 rounded-lg hover:bg-red-50 text-dark-300 hover:text-red-500 transition-colors">
                  <Trash2 size={14}/>
                </button>
              </div>
            </div>
          )
        })}
      </div>

      <Modal open={modal === 'new'} onClose={() => setModal(null)} title="Agregar peluquero" size="md">
        <PeluqueroForm onSave={handleSave} onClose={() => setModal(null)} />
      </Modal>

      <Modal open={modal === 'edit'} onClose={() => { setModal(null); setSelected(null) }} title="Editar peluquero" size="md">
        <PeluqueroForm initial={selected || {}} onSave={handleSave} onClose={() => { setModal(null); setSelected(null) }} />
      </Modal>
    </div>
  )
}

// ── Tab: Negocio ──────────────────────────────────────────────────────────────
function NegocioTab() {
  const [form, setForm] = useState({
    name:      'La Pelukeria',
    tagline:   'Salón de belleza moderno en Puerto Varas',
    address:   'Puerto Varas, Los Lagos, Chile',
    phone:     '+56 9 XXXX XXXX',
    email:     'hola@lapelukeria.cl',
    instagram: '@lapelukeria_pv',
    website:   'www.lapelukeria.cl',
    currency:  'CLP',
    timezone:  'America/Santiago',
  })
  const [dirty,  setDirty]  = useState(false)
  const [saved,  setSaved]  = useState(false)

  const f = k => v => { setForm(p => ({ ...p, [k]: v })); setDirty(true); setSaved(false) }

  function save() { setDirty(false); setSaved(true); setTimeout(() => setSaved(false), 2500) }
  function discard() { setDirty(false) }

  return (
    <div className="space-y-6 max-w-xl">
      <p className="text-sm text-dark-500">
        Información general del salón visible en el sistema y en comunicaciones con clientes.
      </p>

      {/* Identity */}
      <section>
        <h3 className="text-xs font-semibold text-dark-500 uppercase tracking-wider mb-3 flex items-center gap-2">
          <Store size={13}/> Identidad
        </h3>
        <div className="space-y-3">
          <div>
            <label className="label-xs">Nombre del salón</label>
            <input className="input" value={form.name} onChange={e => f('name')(e.target.value)} />
          </div>
          <div>
            <label className="label-xs">Slogan / descripción corta</label>
            <input className="input" placeholder="Ej: Salón de belleza en Puerto Varas"
              value={form.tagline} onChange={e => f('tagline')(e.target.value)} />
          </div>
        </div>
      </section>

      {/* Contact */}
      <section>
        <h3 className="text-xs font-semibold text-dark-500 uppercase tracking-wider mb-3 flex items-center gap-2">
          <Phone size={13}/> Contacto
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label-xs">Teléfono</label>
            <input className="input" value={form.phone} onChange={e => f('phone')(e.target.value)} />
          </div>
          <div>
            <label className="label-xs">Email de contacto</label>
            <input type="email" className="input" value={form.email} onChange={e => f('email')(e.target.value)} />
          </div>
          <div className="col-span-2">
            <label className="label-xs">Dirección</label>
            <input className="input" value={form.address} onChange={e => f('address')(e.target.value)} />
          </div>
        </div>
      </section>

      {/* Social */}
      <section>
        <h3 className="text-xs font-semibold text-dark-500 uppercase tracking-wider mb-3 flex items-center gap-2">
          <Instagram size={13}/> Redes sociales
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label-xs">Instagram</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400 text-sm">@</span>
              <input className="input pl-7" placeholder="lapelukeria_pv"
                value={form.instagram.replace('@', '')}
                onChange={e => f('instagram')('@' + e.target.value)} />
            </div>
          </div>
          <div>
            <label className="label-xs">Sitio web</label>
            <input className="input" placeholder="www.lapelukeria.cl"
              value={form.website} onChange={e => f('website')(e.target.value)} />
          </div>
        </div>
      </section>

      {/* System */}
      <section>
        <h3 className="text-xs font-semibold text-dark-500 uppercase tracking-wider mb-3 flex items-center gap-2">
          <Globe size={13}/> Sistema
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label-xs">Moneda</label>
            <select className="input" value={form.currency} onChange={e => f('currency')(e.target.value)}>
              <option value="CLP">CLP — Peso chileno</option>
              <option value="USD">USD — Dólar</option>
            </select>
          </div>
          <div>
            <label className="label-xs">Zona horaria</label>
            <select className="input" value={form.timezone} onChange={e => f('timezone')(e.target.value)}>
              <option value="America/Santiago">America/Santiago (Chile)</option>
              <option value="America/Bogota">America/Bogota</option>
              <option value="America/Buenos_Aires">America/Buenos_Aires</option>
            </select>
          </div>
        </div>
      </section>

      <div className="flex items-center justify-between pt-2 border-t border-dark-100">
        {saved && (
          <span className="text-sm text-green-600 flex items-center gap-1.5">
            <Check size={14}/> Cambios guardados
          </span>
        )}
        <div className={`flex gap-2 ${saved ? '' : 'ml-auto'}`}>
          {dirty && (
            <button onClick={discard} className="btn-secondary text-sm">Descartar</button>
          )}
          <button onClick={save} disabled={!dirty}
            className={`btn-primary text-sm flex items-center gap-1.5 ${!dirty ? 'opacity-40 cursor-not-allowed' : ''}`}>
            <Save size={14}/> Guardar cambios
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
const TABS = [
  { id: 'horarios',   label: 'Horarios',   icon: Clock,  Component: HorariosTab   },
  { id: 'peluqueros', label: 'Equipo',     icon: Users,  Component: PeluquerosTab },
  { id: 'negocio',    label: 'Negocio',    icon: Store,  Component: NegocioTab    },
]

export default function Config() {
  const { isAdmin } = useAuth()
  const [activeTab, setActiveTab] = useState('horarios')

  const Active = TABS.find(t => t.id === activeTab)?.Component || HorariosTab

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-dark-400 gap-3">
        <AlertCircle size={36} className="opacity-30"/>
        <p className="text-sm">Solo el administrador puede acceder a la configuración.</p>
      </div>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="w-56 border-r border-dark-100 bg-dark-50/50 flex-shrink-0 flex flex-col py-4">
        <div className="px-5 mb-6">
          <h1 className="font-serif text-lg text-dark-900">Configuración</h1>
          <p className="text-xs text-dark-400 mt-0.5">Ajustes del salón</p>
        </div>

        <nav className="flex-1 px-3 space-y-1">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setActiveTab(id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                activeTab === id
                  ? 'bg-dark-900 text-white font-medium'
                  : 'text-dark-500 hover:bg-dark-100 hover:text-dark-900'
              }`}>
              <Icon size={15}/>
              {label}
              {activeTab !== id && <ChevronRight size={12} className="ml-auto opacity-30"/>}
            </button>
          ))}
        </nav>

        {/* Version badge */}
        <div className="px-5 pt-4 border-t border-dark-100 mt-4">
          <p className="text-[10px] text-dark-300 uppercase tracking-wider">La Pelukeria PV</p>
          <p className="text-[10px] text-dark-300 mt-0.5">v1.0.0 — 2026</p>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Tab header */}
        <div className="sticky top-0 z-10 bg-white border-b border-dark-100 px-8 py-4">
          {(() => {
            const tab = TABS.find(t => t.id === activeTab)
            const Icon = tab?.icon
            return (
              <div className="flex items-center gap-3">
                {Icon && <Icon size={18} className="text-dark-400"/>}
                <h2 className="font-medium text-dark-900">{tab?.label}</h2>
              </div>
            )
          })()}
        </div>

        <div className="px-8 py-6">
          <Active />
        </div>
      </main>
    </div>
  )
}
