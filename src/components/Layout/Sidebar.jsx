import { NavLink } from 'react-router-dom'
import {
  CalendarDays, Users, BarChart2, ShoppingBag, DollarSign,
  Gift, Image, Package, Settings, LogOut, Scissors
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import Logo from '../ui/Logo'

const navItems = [
  { to: '/admin/agenda',     icon: CalendarDays, label: 'Agenda',      roles: ['admin','recepcionista','peluquero'] },
  { to: '/admin/clientes',   icon: Users,        label: 'Clientes',    roles: ['admin','recepcionista']             },
  { to: '/admin/produccion', icon: BarChart2,    label: 'Producción',  roles: ['admin']                            },
  { to: '/admin/servicios',  icon: Scissors,     label: 'Servicios',   roles: ['admin']                            },
  { to: '/admin/caja',       icon: DollarSign,   label: 'Caja',        roles: ['admin','recepcionista']             },
  { to: '/admin/loyalty',    icon: Gift,         label: 'Loyalty',     roles: ['admin']                            },
  { to: '/admin/inventario', icon: Package,      label: 'Inventario',  roles: ['admin']                            },
  { to: '/admin/galeria',    icon: Image,        label: 'Galería',     roles: ['admin']                            },
  { to: '/admin/config',     icon: Settings,     label: 'Config',      roles: ['admin']                            },
]

export default function Sidebar() {
  const { profile, logout } = useAuth()
  const role = profile?.role || 'peluquero'

  const visible = navItems.filter(n => n.roles.includes(role))

  return (
    <aside className="w-60 min-h-screen bg-dark-900 flex flex-col fixed left-0 top-0 bottom-0 z-30">
      {/* Logo */}
      <div className="px-6 py-7 border-b border-white/5">
        <Logo variant="light" size="sm" />
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {visible.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-brand-500/20 text-brand-300 font-medium'
                  : 'text-dark-300 hover:text-white hover:bg-dark-700'
              }`
            }
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User + logout */}
      <div className="px-3 py-4 border-t border-dark-700">
        <div className="flex items-center gap-3 px-3 py-2 mb-1">
          <div className="w-7 h-7 rounded-full bg-brand-400 flex items-center justify-center text-white text-xs font-semibold">
            {profile?.name?.charAt(0) || '?'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-white truncate">{profile?.name}</p>
            <p className="text-[10px] text-dark-400 capitalize">{profile?.role}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm text-dark-400 hover:text-white hover:bg-dark-700 transition-colors"
        >
          <LogOut size={16} />
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}
