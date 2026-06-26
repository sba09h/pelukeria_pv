import { useState, useMemo } from 'react'
import {
  AlertTriangle, Plus, Minus, Package, Search,
  ArrowUpCircle, ArrowDownCircle, Edit2, X,
  TrendingDown, ShoppingCart, History, Filter,
  ChevronDown, ChevronUp, BarChart2
} from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { MOCK_INVENTORY, MOCK_MOVEMENTS } from '../../lib/mockData'
import Modal from '../../components/ui/Modal'
import { useAuth } from '../../context/AuthContext'

const CATEGORIES = ['Shampoo','Acondicionador','Tinte','Oxidante','Tratamiento','Finalizador','Insumo','Manicure']

// ── Stock status helper ────────────────────────────────────────────────────────
function stockStatus(item) {
  if (item.stock === 0)              return { label: 'Sin stock',   cls: 'bg-red-100 text-red-700 border-red-200',    dot: 'bg-red-500',    urgent: true  }
  if (item.stock <= item.stock_min)  return { label: 'Stock bajo',  cls: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-400',  urgent: true  }
  return                                    { label: 'OK',          cls: 'bg-green-50 text-green-700 border-green-200', dot: 'bg-green-400',  urgent: false }
}

// ── Product Form ──────────────────────────────────────────────────────────────
function ProductForm({ initial = {}, onSave, onClose }) {
  const [form, setForm] = useState({
    name:       initial.name       || '',
    brand:      initial.brand      || '',
    category:   initial.category   || 'Insumo',
    stock:      initial.stock      ?? 0,
    stock_min:  initial.stock_min  ?? 1,
    cost_price: initial.cost_price || '',
    unit:       initial.unit       || 'unidad',
  })
  const f = k => v => setForm(p => ({ ...p, [k]: v }))

  return (
    <div className="space-y-4">
      <div>
        <label className="label-xs">Nombre del producto *</label>
        <input className="input" placeholder="Ej: Shampoo Keratina Pro" value={form.name} onChange={e => f('name')(e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label-xs">Marca</label>
          <input className="input" placeholder="Ej: Wella" value={form.brand} onChange={e => f('brand')(e.target.value)} />
        </div>
        <div>
          <label className="label-xs">Categoría</label>
          <select className="input" value={form.category} onChange={e => f('category')(e.target.value)}>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="label-xs">Stock inicial</label>
          <input type="number" min="0" className="input" value={form.stock}
            onChange={e => f('stock')(Number(e.target.value))} />
        </div>
        <div>
          <label className="label-xs">Stock mínimo</label>
          <input type="number" min="0" className="input" value={form.stock_min}
            onChange={e => f('stock_min')(Number(e.target.value))} />
        </div>
        <div>
          <label className="label-xs">Precio costo (CLP)</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400 text-sm">$</span>
            <input type="number" min="0" className="input pl-7" value={form.cost_price}
              onChange={e => f('cost_price')(Number(e.target.value))} />
          </div>
        </div>
        <div>
          <label className="label-xs">Unidad</label>
          <select className="input" value={form.unit} onChange={e => f('unit')(e.target.value)}>
            {['unidad','tubo','frasco','litro','rollo','caja','paquete','kg','ml'].map(u => <option key={u}>{u}</option>)}
          </select>
        </div>
      </div>
      <div className="flex gap-2 pt-1">
        <button className="btn-secondary flex-1" onClick={onClose}>Cancelar</button>
        <button className="btn-primary flex-1" disabled={!form.name} onClick={() => onSave(form)}>
          {initial.id ? 'Guardar' : 'Crear producto'}
        </button>
      </div>
    </div>
  )
}

// ── Movement Form ─────────────────────────────────────────────────────────────
function MovementForm({ item, onSave, onClose }) {
  const [type,   setType]   = useState('entrada')
  const [qty,    setQty]    = useState(1)
  const [reason, setReason] = useState('')

  const maxOut = item.stock

  return (
    <div className="space-y-5">
      {/* Item header */}
      <div className="flex items-center gap-3 p-4 bg-dark-50 rounded-xl">
        <div className="w-10 h-10 rounded-xl bg-dark-100 flex items-center justify-center">
          <Package size={18} className="text-dark-500" />
        </div>
        <div>
          <p className="font-medium text-dark-900">{item.name}</p>
          <p className="text-xs text-dark-500">{item.brand} · Stock actual: <strong>{item.stock} {item.unit}(s)</strong></p>
        </div>
      </div>

      {/* Type */}
      <div className="grid grid-cols-2 gap-2">
        {[
          ['entrada', 'Entrada (compra)', ArrowUpCircle,   'text-green-600'],
          ['salida',  'Salida (uso/venta)', ArrowDownCircle, 'text-amber-600'],
        ].map(([t, label, Icon, color]) => (
          <button key={t} onClick={() => setType(t)}
            className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all ${
              type === t ? 'border-dark-900 bg-dark-900 text-white' : 'border-dark-200 hover:border-dark-400'
            }`}>
            <Icon size={18} className={type === t ? 'text-white' : color} />
            <span className="text-sm font-medium">{label.split(' ')[0]}</span>
          </button>
        ))}
      </div>

      {/* Quantity */}
      <div>
        <label className="label-xs">Cantidad ({item.unit}s) *</label>
        <div className="flex items-center gap-3 mt-1.5">
          <button onClick={() => setQty(q => Math.max(1, q - 1))}
            className="w-9 h-9 rounded-lg border border-dark-200 flex items-center justify-center hover:bg-dark-50 transition-colors">
            <Minus size={14} />
          </button>
          <input type="number" min="1" max={type === 'salida' ? maxOut : 9999}
            className="input w-24 text-center font-semibold text-lg"
            value={qty} onChange={e => setQty(Math.max(1, Number(e.target.value)))} />
          <button onClick={() => setQty(q => q + 1)}
            className="w-9 h-9 rounded-lg border border-dark-200 flex items-center justify-center hover:bg-dark-50 transition-colors">
            <Plus size={14} />
          </button>
        </div>
        {type === 'salida' && qty > maxOut && (
          <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
            <AlertTriangle size={11}/> Stock insuficiente (disponible: {maxOut})
          </p>
        )}
      </div>

      {/* Reason */}
      <div>
        <label className="label-xs">Motivo *</label>
        <input className="input mt-1.5" placeholder={type === 'entrada' ? 'Ej: Compra proveedor Wella' : 'Ej: Uso en servicio balayage'}
          value={reason} onChange={e => setReason(e.target.value)} />
      </div>

      {/* Preview */}
      <div className={`flex items-center justify-between p-3 rounded-xl border ${
        type === 'entrada' ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'
      }`}>
        <span className="text-sm text-dark-700">Nuevo stock:</span>
        <span className={`font-semibold ${type === 'entrada' ? 'text-green-700' : 'text-amber-700'}`}>
          {type === 'entrada' ? item.stock + qty : Math.max(0, item.stock - qty)} {item.unit}(s)
        </span>
      </div>

      <div className="flex gap-2 pt-1">
        <button className="btn-secondary flex-1" onClick={onClose}>Cancelar</button>
        <button
          className="btn-primary flex-1"
          disabled={!reason || (type === 'salida' && qty > maxOut)}
          onClick={() => onSave(item.id, type, qty, reason)}>
          Registrar movimiento
        </button>
      </div>
    </div>
  )
}

// ── Product Row (expandable) ──────────────────────────────────────────────────
function ProductRow({ item, movements, onMove, onEdit, isAdmin }) {
  const [expanded, setExpanded] = useState(false)
  const status  = stockStatus(item)
  const itemMov = movements.filter(m => m.item_id === item.id).sort((a,b) => new Date(b.date)-new Date(a.date))

  return (
    <>
      <tr className={`hover:bg-dark-50 transition-colors ${status.urgent ? 'bg-red-50/30' : ''}`}>
        <td className="px-4 py-3">
          <div className="flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${status.dot}`} />
            <div>
              <p className="text-sm font-medium text-dark-900">{item.name}</p>
              {item.brand && <p className="text-xs text-dark-400">{item.brand}</p>}
            </div>
          </div>
        </td>
        <td className="px-4 py-3">
          <span className="text-xs px-2 py-0.5 bg-dark-100 text-dark-600 rounded-full">{item.category}</span>
        </td>
        <td className="px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="w-20 h-1.5 bg-dark-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  item.stock === 0 ? 'bg-red-400' :
                  item.stock <= item.stock_min ? 'bg-amber-400' : 'bg-green-400'
                }`}
                style={{ width: `${Math.min((item.stock / (item.stock_min * 3)) * 100, 100)}%` }}
              />
            </div>
            <span className={`text-sm font-semibold ${item.stock === 0 ? 'text-red-600' : item.stock <= item.stock_min ? 'text-amber-600' : 'text-dark-900'}`}>
              {item.stock}
            </span>
            <span className="text-xs text-dark-400">/ mín {item.stock_min} {item.unit}</span>
          </div>
        </td>
        <td className="px-4 py-3">
          <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${status.cls}`}>
            {status.label}
          </span>
        </td>
        <td className="px-4 py-3 text-sm text-dark-600">
          {item.cost_price ? `$${item.cost_price.toLocaleString('es-CL')}` : '—'}
        </td>
        <td className="px-4 py-3">
          <div className="flex items-center gap-1.5">
            {isAdmin && (
              <>
                <button onClick={() => onMove(item)}
                  className="p-1.5 rounded-lg hover:bg-dark-100 transition-colors text-dark-500"
                  title="Registrar movimiento">
                  <BarChart2 size={14} />
                </button>
                <button onClick={() => onEdit(item)}
                  className="p-1.5 rounded-lg hover:bg-dark-100 transition-colors text-dark-500">
                  <Edit2 size={14} />
                </button>
              </>
            )}
            <button onClick={() => setExpanded(e => !e)}
              className="p-1.5 rounded-lg hover:bg-dark-100 transition-colors text-dark-400">
              {expanded ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}
            </button>
          </div>
        </td>
      </tr>

      {/* Expanded: movement history */}
      {expanded && (
        <tr className="bg-dark-50/50">
          <td colSpan={6} className="px-6 py-3">
            {itemMov.length === 0 ? (
              <p className="text-xs text-dark-400 py-2">Sin movimientos registrados.</p>
            ) : (
              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                {itemMov.map(m => (
                  <div key={m.id} className="flex items-center gap-3 text-xs">
                    {m.type === 'entrada'
                      ? <ArrowUpCircle size={13} className="text-green-500 flex-shrink-0"/>
                      : <ArrowDownCircle size={13} className="text-amber-500 flex-shrink-0"/>
                    }
                    <span className={`font-medium w-12 ${m.type === 'entrada' ? 'text-green-700' : 'text-amber-700'}`}>
                      {m.type === 'entrada' ? '+' : '-'}{m.qty}
                    </span>
                    <span className="text-dark-600 flex-1">{m.reason}</span>
                    <span className="text-dark-400">{m.created_by}</span>
                    <span className="text-dark-400 flex-shrink-0">
                      {format(parseISO(m.date), 'd MMM', { locale: es })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </td>
        </tr>
      )}
    </>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function Inventario() {
  const { isAdmin } = useAuth()

  const [items,     setItems]     = useState(MOCK_INVENTORY)
  const [movements, setMovements] = useState(MOCK_MOVEMENTS)
  const [search,    setSearch]    = useState('')
  const [catFilter, setCatFilter] = useState('Todos')
  const [alertOnly, setAlertOnly] = useState(false)
  const [modal,     setModal]     = useState(null) // null | 'new' | 'edit' | 'move'
  const [selected,  setSelected]  = useState(null)

  const filtered = useMemo(() => {
    return items.filter(item => {
      if (alertOnly && item.stock > item.stock_min) return false
      if (catFilter !== 'Todos' && item.category !== catFilter) return false
      if (search) {
        const q = search.toLowerCase()
        return item.name.toLowerCase().includes(q) || item.brand?.toLowerCase().includes(q)
      }
      return true
    })
  }, [items, search, catFilter, alertOnly])

  const alerts = useMemo(() => items.filter(i => i.stock <= i.stock_min), [items])

  const stats = useMemo(() => ({
    total:      items.length,
    lowStock:   alerts.length,
    noStock:    items.filter(i => i.stock === 0).length,
    totalValue: items.reduce((s, i) => s + (i.cost_price || 0) * i.stock, 0),
  }), [items, alerts])

  function handleSaveProduct(form) {
    if (modal === 'edit') {
      setItems(prev => prev.map(i => i.id === selected.id ? { ...i, ...form } : i))
    } else {
      setItems(prev => [...prev, { id: 'i' + Date.now(), ...form }])
    }
    setModal(null)
    setSelected(null)
  }

  function handleMovement(itemId, type, qty, reason) {
    const delta = type === 'entrada' ? qty : -qty
    setItems(prev => prev.map(i => i.id === itemId ? { ...i, stock: Math.max(0, i.stock + delta) } : i))
    setMovements(prev => [{
      id: 'm' + Date.now(), item_id: itemId, type, qty,
      date: new Date().toISOString().split('T')[0],
      reason, created_by: 'Tú',
    }, ...prev])
    setModal(null)
    setSelected(null)
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Header */}
      <header className="flex items-center gap-4 px-6 py-4 bg-white border-b border-dark-100 flex-shrink-0 flex-wrap gap-y-3">
        <h1 className="font-serif text-xl text-dark-900">Inventario</h1>

        {/* Stats */}
        <div className="flex gap-5 ml-2">
          {[
            { label: 'productos',  value: stats.total,     color: '' },
            { label: 'stock bajo', value: stats.lowStock,  color: stats.lowStock  ? 'text-amber-600' : '' },
            { label: 'sin stock',  value: stats.noStock,   color: stats.noStock   ? 'text-red-600'   : '' },
            { label: 'valor stock',value: `$${Math.round(stats.totalValue/1000)}k`, color: '' },
          ].map(({ label, value, color }) => (
            <div key={label} className="text-center">
              <p className={`text-sm font-semibold ${color || 'text-dark-900'}`}>{value}</p>
              <p className="text-[10px] text-dark-400 uppercase tracking-wide">{label}</p>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 ml-auto flex-wrap">
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" />
            <input className="input pl-9 w-44 text-xs" placeholder="Buscar producto…"
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>

          <select className="input w-36 text-xs" value={catFilter} onChange={e => setCatFilter(e.target.value)}>
            <option value="Todos">Todas</option>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>

          <label className="flex items-center gap-1.5 text-xs text-dark-500 cursor-pointer select-none whitespace-nowrap">
            <input type="checkbox" className="rounded accent-amber-500"
              checked={alertOnly} onChange={e => setAlertOnly(e.target.checked)} />
            Solo alertas
            {alerts.length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded-full text-[10px] font-semibold">
                {alerts.length}
              </span>
            )}
          </label>

          {isAdmin && (
            <button onClick={() => setModal('new')} className="btn-primary text-xs flex items-center gap-1.5">
              <Plus size={13} /> Nuevo producto
            </button>
          )}
        </div>
      </header>

      {/* Alert banner */}
      {alerts.length > 0 && !alertOnly && (
        <div className="flex items-center gap-3 px-6 py-3 bg-amber-50 border-b border-amber-200">
          <AlertTriangle size={15} className="text-amber-500 flex-shrink-0" />
          <p className="text-sm text-amber-800">
            <strong>{alerts.length} producto{alerts.length > 1 ? 's' : ''}</strong> con stock bajo o agotado:
            <span className="font-normal ml-1">{alerts.map(i => i.name).join(', ')}</span>
          </p>
          <button onClick={() => setAlertOnly(true)}
            className="ml-auto text-xs text-amber-700 hover:underline whitespace-nowrap">
            Ver solo alertas →
          </button>
        </div>
      )}

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full">
          <thead className="sticky top-0 z-10">
            <tr className="bg-dark-50 border-b border-dark-100">
              {['Producto','Categoría','Stock','Estado','Costo',''].map(h => (
                <th key={h} className="text-left px-4 py-3 text-[10px] font-semibold text-dark-500 uppercase tracking-wider whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-50 bg-white">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-16 text-dark-400 text-sm">
                  <Package size={32} className="mx-auto mb-3 opacity-30" />
                  No hay productos que coincidan
                </td>
              </tr>
            ) : filtered.map(item => (
              <ProductRow
                key={item.id}
                item={item}
                movements={movements}
                onMove={i => { setSelected(i); setModal('move') }}
                onEdit={i => { setSelected(i); setModal('edit') }}
                isAdmin={isAdmin}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      <Modal open={modal === 'new'} onClose={() => setModal(null)} title="Nuevo producto" size="md">
        <ProductForm onSave={handleSaveProduct} onClose={() => setModal(null)} />
      </Modal>

      <Modal open={modal === 'edit'} onClose={() => { setModal(null); setSelected(null) }} title="Editar producto" size="md">
        <ProductForm initial={selected || {}} onSave={handleSaveProduct} onClose={() => { setModal(null); setSelected(null) }} />
      </Modal>

      <Modal open={modal === 'move'} onClose={() => { setModal(null); setSelected(null) }} title="Registrar movimiento" size="sm">
        {selected && (
          <MovementForm item={selected} onSave={handleMovement} onClose={() => { setModal(null); setSelected(null) }} />
        )}
      </Modal>
    </div>
  )
}
