import { useState, useMemo, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ChevronRight, ChevronLeft, Check, Clock, Scissors,
  User, Phone, Calendar, Sparkles, ArrowLeft
} from 'lucide-react'
import {
  format, addDays, startOfDay, isBefore, getDay,
  setHours, setMinutes
} from 'date-fns'
import { es } from 'date-fns/locale'
import {
  MOCK_SERVICES, MOCK_PELUQUEROS, MOCK_APPOINTMENTS,
  MOCK_BLOCKED_SLOTS, BUSINESS_HOURS
} from '../../lib/mockData'
import { CategoryBadge } from '../../components/ui/Badge'
import Logo from '../../components/ui/Logo'

// ── EmailJS config ────────────────────────────────────────────────────────────
// Crea cuenta gratis en https://emailjs.com y rellena estas 3 constantes:
const EMAILJS_SERVICE_ID  = import.meta.env.VITE_EMAILJS_SERVICE_ID  || ''
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || ''
const EMAILJS_PUBLIC_KEY  = import.meta.env.VITE_EMAILJS_PUBLIC_KEY  || ''

async function sendConfirmationEmail({ client, service, peluquero, dateTime }) {
  if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY) return
  try {
    await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service_id:  EMAILJS_SERVICE_ID,
        template_id: EMAILJS_TEMPLATE_ID,
        user_id:     EMAILJS_PUBLIC_KEY,
        template_params: {
          to_name:      client.name,
          to_email:     client.email,
          service_name: service?.name       || '—',
          professional: peluquero?.name     || 'Se asignará',
          date: format(dateTime.date, "EEEE d 'de' MMMM yyyy", { locale: es }),
          time: `${String(dateTime.hour).padStart(2,'0')}:${String(dateTime.minute).padStart(2,'0')} hrs`,
          price:   `$${service?.price?.toLocaleString('es-CL') || '—'}`,
          phone:   `+56 ${client.phone}`,
          whatsapp: '+56 9 2999 3799',
        },
      }),
    })
  } catch (e) {
    console.warn('Email no enviado:', e)
  }
}

// ── Helpers ──────────────────────────────────────────────────────────────────
const SLOT_INTERVAL = 30 // minutes

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
  const dv    = clean.slice(-1)
  const body  = clean.slice(0, -1)
  let sum = 0, mul = 2
  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body[i]) * mul
    mul = mul === 7 ? 2 : mul + 1
  }
  const expected = 11 - (sum % 11)
  const valid = expected === 11 ? '0' : expected === 10 ? 'K' : String(expected)
  return dv === valid
}

function getAvailableSlots(date, peluqueroId, serviceMinutes, appointments, blocked) {
  const dayOfWeek = getDay(date)
  const hours = BUSINESS_HOURS[dayOfWeek]
  if (!hours) return []

  const [openH, openM]   = hours.open.split(':').map(Number)
  const [closeH, closeM] = hours.close.split(':').map(Number)
  const openMin  = openH  * 60 + openM
  const closeMin = closeH * 60 + closeM
  const dateStr  = format(date, 'yyyy-MM-dd')
  const now      = new Date()

  // Existing appointments for this peluquero/date
  const existingAppts = appointments.filter(a =>
    a.date === dateStr &&
    (peluqueroId ? a.peluquero_id === peluqueroId : true) &&
    a.status !== 'cancelada'
  )

  // Blocked slots
  const blocks = blocked.filter(b =>
    b.date === dateStr &&
    (!peluqueroId || !b.peluquero_id || b.peluquero_id === peluqueroId)
  )

  const slots = []
  for (let m = openMin; m + serviceMinutes <= closeMin; m += SLOT_INTERVAL) {
    const slotH = Math.floor(m / 60)
    const slotM = m % 60
    const slotDt = setMinutes(setHours(startOfDay(date), slotH), slotM)

    // Skip past times (today)
    if (isBefore(slotDt, now)) continue

    // Check collisions with existing appointments
    const collision = existingAppts.some(a => {
      const aStart = a.hour * 60 + a.minute
      const aEnd   = aStart + (a.service?.duration || 30)
      return m < aEnd && m + serviceMinutes > aStart
    })
    if (collision) continue

    // Check blocked slots
    const isBlocked = blocks.some(b => {
      const bStart = b.hour_start * 60
      const bEnd   = b.hour_end   * 60
      return m < bEnd && m + serviceMinutes > bStart
    })
    if (isBlocked) continue

    slots.push({ hour: slotH, minute: slotM })
  }
  return slots
}

// ── Step components ───────────────────────────────────────────────────────────
function StepService({ value, onChange }) {
  const [cat, setCat] = useState('Todos')
  const categories = ['Todos', ...new Set(MOCK_SERVICES.map(s => s.category))]

  const filtered = MOCK_SERVICES.filter(s =>
    cat === 'Todos' || s.category === cat
  )

  return (
    <div className="space-y-4">
      {/* Category tabs */}
      <div className="flex gap-2 flex-wrap">
        {categories.map(c => (
          <button
            key={c}
            onClick={() => setCat(c)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              cat === c ? 'bg-dark-900 text-white' : 'bg-dark-100 text-dark-600 hover:bg-dark-200'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Service list */}
      <div className="grid gap-2">
        {filtered.map(s => (
          <button
            key={s.id}
            onClick={() => onChange(s)}
            className={`flex items-center gap-4 p-4 rounded-xl border text-left transition-all hover:border-brand-400 hover:shadow-card-hover ${
              value?.id === s.id
                ? 'border-dark-900 bg-dark-50 ring-2 ring-dark-900/10'
                : 'border-dark-200 bg-white'
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-brand-100 flex items-center justify-center flex-shrink-0">
              <Scissors size={18} className="text-brand-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-dark-900 text-sm">{s.name}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <CategoryBadge category={s.category} />
                <span className="text-xs text-dark-400 flex items-center gap-1">
                  <Clock size={11} /> {s.duration} min
                </span>
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="font-semibold text-dark-900 text-sm">${s.price.toLocaleString('es-CL')}</p>
              {value?.id === s.id && <Check size={14} className="ml-auto text-dark-900 mt-1" />}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

function StepPeluquero({ value, onChange }) {
  return (
    <div className="space-y-3">
      {/* No preference option */}
      <button
        onClick={() => onChange(null)}
        className={`w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-all ${
          value === null
            ? 'border-dark-900 bg-dark-50 ring-2 ring-dark-900/10'
            : 'border-dark-200 bg-white hover:border-brand-400'
        }`}
      >
        <div className="w-10 h-10 rounded-full bg-dark-100 flex items-center justify-center">
          <Sparkles size={18} className="text-dark-500" />
        </div>
        <div>
          <p className="font-medium text-dark-900 text-sm">Sin preferencia</p>
          <p className="text-xs text-dark-400 mt-0.5">Te asignamos al profesional disponible</p>
        </div>
        {value === null && <Check size={14} className="ml-auto text-dark-900" />}
      </button>

      {MOCK_PELUQUEROS.map(p => (
        <button
          key={p.id}
          onClick={() => onChange(p)}
          className={`w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-all ${
            value?.id === p.id
              ? 'border-dark-900 bg-dark-50 ring-2 ring-dark-900/10'
              : 'border-dark-200 bg-white hover:border-brand-400'
          }`}
        >
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0"
            style={{ backgroundColor: p.color }}
          >
            {p.avatar}
          </div>
          <div>
            <p className="font-medium text-dark-900 text-sm">{p.name}</p>
            <p className="text-xs text-dark-400 mt-0.5">Estilista profesional</p>
          </div>
          {value?.id === p.id && <Check size={14} className="ml-auto text-dark-900" />}
        </button>
      ))}
    </div>
  )
}

function StepDateTime({ service, peluqueroId, value, onChange }) {
  const today  = startOfDay(new Date())
  const days   = Array.from({ length: 14 }, (_, i) => addDays(today, i + 1))
  const [selectedDate, setSelectedDate] = useState(value?.date || null)

  const slots = useMemo(() => {
    if (!selectedDate || !service) return []
    return getAvailableSlots(
      selectedDate,
      peluqueroId,
      service.duration,
      MOCK_APPOINTMENTS,
      MOCK_BLOCKED_SLOTS
    )
  }, [selectedDate, peluqueroId, service])

  return (
    <div className="space-y-5">
      {/* Date picker */}
      <div>
        <p className="text-xs font-medium text-dark-600 mb-2">Elige una fecha</p>
        <div className="grid grid-cols-7 gap-1.5">
          {days.map(d => {
            const dayOfWeek = getDay(d)
            const closed    = !BUSINESS_HOURS[dayOfWeek]
            const isSelected = selectedDate && format(d, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
            return (
              <button
                key={d.toString()}
                onClick={() => { if (!closed) { setSelectedDate(d); onChange(null) } }}
                disabled={closed}
                className={`flex flex-col items-center p-2 rounded-xl transition-all text-center ${
                  closed       ? 'opacity-30 cursor-not-allowed bg-dark-50' :
                  isSelected   ? 'bg-dark-900 text-white' :
                  'bg-white border border-dark-200 hover:border-brand-400 hover:shadow-sm'
                }`}
              >
                <span className={`text-[10px] uppercase tracking-wide ${isSelected ? 'text-brand-300' : 'text-dark-400'}`}>
                  {format(d, 'EEE', { locale: es }).slice(0,2)}
                </span>
                <span className={`text-sm font-semibold mt-0.5 ${isSelected ? 'text-white' : 'text-dark-800'}`}>
                  {format(d, 'd')}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Time slots */}
      {selectedDate && (
        <div>
          <p className="text-xs font-medium text-dark-600 mb-2">
            Horarios disponibles — {format(selectedDate, "EEEE d 'de' MMMM", { locale: es })}
          </p>
          {slots.length === 0 ? (
            <div className="text-center py-8 text-dark-400 text-sm">
              No hay horarios disponibles para este día.
              <br /><span className="text-xs mt-1 block">Prueba con otra fecha.</span>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-2">
              {slots.map(slot => {
                const label = `${String(slot.hour).padStart(2,'0')}:${String(slot.minute).padStart(2,'0')}`
                const isSelected = value?.hour === slot.hour && value?.minute === slot.minute &&
                  value?.date && format(value.date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
                return (
                  <button
                    key={label}
                    onClick={() => onChange({ date: selectedDate, ...slot })}
                    className={`py-2 rounded-xl text-sm font-medium transition-all border ${
                      isSelected
                        ? 'bg-dark-900 text-white border-dark-900'
                        : 'bg-white border-dark-200 text-dark-700 hover:border-brand-400 hover:shadow-sm'
                    }`}
                  >
                    {label}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function StepClientData({ value, onChange }) {
  const [form, setForm] = useState(value || { name: '', email: '', phone: '' })
  const [errors, setErrors] = useState({})
  const f = k => v => {
    const next = { ...form, [k]: v }
    setForm(next)
    onChange(next)
    if (k === 'email') {
      setErrors(p => ({ ...p, email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? '' : 'Correo inválido' }))
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-dark-600 mb-1.5">Nombre completo *</label>
        <input
          className="input"
          placeholder="María González"
          value={form.name}
          onChange={e => f('name')(e.target.value)}
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-dark-600 mb-1.5">Correo electrónico *</label>
        <input
          type="email"
          className={`input ${errors.email ? 'border-red-400 focus:ring-red-300' : ''}`}
          placeholder="maria@email.com"
          value={form.email}
          onChange={e => f('email')(e.target.value)}
        />
        {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
      </div>
      <div>
        <label className="block text-xs font-medium text-dark-600 mb-1.5">Teléfono *</label>
        <div className="flex gap-2">
          <span className="input w-16 bg-dark-50 text-dark-500 flex-shrink-0 flex items-center justify-center text-sm">+56</span>
          <input
            className="input flex-1"
            placeholder="9 XXXX XXXX"
            type="tel"
            value={form.phone}
            onChange={e => f('phone')(e.target.value.replace(/\D/g, '').slice(0, 9))}
          />
        </div>
      </div>
      <p className="text-[10px] text-dark-400">
        Tus datos son usados únicamente para confirmar y recordar tu cita. No los compartimos.
      </p>
    </div>
  )
}

function StepConfirmation({ booking }) {
  const navigate  = useNavigate()
  const [secs, setSecs] = useState(5)
  const emailSent = useRef(false)

  // Enviar email de confirmación (una sola vez)
  useEffect(() => {
    if (emailSent.current) return
    emailSent.current = true
    sendConfirmationEmail(booking)
  }, [])

  // Countdown → redirect al home
  useEffect(() => {
    if (secs <= 0) { navigate('/'); return }
    const t = setTimeout(() => setSecs(s => s - 1), 1000)
    return () => clearTimeout(t)
  }, [secs, navigate])

  return (
    <div className="text-center space-y-6">
      {/* Success icon */}
      <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
        <Check size={28} className="text-green-600 stroke-[2.5]" />
      </div>

      <div>
        <h2 className="text-xl font-semibold text-dark-900">¡Cita confirmada!</h2>
        <p className="text-sm text-dark-500 mt-1">Te esperamos en La Pelukeria, Puerto Varas</p>
      </div>

      {/* Booking details card */}
      <div className="bg-dark-50 rounded-2xl p-5 text-left space-y-3 max-w-sm mx-auto">
        <DetailRow icon={<Scissors size={15} />} label="Servicio"    value={booking.service?.name} />
        <DetailRow icon={<User size={15} />}     label="Profesional"
          value={booking.peluquero ? booking.peluquero.name : 'Sin preferencia (se asignará)'} />
        <DetailRow icon={<Calendar size={15} />} label="Fecha"
          value={format(booking.dateTime.date, "EEEE d 'de' MMMM yyyy", { locale: es })} />
        <DetailRow icon={<Clock size={15} />}    label="Hora"
          value={`${String(booking.dateTime.hour).padStart(2,'0')}:${String(booking.dateTime.minute).padStart(2,'0')} hrs`} />
        <DetailRow icon={<Phone size={15} />}    label="Contacto"   value={`+56 ${booking.client.phone}`} />
        <div className="border-t border-dark-200 pt-3 flex justify-between items-center">
          <span className="text-xs text-dark-500">Precio estimado</span>
          <span className="font-semibold text-dark-900">${booking.service?.price?.toLocaleString('es-CL')}</span>
        </div>
      </div>

      {/* Email notice */}
      {booking.client?.email && (
        <p className="text-xs text-dark-400">
          📧 Enviamos un comprobante a <span className="text-dark-600 font-medium">{booking.client.email}</span>
        </p>
      )}

      <div className="text-xs text-dark-400 space-y-1">
        <p>📍 <strong className="text-dark-600">La Pelukeria</strong> · Puerto Varas, Chile</p>
        <p>Si necesitas cancelar o modificar, escríbenos por WhatsApp:</p>
        <a href="https://wa.me/56929993799" className="text-brand-500 font-medium hover:underline">
          +56 9 2999 3799
        </a>
      </div>

      {/* Redirect countdown */}
      <p className="text-xs text-dark-300">
        Volviendo al inicio en <span className="font-semibold text-dark-500">{secs}s</span>…
      </p>

      <div className="flex gap-3 justify-center">
        <button className="btn-secondary" onClick={() => navigate('/')}>
          Ir al inicio
        </button>
        <button className="btn-secondary" onClick={() => window.location.reload()}>
          Agendar otra cita
        </button>
      </div>
    </div>
  )
}

function DetailRow({ icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-brand-500 mt-0.5 flex-shrink-0">{icon}</span>
      <div>
        <p className="text-[10px] text-dark-400 uppercase tracking-wide">{label}</p>
        <p className="text-sm text-dark-800 font-medium capitalize">{value}</p>
      </div>
    </div>
  )
}

// ── Stepper UI ────────────────────────────────────────────────────────────────
const STEPS = [
  { id: 1, label: 'Servicio'    },
  { id: 2, label: 'Profesional' },
  { id: 3, label: 'Fecha'       },
  { id: 4, label: 'Tus datos'   },
  { id: 5, label: 'Confirmar'   },
]

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function Agendar() {
  const [step, setStep] = useState(1)
  const [done, setDone] = useState(false)

  const [service,   setService]   = useState(null)
  const [peluquero, setPeluquero] = useState(undefined) // undefined = not yet chosen, null = no pref
  const [dateTime,  setDateTime]  = useState(null)
  const [client,    setClient]    = useState(null)

  const canNext = useMemo(() => {
    if (step === 1) return !!service
    if (step === 2) return peluquero !== undefined
    if (step === 3) return !!dateTime
    if (step === 4) return !!(client?.name && client?.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(client.email) && client?.phone)
    return true
  }, [step, service, peluquero, dateTime, client])

  function handleSubmit() {
    // In production: call Supabase insert here
    console.log('Booking:', { service, peluquero, dateTime, client })
    setDone(true)
  }

  if (done) {
    return (
      <PublicShell>
        <StepConfirmation booking={{ service, peluquero, dateTime, client }} />
      </PublicShell>
    )
  }

  return (
    <PublicShell>
      {/* Stepper header */}
      <div className="flex items-center justify-center mb-8">
        {STEPS.map((s, i) => (
          <div key={s.id} className="flex items-center">
            <div className="flex flex-col items-center">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                step > s.id  ? 'bg-dark-900 text-white' :
                step === s.id ? 'bg-brand-400 text-white ring-4 ring-brand-400/20' :
                'bg-dark-100 text-dark-400'
              }`}>
                {step > s.id ? <Check size={13} /> : s.id}
              </div>
              <span className={`text-[10px] mt-1 hidden sm:block ${step === s.id ? 'text-dark-700 font-medium' : 'text-dark-400'}`}>
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`w-8 sm:w-12 h-px mx-1 mb-4 transition-colors ${step > s.id ? 'bg-dark-900' : 'bg-dark-200'}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step title */}
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-dark-900">{
          step === 1 ? '¿Qué servicio necesitas?' :
          step === 2 ? '¿Con quién prefieres atenderte?' :
          step === 3 ? 'Elige fecha y hora' :
          step === 4 ? 'Tus datos de contacto' :
          'Confirmar reserva'
        }</h2>
        <p className="text-sm text-dark-400 mt-0.5">Paso {step} de {STEPS.length}</p>
      </div>

      {/* Step content */}
      <div className="min-h-[300px]">
        {step === 1 && <StepService value={service} onChange={setService} />}
        {step === 2 && <StepPeluquero value={peluquero} onChange={v => setPeluquero(v)} />}
        {step === 3 && (
          <StepDateTime
            service={service}
            peluqueroId={peluquero?.id || null}
            value={dateTime}
            onChange={setDateTime}
          />
        )}
        {step === 4 && <StepClientData value={client} onChange={setClient} />}
        {step === 5 && (
          <ReviewStep service={service} peluquero={peluquero} dateTime={dateTime} client={client} />
        )}
      </div>

      {/* Navigation */}
      <div className="flex gap-3 mt-6 pt-4 border-t border-dark-100">
        {step > 1 && (
          <button className="btn-secondary flex items-center gap-2" onClick={() => setStep(s => s - 1)}>
            <ChevronLeft size={15} /> Atrás
          </button>
        )}
        <div className="flex-1" />
        {step < STEPS.length ? (
          <button
            className="btn-primary flex items-center gap-2"
            disabled={!canNext}
            onClick={() => setStep(s => s + 1)}
          >
            Continuar <ChevronRight size={15} />
          </button>
        ) : (
          <button className="btn-brand flex items-center gap-2 px-6" onClick={handleSubmit}>
            <Check size={15} /> Confirmar reserva
          </button>
        )}
      </div>
    </PublicShell>
  )
}

function ReviewStep({ service, peluquero, dateTime, client }) {
  return (
    <div className="space-y-3">
      <p className="text-sm text-dark-500 mb-4">Revisa los detalles de tu cita antes de confirmar.</p>
      <ReviewRow label="Servicio"      value={service?.name} />
      <ReviewRow label="Profesional"   value={peluquero ? peluquero.name : 'Sin preferencia'} />
      <ReviewRow label="Fecha"
        value={dateTime ? format(dateTime.date, "EEEE d 'de' MMMM yyyy", { locale: es }) : '—'} />
      <ReviewRow label="Hora"
        value={dateTime ? `${String(dateTime.hour).padStart(2,'0')}:${String(dateTime.minute).padStart(2,'0')} hrs` : '—'} />
      <ReviewRow label="Nombre"    value={client?.name} />
      <ReviewRow label="Correo"    value={client?.email} />
      <ReviewRow label="Teléfono"  value={client?.phone ? `+56 ${client.phone}` : '—'} />
      <div className="flex justify-between items-center p-4 bg-dark-900 text-white rounded-xl mt-2">
        <span className="text-sm">Total estimado</span>
        <span className="font-semibold">${service?.price?.toLocaleString('es-CL')}</span>
      </div>
    </div>
  )
}

function ReviewRow({ label, value }) {
  return (
    <div className="flex justify-between items-center py-2.5 border-b border-dark-100 last:border-0">
      <span className="text-xs text-dark-500 uppercase tracking-wide">{label}</span>
      <span className="text-sm font-medium text-dark-800 capitalize">{value || '—'}</span>
    </div>
  )
}

function PublicShell({ children }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-50 via-white to-brand-50">
      {/* Header */}
      <header className="border-b border-dark-100 bg-white/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-xl mx-auto px-4 h-14 flex items-center justify-between">
          <Logo size="sm" />
          <a href="/" className="text-xs text-dark-400 hover:text-dark-700 flex items-center gap-1">
            <ArrowLeft size={13} /> Volver
          </a>
        </div>
      </header>

      {/* Body */}
      <div className="max-w-xl mx-auto px-4 py-8">
        <div className="card p-6 sm:p-8">
          {children}
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center py-6 text-xs text-dark-400">
        © {new Date().getFullYear()} La Pelukeria · Puerto Varas
      </footer>
    </div>
  )
}
