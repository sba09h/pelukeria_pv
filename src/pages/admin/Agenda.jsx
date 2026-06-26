import { useState, useMemo } from 'react'
import {
  ChevronLeft, ChevronRight, Plus, Filter,
  Clock, User, Scissors, Phone, X, Check,
  AlertCircle, Ban, LayoutGrid, List
} from 'lucide-react'
import {
  format, startOfWeek, addDays, addWeeks, subWeeks,
  isSameDay, parseISO, isToday
} from 'date-fns'
import { es } from 'date-fns/locale'
import {
  MOCK_APPOINTMENTS, MOCK_PELUQUEROS, MOCK_SERVICES, MOCK_BLOCKED_SLOTS, BUSINESS_HOURS
} from '../../lib/mockData'
import { StatusBadge } from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'
import { useAuth } from '../../context/AuthContext'

// ── Helpers ──────────────────────────────────────────────────────────────────
const HOUR_START = 9
const HOUR_END   = 19
const HOURS      = Array.from({ length: HOUR_END - HOUR_START }, (_, i) => HOUR_START + i)

const STATUS_ACTIONS = {
  pendiente:   ['confirmada', 'cancelada'],
  confirmada:  ['en_atencion', 'cancelada'],
  en_atencion: ['completada', 'cancelada'],
  completada:  [],
  cancelada:   [],
}

const STATUS_COLORS = {
  pendiente:   'bg-amber-100  border-amber-300  text-amber-800',
  confirmada:  'bg-blue-100   border-blue-300   text-blue-800',
  en_atencion: 'bg-purple-100 border-purple-300 text-purple-800',
  completada:  'bg-green-100  border-green-300  text-green-800',
  cancelada:   'bg-red-50     border-red-200    text-red-700 opacity-60',
}

function minutesToPx(minutes) { return (minutes / 60) * 56 }
function apptTop(appt)        { return minutesToPx((appt.hour - HOUR_START) * 60 + appt.minute) }
function apptHeight(appt)     { return Math.max(minutesToPx(appt.service?.duration || 30), 28) }

// ── New Appointment Form ──────────────────────────────────────────────────────
function ApptForm({ initial = {}, onSave, onClose }) {
  const [form, setForm] = useState({
    client_name:   initial.client_name  || '',
    client_phone:  initial.client_phone || '',
    service_id:    initial.service_id   || '',
    peluquero_id:  initial.peluquero_id || '',
    date:          initial.date         || format(new Date(), 'yyyy-MM-dd'),
    hour:          initial.hour         || 10,
    minute:        initial.minute       || 0,
    notes:         initial.notes        || '',
    status:        initial.status       || 'pendiente',
  })
  const f = (k) => (v) => setForm(p => ({ ...p, [k]: v }))

  const service = MOCK_SERVICES.find(s => s.id === form.service_id)

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="block text-xs font-medium text-dark-600 mb-1">Cliente</label>
          <input className="input" placeholder="Nombre completo" value={form.client_name} onChange={e => f('client_name')(e.target.value)} />
        </div>
        <div className="col-span-2">
          <label className="block text-xs font-medium text-dark-600 mb-1">Teléfono</label>
          <input className="input" placeholder="+56 9 XXXX XXXX" value={form.client_phone} onChange={e => f('client_phone')(e.target.value)} />
        </div>
        <div className="col-span-2">
          <label className="block text-xs font-medium text-dark-600 mb-1">Servicio</label>
          <select className="input" value={form.service_id} onChange={e => f('service_id')(e.target.value)}>
            <option value="">Seleccionar…</option>
            {MOCK_SERVICES.map(s => (
              <option key={s.id} value={s.id}>{s.name} — {(s.price/1000).toFixed(0)}k · {s.duration} min</option>
            ))}
          </select>
        </div>
        <div className="col-span-2">
          <label className="block text-xs font-medium text-dark-600 mb-1">Peluquero/a</label>
          <select className="input" value={form.peluquero_id} onChange={e => f('peluquero_id')(e.target.value)}>
            <option value="">Sin asignar</option>
            {MOCK_PELUQUEROS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-dark-600 mb-1">Fecha</label>
          <input type="date" className="input" value={form.date} onChange={e => f('date')(e.target.value)} />
        </div>
        <div>
          <label className="block text-xs font-medium text-dark-600 mb-1">Hora</label>
          <select className="input" value={`${form.hour}:${form.minute}`}
            onChange={e => {
              const [h, m] = e.target.value.split(':').map(Number)
              setForm(p => ({ ...p, hour: h, minute: m }))
            }}>
            {HOURS.flatMap(h => [0, 30].map(m => (
              <option key={`${h}:${m}`} value={`${h}:${m}`}>
                {String(h).padStart(2,'0')}:{String(m).padStart(2,'0')}
              </option>
            )))}
          </select>
        </div>
        <div className="col-span-2">
          <label className="block text-xs font-medium text-dark-600 mb-1">Notas internas</label>
          <textarea className="input resize-none h-20" placeholder="Observaciones…" value={form.notes} onChange={e => f('notes')(e.target.value)} />
        </div>
      </div>

      {service && (
        <div className="flex items-center gap-3 p-3 bg-dark-50 rounded-xl text-xs text-dark-600">
          <Clock size={13} />
          <span>Duración: <strong>{service.duration} min</strong></span>
          <span className="ml-auto font-semibold">${service.price.toLocaleString('es-CL')}</span>
        </div>
      )}

      <div className="flex gap-2 pt-1">
        <button className="btn-secondary flex-1" onClick={onClose}>Cancelar</button>
        <button className="btn-primary flex-1" onClick={() => onSave(form)} disabled={!form.client_name || !form.service_id}>
          {initial.id ? 'Guardar cambios' : 'Crear cita'}
        </button>
      </div>
    </div>
  )
}

// ── Appointment Card Detail ───────────────────────────────────────────────────
function ApptDetail({ appt, onClose, onStatusChange }) {
  const actions = STATUS_ACTIONS[appt.status] || []

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3 p-4 bg-dark-50 rounded-xl">
        <div className="w-9 h-9 rounded-full bg-brand-400 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
          {appt.client_name.charAt(0)}
        </div>
        <div>
          <p className="font-medium text-dark-900">{appt.client_name}</p>
          <p className="text-sm text-dark-500 flex items-center gap-1 mt-0.5"><Phone size={12} />{appt.client_phone}</p>
        </div>
        <div className="ml-auto"><StatusBadge status={appt.status} /></div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <InfoRow icon={<Scissors size={14}/>} label="Servicio" value={appt.service?.name} />
        <InfoRow icon={<Clock size={14}/>}    label="Duración"  value={`${appt.service?.duration} min`} />
        <InfoRow icon={<User size={14}/>}     label="Peluquero/a" value={appt.peluquero?.name || '—'} />
        <InfoRow icon={<Clock size={14}/>}    label="Hora" value={`${String(appt.hour).padStart(2,'0')}:${String(appt.minute).padStart(2,'0')}`} />
      </div>

      <div className="p-3 bg-dark-50 rounded-xl flex items-center justify-between text-sm">
        <span className="text-dark-500">Precio estimado</span>
        <span className="font-semibold">${appt.service?.price?.toLocaleString('es-CL')}</span>
      </div>

      {appt.notes && (
        <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl text-xs text-amber-800">
          <strong>Notas:</strong> {appt.notes}
        </div>
      )}

      {actions.length > 0 && (
        <div>
          <p className="text-xs font-medium text-dark-500 mb-2">Cambiar estado:</p>
          <div className="flex flex-wrap gap-2">
            {actions.map(s => (
              <button key={s} onClick={() => onStatusChange(appt.id, s)}
                className="text-xs px-3 py-1.5 rounded-lg border border-dark-200 hover:bg-dark-50 transition-colors capitalize">
                → {s.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
      )}

      <button className="btn-secondary w-full" onClick={onClose}>Cerrar</button>
    </div>
  )
}

function InfoRow({ icon, label, value }) {
  return (
    <div className="flex items-start gap-2 p-3 bg-white border border-dark-100 rounded-xl">
      <span className="text-dark-400 mt-0.5">{icon}</span>
      <div>
        <p className="text-[10px] text-dark-400 uppercase tracking-wide">{label}</p>
        <p className="text-sm font-medium text-dark-800 mt-0.5">{value}</p>
      </div>
    </div>
  )
}

// ── Block Slot Form ───────────────────────────────────────────────────────────
function BlockForm({ onSave, onClose }) {
  const [form, setForm] = useState({
    peluquero_id: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    hour_start: 13,
    hour_end: 14,
    reason: '',
  })
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-dark-600 mb-1">Peluquero/a</label>
        <select className="input" value={form.peluquero_id} onChange={e => setForm(p => ({...p, peluquero_id: e.target.value}))}>
          <option value="">Todos</option>
          {MOCK_PELUQUEROS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium text-dark-600 mb-1">Fecha</label>
        <input type="date" className="input" value={form.date} onChange={e => setForm(p => ({...p, date: e.target.value}))} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-dark-600 mb-1">Desde</label>
          <select className="input" value={form.hour_start} onChange={e => setForm(p => ({...p, hour_start: Number(e.target.value)}))}>
            {HOURS.map(h => <option key={h} value={h}>{String(h).padStart(2,'0')}:00</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-dark-600 mb-1">Hasta</label>
          <select className="input" value={form.hour_end} onChange={e => setForm(p => ({...p, hour_end: Number(e.target.value)}))}>
            {HOURS.map(h => <option key={h} value={h}>{String(h).padStart(2,'0')}:00</option>)}
          </select>
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-dark-600 mb-1">Motivo</label>
        <input className="input" placeholder="Ej: Almuerzo, Capacitación…" value={form.reason} onChange={e => setForm(p => ({...p, reason: e.target.value}))} />
      </div>
      <div className="flex gap-2 pt-1">
        <button className="btn-secondary flex-1" onClick={onClose}>Cancelar</button>
        <button className="btn-primary flex-1" onClick={() => onSave(form)}>Bloquear horario</button>
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function Agenda() {
  const { isAdmin, isRecepcionista, profile } = useAuth()
  const canManage = isAdmin || isRecepcionista

  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }))
  const [view, setView]           = useState('week')   // 'week' | 'day'
  const [selectedDay, setSelectedDay] = useState(new Date())
  const [filterPeluquero, setFilterPeluquero] = useState(
    profile?.role === 'peluquero' ? (profile?.peluquero_id || '') : ''
  )

  const [appointments, setAppointments] = useState(MOCK_APPOINTMENTS)
  const [blocked, setBlocked]           = useState(MOCK_BLOCKED_SLOTS)

  const [modal, setModal] = useState(null)  // null | { type, data }

  const weekDays = Array.from({ length: 6 }, (_, i) => addDays(weekStart, i)) // Mon–Sat

  // Filter appointments for current view
  const visibleDays = view === 'week' ? weekDays : [selectedDay]

  const apptsByDay = useMemo(() => {
    const map = {}
    visibleDays.forEach(d => {
      const key = format(d, 'yyyy-MM-dd')
      map[key] = appointments.filter(a =>
        a.date === key &&
        (filterPeluquero ? a.peluquero_id === filterPeluquero : true)
      )
    })
    return map
  }, [appointments, visibleDays, filterPeluquero])

  const blockedByDay = useMemo(() => {
    const map = {}
    visibleDays.forEach(d => {
      const key = format(d, 'yyyy-MM-dd')
      map[key] = blocked.filter(b =>
        b.date === key &&
        (filterPeluquero ? (b.peluquero_id === filterPeluquero || b.peluquero_id === '') : true)
      )
    })
    return map
  }, [blocked, visibleDays, filterPeluquero])

  function handleSaveAppt(form) {
    const service = MOCK_SERVICES.find(s => s.id === form.service_id)
    const peluquero = MOCK_PELUQUEROS.find(p => p.id === form.peluquero_id)
    if (modal?.data?.id) {
      setAppointments(prev => prev.map(a =>
        a.id === modal.data.id ? { ...a, ...form, service, peluquero } : a
      ))
    } else {
      setAppointments(prev => [...prev, {
        id: 'a' + Date.now(),
        ...form, service, peluquero,
      }])
    }
    setModal(null)
  }

  function handleStatusChange(id, newStatus) {
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: newStatus } : a))
    setModal(null)
  }

  function handleSaveBlock(form) {
    setBlocked(prev => [...prev, { id: 'b' + Date.now(), ...form }])
    setModal(null)
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* ── Top bar ── */}
      <header className="flex items-center gap-4 px-6 py-4 bg-white border-b border-dark-100 flex-shrink-0">
        <h1 className="text-lg font-semibold text-dark-900">Agenda</h1>

        {/* Week nav */}
        <div className="flex items-center gap-1 ml-auto">
          <button
            onClick={() => { setWeekStart(w => subWeeks(w, 1)); setSelectedDay(d => addDays(d, -7)) }}
            className="p-1.5 rounded-lg hover:bg-dark-50 text-dark-500"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-sm font-medium text-dark-700 min-w-[140px] text-center capitalize">
            {view === 'week'
              ? `${format(weekStart, 'd MMM', { locale: es })} – ${format(addDays(weekStart, 5), 'd MMM yyyy', { locale: es })}`
              : format(selectedDay, "EEEE d 'de' MMMM", { locale: es })
            }
          </span>
          <button
            onClick={() => { setWeekStart(w => addWeeks(w, 1)); setSelectedDay(d => addDays(d, 7)) }}
            className="p-1.5 rounded-lg hover:bg-dark-50 text-dark-500"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Today */}
        <button
          onClick={() => { const t = new Date(); setWeekStart(startOfWeek(t, {weekStartsOn:1})); setSelectedDay(t) }}
          className="btn-secondary text-xs"
        >
          Hoy
        </button>

        {/* View toggle */}
        <div className="flex border border-dark-200 rounded-lg overflow-hidden">
          <button onClick={() => setView('week')} className={`px-3 py-1.5 text-xs flex items-center gap-1.5 transition-colors ${view==='week' ? 'bg-dark-900 text-white' : 'text-dark-500 hover:bg-dark-50'}`}>
            <LayoutGrid size={13}/> Semana
          </button>
          <button onClick={() => setView('day')} className={`px-3 py-1.5 text-xs flex items-center gap-1.5 transition-colors ${view==='day' ? 'bg-dark-900 text-white' : 'text-dark-500 hover:bg-dark-50'}`}>
            <List size={13}/> Día
          </button>
        </div>

        {/* Peluquero filter */}
        <select
          className="input w-40 text-xs"
          value={filterPeluquero}
          onChange={e => setFilterPeluquero(e.target.value)}
          disabled={profile?.role === 'peluquero'}
        >
          <option value="">Todos</option>
          {MOCK_PELUQUEROS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>

        {/* Actions */}
        {canManage && (
          <div className="flex gap-2">
            <button onClick={() => setModal({ type: 'block' })} className="btn-secondary text-xs flex items-center gap-1.5">
              <Ban size={13} /> Bloquear
            </button>
            <button onClick={() => setModal({ type: 'new' })} className="btn-primary text-xs flex items-center gap-1.5">
              <Plus size={13} /> Nueva cita
            </button>
          </div>
        )}
      </header>

      {/* ── Calendar grid ── */}
      <div className="flex-1 overflow-auto">
        <div className="flex" style={{ minHeight: `${HOURS.length * 56}px` }}>
          {/* Hour labels */}
          <div className="w-14 flex-shrink-0 border-r border-dark-100 bg-white sticky left-0 z-20">
            <div className="h-12" /> {/* header spacer */}
            {HOURS.map(h => (
              <div key={h} className="h-14 flex items-start justify-end pr-3 pt-1">
                <span className="text-[10px] text-dark-300 font-mono">{String(h).padStart(2,'0')}:00</span>
              </div>
            ))}
          </div>

          {/* Day columns */}
          {visibleDays.map(day => {
            const key = format(day, 'yyyy-MM-dd')
            const dayAppts = apptsByDay[key] || []
            const dayBlocked = blockedByDay[key] || []
            const dayOfWeek = day.getDay()
            const hours = BUSINESS_HOURS[dayOfWeek]
            const isClosed = !hours
            const isCurrentDay = isToday(day)

            return (
              <div
                key={key}
                className={`flex-1 min-w-[140px] border-r border-dark-100 flex flex-col ${isClosed ? 'bg-dark-50/50' : ''}`}
              >
                {/* Day header */}
                <div
                  className={`h-12 flex flex-col items-center justify-center border-b border-dark-100 sticky top-0 z-10 cursor-pointer
                    ${isCurrentDay ? 'bg-dark-900 text-white' : 'bg-white text-dark-600 hover:bg-dark-50'}`}
                  onClick={() => { setSelectedDay(day); setView('day') }}
                >
                  <span className={`text-[10px] uppercase tracking-wide ${isCurrentDay ? 'text-brand-300' : 'text-dark-400'}`}>
                    {format(day, 'EEE', { locale: es })}
                  </span>
                  <span className={`text-sm font-semibold ${isCurrentDay ? 'text-white' : 'text-dark-800'}`}>
                    {format(day, 'd')}
                  </span>
                </div>

                {/* Time slots */}
                <div className="relative" style={{ height: `${HOURS.length * 56}px` }}>
                  {/* Hour lines */}
                  {HOURS.map(h => (
                    <div key={h} className="absolute w-full border-t border-dark-100/60" style={{ top: `${(h - HOUR_START) * 56}px` }} />
                  ))}

                  {/* Half-hour lines */}
                  {HOURS.map(h => (
                    <div key={h + 0.5} className="absolute w-full border-t border-dashed border-dark-100/30" style={{ top: `${(h - HOUR_START) * 56 + 28}px` }} />
                  ))}

                  {/* Closed overlay */}
                  {isClosed && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <span className="text-xs text-dark-300 font-medium rotate-90 tracking-widest uppercase">Cerrado</span>
                    </div>
                  )}

                  {/* Blocked slots */}
                  {dayBlocked.map(b => (
                    <div
                      key={b.id}
                      className="absolute left-1 right-1 rounded-md bg-dark-100 border border-dark-200 flex items-center justify-center overflow-hidden"
                      style={{
                        top:    `${(b.hour_start - HOUR_START) * 56 + 2}px`,
                        height: `${(b.hour_end - b.hour_start) * 56 - 4}px`,
                      }}
                    >
                      <div className="text-center px-1">
                        <Ban size={12} className="mx-auto text-dark-400 mb-0.5" />
                        <p className="text-[10px] text-dark-400 font-medium leading-tight">{b.reason}</p>
                      </div>
                    </div>
                  ))}

                  {/* Appointments */}
                  {dayAppts.map(appt => {
                    const top    = apptTop(appt)
                    const height = apptHeight(appt)
                    const colorCls = STATUS_COLORS[appt.status] || ''
                    const pel = appt.peluquero

                    return (
                      <button
                        key={appt.id}
                        onClick={() => setModal({ type: 'detail', data: appt })}
                        className={`absolute left-1 right-1 rounded-lg border text-left px-2 py-1 overflow-hidden hover:ring-2 hover:ring-brand-400 transition-all ${colorCls}`}
                        style={{ top: `${top + 2}px`, height: `${height - 4}px` }}
                      >
                        <p className="text-[11px] font-semibold leading-tight truncate">{appt.client_name}</p>
                        {height > 40 && (
                          <p className="text-[10px] leading-tight opacity-75 truncate">{appt.service?.name}</p>
                        )}
                        {height > 54 && pel && (
                          <p className="text-[10px] leading-tight opacity-60 truncate">{pel.name.split(' ')[0]}</p>
                        )}
                        <p className="text-[10px] opacity-60">
                          {String(appt.hour).padStart(2,'0')}:{String(appt.minute).padStart(2,'0')}
                        </p>
                      </button>
                    )
                  })}

                  {/* Click to add */}
                  {canManage && !isClosed && (
                    <div
                      className="absolute inset-0"
                      onClick={e => {
                        if (e.target !== e.currentTarget) return
                        const rect = e.currentTarget.getBoundingClientRect()
                        const y = e.clientY - rect.top
                        const totalMinutes = Math.round((y / 56) * 60 / 30) * 30
                        const h = HOUR_START + Math.floor(totalMinutes / 60)
                        const m = totalMinutes % 60
                        setModal({
                          type: 'new',
                          data: { date: key, hour: h, minute: m }
                        })
                      }}
                    />
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Legend ── */}
      <footer className="bg-white border-t border-dark-100 px-6 py-2 flex items-center gap-4 flex-shrink-0">
        {Object.entries(STATUS_COLORS).map(([s, cls]) => (
          <div key={s} className="flex items-center gap-1.5">
            <div className={`w-2.5 h-2.5 rounded-full border ${cls}`} />
            <span className="text-[10px] text-dark-500 capitalize">{s.replace('_', ' ')}</span>
          </div>
        ))}
        <div className="ml-auto flex items-center gap-3 text-xs text-dark-400">
          <span>Mar–Vie 9:30–19:00</span>
          <span>·</span>
          <span>Sáb 10:00–18:00</span>
        </div>
      </footer>

      {/* ── Modals ── */}
      <Modal
        open={modal?.type === 'new'}
        onClose={() => setModal(null)}
        title={modal?.data?.id ? 'Editar cita' : 'Nueva cita'}
        size="md"
      >
        <ApptForm
          initial={modal?.data || {}}
          onSave={handleSaveAppt}
          onClose={() => setModal(null)}
        />
      </Modal>

      <Modal
        open={modal?.type === 'detail'}
        onClose={() => setModal(null)}
        title="Detalle de cita"
        size="md"
      >
        {modal?.data && (
          <ApptDetail
            appt={modal.data}
            onClose={() => setModal(null)}
            onStatusChange={handleStatusChange}
          />
        )}
      </Modal>

      <Modal
        open={modal?.type === 'block'}
        onClose={() => setModal(null)}
        title="Bloquear horario"
        size="sm"
      >
        <BlockForm
          onSave={handleSaveBlock}
          onClose={() => setModal(null)}
        />
      </Modal>
    </div>
  )
}
