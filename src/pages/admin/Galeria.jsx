import { useState, useMemo, useRef } from 'react'
import {
  Upload, Trash2, Eye, EyeOff, Edit2,
  X, Plus, Image, ExternalLink, Grid, List
} from 'lucide-react'
import { MOCK_GALLERY } from '../../lib/mockData'
import Modal from '../../components/ui/Modal'
import { useAuth } from '../../context/AuthContext'

const CATEGORIES = ['Corte', 'Color', 'Tratamientos', 'Otros']

// ── Photo Form ────────────────────────────────────────────────────────────────
function PhotoForm({ initial = {}, onSave, onClose }) {
  const [form, setForm] = useState({
    url:         initial.url         || '',
    title:       initial.title       || '',
    description: initial.description || '',
    category:    initial.category    || 'Corte',
    active:      initial.active      ?? true,
  })
  const [preview, setPreview] = useState(initial.url || '')
  const fileRef = useRef()

  const f = k => v => setForm(p => ({ ...p, [k]: v }))

  function handleFile(e) {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      const dataUrl = ev.target.result
      setPreview(dataUrl)
      f('url')(dataUrl)
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="space-y-4">
      {/* Image upload / URL */}
      <div>
        <label className="block text-xs font-medium text-dark-500 mb-2 uppercase tracking-wider">Imagen</label>

        {/* Preview */}
        {preview ? (
          <div className="relative rounded-xl overflow-hidden mb-3 aspect-video bg-dark-100">
            <img src={preview} alt="preview" className="w-full h-full object-cover" />
            <button
              onClick={() => { setPreview(''); f('url')('') }}
              className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-lg text-white hover:bg-black/80 transition-colors">
              <X size={12}/>
            </button>
          </div>
        ) : (
          <button
            onClick={() => fileRef.current?.click()}
            className="w-full aspect-video rounded-xl border-2 border-dashed border-dark-200 flex flex-col items-center justify-center gap-2 hover:border-brand-400 hover:bg-brand-50/50 transition-all mb-3">
            <Upload size={20} className="text-dark-400"/>
            <span className="text-xs text-dark-500">Click para subir imagen</span>
            <span className="text-[10px] text-dark-400">JPG, PNG, WEBP — máx. 5MB</span>
          </button>
        )}
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile}/>

        {/* URL alternativo */}
        <div className="flex gap-2 items-center">
          <div className="h-px flex-1 bg-dark-100"/>
          <span className="text-[10px] text-dark-400 uppercase tracking-wider">o pega URL</span>
          <div className="h-px flex-1 bg-dark-100"/>
        </div>
        <input className="input mt-2" placeholder="https://…" value={form.url.startsWith('data:') ? '' : form.url}
          onChange={e => { f('url')(e.target.value); setPreview(e.target.value) }} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="block text-xs font-medium text-dark-500 mb-1.5 uppercase tracking-wider">Título</label>
          <input className="input" placeholder="Ej: Balayage natural" value={form.title} onChange={e => f('title')(e.target.value)}/>
        </div>
        <div>
          <label className="block text-xs font-medium text-dark-500 mb-1.5 uppercase tracking-wider">Categoría</label>
          <select className="input" value={form.category} onChange={e => f('category')(e.target.value)}>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="flex items-end">
          <label className="flex items-center gap-2 text-sm cursor-pointer select-none w-full justify-between p-2.5 bg-dark-50 rounded-xl">
            <span className="text-dark-700 font-medium">Visible</span>
            <input type="checkbox" className="rounded w-4 h-4 accent-dark-900"
              checked={form.active} onChange={e => f('active')(e.target.checked)}/>
          </label>
        </div>
        <div className="col-span-2">
          <label className="block text-xs font-medium text-dark-500 mb-1.5 uppercase tracking-wider">Descripción</label>
          <textarea className="input resize-none h-16" placeholder="Describe el trabajo…"
            value={form.description} onChange={e => f('description')(e.target.value)}/>
        </div>
      </div>

      <div className="flex gap-2 pt-1">
        <button className="btn-secondary flex-1" onClick={onClose}>Cancelar</button>
        <button className="btn-primary flex-1" disabled={!form.url} onClick={() => onSave(form)}>
          {initial.id ? 'Guardar' : 'Subir foto'}
        </button>
      </div>
    </div>
  )
}

// ── Photo Card ────────────────────────────────────────────────────────────────
function PhotoCard({ photo, onEdit, onDelete, onToggle, isAdmin, onPreview }) {
  return (
    <div className={`group relative rounded-2xl overflow-hidden bg-dark-100 cursor-pointer transition-all hover:shadow-card-hover ${!photo.active ? 'opacity-50' : ''}`}>
      <div className="aspect-square" onClick={() => onPreview(photo)}>
        <img
          src={photo.url}
          alt={photo.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
          <p className="text-white text-sm font-medium leading-tight">{photo.title}</p>
          {photo.description && (
            <p className="text-white/70 text-[11px] mt-0.5 line-clamp-2">{photo.description}</p>
          )}
        </div>
      </div>

      {/* Category chip */}
      <div className="absolute top-2 left-2">
        <span className="text-[10px] px-2 py-0.5 bg-black/60 text-white rounded-full backdrop-blur-sm">
          {photo.category}
        </span>
      </div>

      {/* Admin actions */}
      {isAdmin && (
        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={e => { e.stopPropagation(); onEdit(photo) }}
            className="p-1.5 bg-white/90 rounded-lg hover:bg-white shadow-sm">
            <Edit2 size={12} className="text-dark-700"/>
          </button>
          <button onClick={e => { e.stopPropagation(); onToggle(photo.id) }}
            className="p-1.5 bg-white/90 rounded-lg hover:bg-white shadow-sm">
            {photo.active ? <EyeOff size={12} className="text-dark-700"/> : <Eye size={12} className="text-dark-700"/>}
          </button>
          <button onClick={e => { e.stopPropagation(); onDelete(photo.id) }}
            className="p-1.5 bg-white/90 rounded-lg hover:bg-red-50 shadow-sm">
            <Trash2 size={12} className="text-red-500"/>
          </button>
        </div>
      )}
    </div>
  )
}

// ── Lightbox ─────────────────────────────────────────────────────────────────
function Lightbox({ photo, onClose }) {
  if (!photo) return null
  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4" onClick={onClose}>
      <div className="relative max-w-3xl w-full" onClick={e => e.stopPropagation()}>
        <img src={photo.url} alt={photo.title} className="w-full rounded-2xl object-contain max-h-[80vh]"/>
        <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black/80 to-transparent rounded-b-2xl">
          <div className="flex items-end justify-between">
            <div>
              <span className="text-[10px] text-white/50 uppercase tracking-wider">{photo.category}</span>
              <p className="text-white font-medium mt-0.5">{photo.title}</p>
              {photo.description && <p className="text-white/60 text-xs mt-0.5">{photo.description}</p>}
            </div>
          </div>
        </div>
        <button onClick={onClose}
          className="absolute top-3 right-3 p-2 bg-black/60 rounded-xl text-white hover:bg-black/80 transition-colors">
          <X size={16}/>
        </button>
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function Galeria() {
  const { isAdmin } = useAuth()

  const [photos,  setPhotos]  = useState(MOCK_GALLERY)
  const [catFilter, setCat]   = useState('Todos')
  const [modal,   setModal]   = useState(null)  // null | 'new' | photo
  const [preview, setPreview] = useState(null)
  const [showAll, setShowAll] = useState(false)

  const filtered = useMemo(() => {
    let list = showAll ? photos : photos.filter(p => p.active)
    if (catFilter !== 'Todos') list = list.filter(p => p.category === catFilter)
    return list
  }, [photos, catFilter, showAll])

  function handleSave(form) {
    if (modal?.id) {
      setPhotos(prev => prev.map(p => p.id === modal.id ? { ...p, ...form } : p))
    } else {
      setPhotos(prev => [...prev, { id: 'g' + Date.now(), ...form }])
    }
    setModal(null)
  }

  function handleDelete(id) {
    if (confirm('¿Eliminar esta foto de la galería?'))
      setPhotos(prev => prev.filter(p => p.id !== id))
  }

  function handleToggle(id) {
    setPhotos(prev => prev.map(p => p.id === id ? { ...p, active: !p.active } : p))
  }

  const stats = {
    total:   photos.length,
    active:  photos.filter(p => p.active).length,
    bycat:   CATEGORIES.reduce((a, c) => ({ ...a, [c]: photos.filter(p => p.category === c && p.active).length }), {}),
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Header */}
      <header className="flex items-center gap-4 px-6 py-4 bg-white border-b border-dark-100 flex-shrink-0 flex-wrap gap-y-3">
        <h1 className="font-serif text-xl text-dark-900">Galería</h1>

        {/* Stats */}
        <div className="flex gap-4 ml-2">
          {[
            { label: 'fotos',    value: stats.active },
            ...CATEGORIES.map(c => ({ label: c, value: stats.bycat[c] || 0 })),
          ].map(({ label, value }) => (
            <div key={label} className="text-center">
              <p className="text-sm font-semibold text-dark-900">{value}</p>
              <p className="text-[10px] text-dark-400 uppercase tracking-wide">{label}</p>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 ml-auto flex-wrap">
          {/* Category filter */}
          <div className="flex gap-1">
            {['Todos', ...CATEGORIES].map(c => (
              <button key={c} onClick={() => setCat(c)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  catFilter === c ? 'bg-dark-900 text-white' : 'text-dark-500 hover:bg-dark-50'
                }`}>
                {c}
              </button>
            ))}
          </div>

          {isAdmin && (
            <>
              <label className="flex items-center gap-1.5 text-xs text-dark-500 cursor-pointer select-none">
                <input type="checkbox" className="rounded" checked={showAll} onChange={e => setShowAll(e.target.checked)}/>
                Ver ocultas
              </label>
              <a href="/galeria" target="_blank" className="btn-secondary text-xs flex items-center gap-1.5">
                <ExternalLink size={12}/> Ver pública
              </a>
              <button onClick={() => setModal('new')} className="btn-primary text-xs flex items-center gap-1.5">
                <Plus size={13}/> Subir foto
              </button>
            </>
          )}
        </div>
      </header>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto p-6">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-dark-400 gap-3">
            <Image size={40} className="opacity-30"/>
            <p className="text-sm">No hay fotos en esta categoría</p>
            {isAdmin && (
              <button onClick={() => setModal('new')} className="btn-primary text-xs flex items-center gap-1.5">
                <Plus size={13}/> Subir primera foto
              </button>
            )}
          </div>
        ) : (
          <div className="columns-2 sm:columns-3 lg:columns-4 gap-4 space-y-4">
            {filtered.map(photo => (
              <div key={photo.id} className="break-inside-avoid">
                <PhotoCard
                  photo={photo}
                  onEdit={setModal}
                  onDelete={handleDelete}
                  onToggle={handleToggle}
                  onPreview={setPreview}
                  isAdmin={isAdmin}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <Modal open={!!modal} onClose={() => setModal(null)}
        title={modal === 'new' ? 'Subir foto' : 'Editar foto'} size="md">
        <PhotoForm initial={modal === 'new' ? {} : modal || {}} onSave={handleSave} onClose={() => setModal(null)}/>
      </Modal>

      <Lightbox photo={preview} onClose={() => setPreview(null)}/>
    </div>
  )
}
