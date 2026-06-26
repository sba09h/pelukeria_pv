const STATUS_MAP = {
  pendiente:    { label: 'Pendiente',    cls: 'status-pendiente'    },
  confirmada:   { label: 'Confirmada',   cls: 'status-confirmada'   },
  en_atencion:  { label: 'En Atención',  cls: 'status-en_atencion'  },
  completada:   { label: 'Completada',   cls: 'status-completada'   },
  cancelada:    { label: 'Cancelada',    cls: 'status-cancelada'    },
}

export function StatusBadge({ status }) {
  const s = STATUS_MAP[status] || { label: status, cls: '' }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${s.cls}`}>
      {s.label}
    </span>
  )
}

export function CategoryBadge({ category }) {
  const colors = {
    Corte:        'bg-stone-100 text-stone-700',
    Color:        'bg-pink-50 text-pink-700',
    Tratamientos: 'bg-amber-50 text-amber-700',
    Otros:        'bg-blue-50 text-blue-700',
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${colors[category] || 'bg-gray-100 text-gray-700'}`}>
      {category}
    </span>
  )
}
