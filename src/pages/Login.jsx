import { useState, useEffect, useRef } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Eye, EyeOff, ArrowLeft } from 'lucide-react'

function LoginBg() {
  const canvasRef = useRef(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight }
    resize()
    window.addEventListener('resize', resize)
    const orbs = [
      { x:.72, y:-.06, r:.64, col:[148,128,96],  op:.46, spd:14, ph:0   },
      { x:-.08,y:.90,  r:.58, col:[88, 72, 52],  op:.52, spd:19, ph:2.1 },
      { x:.48, y:.38,  r:.42, col:[192,168,128], op:.14, spd:24, ph:4.4 },
      { x:.88, y:.62,  r:.38, col:[168,118,60],  op:.22, spd:16, ph:1.5 },
      { x:.18, y:.18,  r:.34, col:[104,86,62],   op:.18, spd:21, ph:3.2 },
    ]
    const grainCanvas = document.createElement('canvas')
    grainCanvas.width = grainCanvas.height = 256
    const grainCtx = grainCanvas.getContext('2d')
    let grainFrame = 0
    const updateGrain = () => {
      const id = grainCtx.createImageData(256, 256)
      const d = id.data
      for (let i = 0; i < d.length; i += 4) {
        const v = Math.random() * 255 | 0
        d[i] = d[i+1] = d[i+2] = v
        d[i+3] = Math.random() * 18 | 0
      }
      grainCtx.putImageData(id, 0, 0)
    }
    updateGrain()
    let t = 0, animId
    const draw = () => {
      const W = canvas.width, H = canvas.height
      ctx.clearRect(0, 0, W, H)
      orbs.forEach(o => {
        const px = (o.x + Math.sin(t / o.spd + o.ph) * .09) * W
        const py = (o.y + Math.cos(t / o.spd * .65 + o.ph) * .07) * H
        const rad = o.r * Math.max(W, H) * .72
        ctx.save()
        ctx.translate(px, py)
        ctx.scale(1, .72)
        const g = ctx.createRadialGradient(0, 0, 0, 0, 0, rad)
        const [r, g_, b] = o.col
        g.addColorStop(0,   `rgba(${r},${g_},${b},${o.op})`)
        g.addColorStop(.38, `rgba(${r},${g_},${b},${(o.op * .38).toFixed(3)})`)
        g.addColorStop(1,   `rgba(${r},${g_},${b},0)`)
        ctx.beginPath(); ctx.arc(0, 0, rad, 0, Math.PI * 2)
        ctx.fillStyle = g; ctx.fill(); ctx.restore()
      })
      grainFrame++
      if (grainFrame % 3 === 0) updateGrain()
      ctx.save()
      ctx.globalAlpha = .55
      ctx.globalCompositeOperation = 'soft-light'
      const pat = ctx.createPattern(grainCanvas, 'repeat')
      if (pat) { ctx.fillStyle = pat; ctx.fillRect(0, 0, W, H) }
      ctx.restore()
      t += .6
      animId = requestAnimationFrame(draw)
    }
    draw()
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize) }
  }, [])
  return <canvas ref={canvasRef} style={{ position:'absolute', inset:0, width:'100%', height:'100%', pointerEvents:'none', zIndex:0 }} />
}

export default function Login() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd]   = useState(false)
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  const [mounted, setMounted] = useState(false)
  useEffect(() => { const t = setTimeout(() => setMounted(true), 60); return () => clearTimeout(t) }, [])
  const fu = (d) => ({
    opacity:   mounted ? 1 : 0,
    transform: mounted ? 'translateY(0px)' : 'translateY(26px)',
    transition: `opacity .72s cubic-bezier(.16,1,.3,1) ${d}s, transform .72s cubic-bezier(.16,1,.3,1) ${d}s`,
  })

  if (user) return <Navigate to="/admin/agenda" replace />

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-dark-900">
      {/* Left — branding */}
      <div className="hidden lg:flex w-1/2 flex-col items-center justify-center relative overflow-hidden px-16">
        {/* Base dark fill */}
        <div className="absolute inset-0 bg-dark-900" />
        {/* Canvas orbs + grain */}
        <LoginBg />

        <div className="relative z-10 text-left space-y-6">
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 300, fontSize: 'clamp(62px,7.8vw,106px)', lineHeight: 0.88, letterSpacing: '-0.04em', color: 'white', ...fu(0.18) }}>
              La
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 300, fontSize: 'clamp(62px,7.8vw,106px)', lineHeight: 0.88, letterSpacing: '-0.04em', color: 'white', ...fu(0.32) }}>
              Pelukeria
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 300, fontSize: '1.2rem', color: 'rgba(255,255,255,0.3)', marginTop: '14px', ...fu(0.48) }}>
              Hair Salon
            </div>
          </div>
          <div className="w-10 h-px bg-brand-400/40" style={fu(0.62)} />
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '11.7px', letterSpacing: '0.32em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.28)', fontWeight: 500, ...fu(0.72) }}>
            Sistema interno de gestión
          </p>
        </div>

      </div>

      {/* Right — form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full" style={{ maxWidth: '460px' }}>

          {/* Mobile wordmark */}
          <div className="mb-10 lg:hidden">
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 300, fontSize: '42px', lineHeight: 0.88, letterSpacing: '-0.04em', color: '#0D0C0A' }}>La</div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 300, fontSize: '42px', lineHeight: 0.88, letterSpacing: '-0.04em', color: '#0D0C0A' }}>Pelukeria</div>
            <div style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 300, fontSize: '0.85rem', color: 'rgba(0,0,0,0.28)', marginTop: '8px' }}>Hair Salon</div>
          </div>

          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-1.5 text-xs text-dark-400 hover:text-dark-700 transition-colors mb-8"
          >
            <ArrowLeft size={13}/> Volver al inicio
          </button>

          <h1 className="font-serif text-3xl font-normal text-dark-900 mb-1">Bienvenido</h1>
          <p className="text-sm text-dark-400 mb-8 font-light tracking-wide">Accede con tu cuenta del equipo</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-dark-500 mb-2 tracking-wider uppercase">
                Correo electrónico
              </label>
              <input
                type="email"
                className="input"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="nombre@lapelukeria.cl"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-dark-500 mb-2 tracking-wider uppercase">
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  className="input pr-10"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-300 hover:text-dark-600 transition-colors"
                >
                  {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2.5">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-dark-900 text-white rounded-lg text-sm font-medium tracking-wide hover:bg-dark-700 transition-colors duration-200 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Ingresando…' : 'Ingresar'}
            </button>
          </form>

          {/* Demo hint */}
          <div className="mt-8 p-4 bg-dark-50 rounded-xl border border-dark-100">
            <p className="text-xs font-semibold text-dark-600 mb-3 tracking-wider uppercase">Accesos demo</p>
            <div className="space-y-2 text-xs text-dark-500">
              {[
                ['admin@lapelukeria.cl',     'Admin (dueño)'],
                ['ely@lapelukeria.cl',        'Peluquera'],
                ['recepcion@lapelukeria.cl', 'Recepcionista'],
              ].map(([email, label]) => (
                <button
                  key={email}
                  type="button"
                  onClick={() => { setEmail(email); setPassword('demo1234') }}
                  className="w-full text-left flex items-center justify-between px-3 py-2 bg-white rounded-lg border border-dark-100 hover:border-dark-300 transition-colors cursor-pointer"
                >
                  <span className="font-mono text-[11px] text-dark-600">{email}</span>
                  <span className="text-dark-400 text-[10px]">{label}</span>
                </button>
              ))}
              <p className="text-[10px] text-dark-400 text-center pt-1">Contraseña: <span className="font-mono font-semibold">demo1234</span></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
