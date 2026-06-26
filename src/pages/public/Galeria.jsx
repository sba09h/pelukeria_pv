import { useState, useMemo } from 'react'
import { ArrowLeft, ArrowRight, X, ChevronLeft, ChevronRight, Instagram } from 'lucide-react'
import { MOCK_GALLERY } from '../../lib/mockData'
import Logo from '../../components/ui/Logo'

const CATEGORIES = ['Todos', 'Corte', 'Color', 'Tratamientos', 'Otros']

// ── Lazy image: carga nativa + skeleton + fade-in ────────────────────────────
function LazyImage({ src, alt, className, eager = false }) {
  const [loaded, setLoaded] = useState(false)

  return (
    <div className="relative">
      {/* Skeleton — desaparece al cargar */}
      <div className={`absolute inset-0 bg-dark-100 transition-opacity duration-300 pointer-events-none ${loaded ? 'opacity-0' : 'animate-pulse'}`} />
      <img
        src={src}
        alt={alt}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        className={`${className} transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        onLoad={() => setLoaded(true)}
      />
    </div>
  )
}

// ── Lightbox ──────────────────────────────────────────────────────────────────
function Lightbox({ photos, index, onClose, onPrev, onNext }) {
  if (index === null) return null
  const photo = photos[index]

  return (
    <div className="fixed inset-0 z-50 bg-black/95" onClick={onClose}>
      {/* Close */}
      <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-white/10 rounded-xl text-white hover:bg-white/20 transition-colors z-10">
        <X size={18}/>
      </button>

      {/* Counter */}
      <div className="absolute top-4 left-4 text-white/50 text-xs z-10">
        {index + 1} / {photos.length}
      </div>

      {/* Image */}
      <div className="flex items-center justify-center h-full px-16" onClick={e => e.stopPropagation()}>
        <img
          src={photo.url}
          alt={photo.title}
          className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl"
        />
      </div>

      {/* Caption */}
      <div className="absolute bottom-0 left-0 right-0 p-6 text-center">
        <span className="text-[10px] text-white/40 uppercase tracking-widest">{photo.category}</span>
        <p className="text-white font-medium mt-1">{photo.title}</p>
        {photo.description && <p className="text-white/50 text-xs mt-0.5">{photo.description}</p>}
      </div>

      {/* Nav arrows */}
      {index > 0 && (
        <button onClick={e => { e.stopPropagation(); onPrev() }}
          className="absolute left-4 top-1/2 -translate-y-1/2 p-2.5 bg-white/10 rounded-xl text-white hover:bg-white/20 transition-colors">
          <ChevronLeft size={22}/>
        </button>
      )}
      {index < photos.length - 1 && (
        <button onClick={e => { e.stopPropagation(); onNext() }}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-2.5 bg-white/10 rounded-xl text-white hover:bg-white/20 transition-colors">
          <ChevronRight size={22}/>
        </button>
      )}
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function GaleriaPublico() {
  const [cat,      setCat]      = useState('Todos')
  const [lightbox, setLightbox] = useState(null)

  const photos = MOCK_GALLERY.filter(p => p.active !== false)

  const filtered = useMemo(() =>
    cat === 'Todos' ? photos : photos.filter(p => p.category === cat),
    [cat, photos]
  )

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <header className="sticky top-0 z-20 bg-white/95 backdrop-blur border-b border-dark-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Logo size="sm" href="/"/>
          <nav className="hidden md:flex items-center gap-6 text-sm text-dark-500">
            <a href="/servicios"  className="hover:text-dark-900 transition-colors">Servicios</a>
            <a href="/mis-puntos" className="hover:text-dark-900 transition-colors">Mis puntos</a>
            <a href="/agendar"    className="btn-primary text-xs px-4 py-2">Reservar hora</a>
          </nav>
          <a href="/" className="md:hidden text-sm text-dark-400 flex items-center gap-1">
            <ArrowLeft size={14}/> Volver
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-dark-900 text-white py-20 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'radial-gradient(circle, #C8B89A 1px, transparent 1px)', backgroundSize: '28px 28px' }}/>
        <div className="relative max-w-2xl mx-auto">
          <p className="text-brand-400 text-xs tracking-[0.3em] uppercase mb-4">Portfolio</p>
          <h1 className="font-serif text-5xl font-light mb-4">Nuestro trabajo</h1>
          <p className="text-dark-400 text-sm leading-relaxed max-w-md mx-auto">
            Cada imagen cuenta una historia de transformación. Aquí encontrarás una muestra de lo que hacemos con amor y técnica.
          </p>
        </div>
      </section>

      {/* Filters */}
      <div className="sticky top-16 z-10 bg-white border-b border-dark-100">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex gap-1 overflow-x-auto">
            {CATEGORIES.map(c => (
              <button key={c} onClick={() => setCat(c)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all flex-shrink-0 ${
                  cat === c ? 'bg-dark-900 text-white' : 'text-dark-500 hover:bg-dark-50'
                }`}>
                {c}
                {c === 'Todos'
                  ? <span className="ml-1 text-xs opacity-50">({photos.length})</span>
                  : <span className="ml-1 text-xs opacity-50">({photos.filter(p=>p.category===c).length})</span>
                }
              </button>
            ))}
          </div>
          <a href="https://www.instagram.com/lapelukeria_pv"
            target="_blank" rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1.5 text-xs text-dark-500 hover:text-dark-900 transition-colors ml-4 flex-shrink-0">
            <Instagram size={14}/> @lapelukeria_pv
          </a>
        </div>
      </div>

      {/* Masonry gallery */}
      <div className="max-w-6xl mx-auto px-6 py-10">
        {filtered.length === 0 ? (
          <div className="text-center py-24 text-dark-400">
            <p className="text-sm">No hay fotos en esta categoría todavía.</p>
          </div>
        ) : (
          <div className="columns-2 sm:columns-3 lg:columns-4 gap-3 space-y-3">
            {filtered.map((photo, i) => (
              <div key={photo.id} className="break-inside-avoid group cursor-pointer"
                onClick={() => setLightbox(i)}>
                <div className="relative rounded-2xl overflow-hidden bg-dark-100">
                  <LazyImage
                    src={photo.url}
                    alt={photo.title}
                    eager={i < 8}
                    className="w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <span className="text-[10px] text-white/60 uppercase tracking-wider">{photo.category}</span>
                      <p className="text-white text-sm font-medium leading-tight mt-0.5">{photo.title}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Instagram CTA */}
      <section className="bg-dark-900 py-16 px-6 text-center">
        <div className="max-w-xl mx-auto">
          <Instagram size={28} className="text-brand-400 mx-auto mb-4"/>
          <h2 className="font-serif text-2xl text-white mb-2">Síguenos en Instagram</h2>
          <p className="text-dark-400 text-sm mb-6">
            Más trabajo, tutoriales y novedades todos los días en nuestro perfil.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href="https://www.instagram.com/lapelukeria_pv" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-brand-400 text-white rounded-xl text-sm font-medium hover:bg-brand-500 transition-colors">
              <Instagram size={16}/> @lapelukeria_pv
            </a>
            <a href="/agendar"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/10 text-white rounded-xl text-sm font-medium hover:bg-white/20 transition-colors">
              Agendar hora <ArrowRight size={15}/>
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-dark-100 py-8 px-6 text-center text-xs text-dark-400">
        <Logo size="sm"/>
        <p className="mt-4">© {new Date().getFullYear()} La Pelukeria · Puerto Varas, Chile</p>
      </footer>

      {/* Lightbox */}
      <Lightbox
        photos={filtered}
        index={lightbox}
        onClose={() => setLightbox(null)}
        onPrev={() => setLightbox(i => Math.max(0, i - 1))}
        onNext={() => setLightbox(i => Math.min(filtered.length - 1, i + 1))}
      />
    </div>
  )
}
