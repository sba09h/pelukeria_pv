import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Logo from '../components/ui/Logo'
import { Eye, EyeOff, ArrowLeft } from 'lucide-react'

export default function Login() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd]   = useState(false)
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

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
        {/* Subtle texture overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900" />
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'radial-gradient(circle, #C8B89A 1px, transparent 1px)', backgroundSize: '32px 32px' }}
        />

        <div className="relative z-10 text-center space-y-8">
          <Logo variant="light" size="xl" />
          <div className="w-12 h-px bg-brand-400/50 mx-auto" />
          <p className="text-dark-400 text-sm tracking-widest uppercase font-light">
            Sistema interno de gestión
          </p>
        </div>

        {/* Decorative circles */}
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full border border-brand-500/5" />
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full border border-brand-500/5" />
        <div className="absolute bottom-20 right-10 w-32 h-32 rounded-full border border-brand-500/10" />
      </div>

      {/* Right — form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-sm">

          {/* Mobile logo */}
          <div className="mb-10 lg:hidden">
            <Logo size="md" />
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
