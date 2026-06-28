import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { MOCK_GALLERY } from '../../lib/mockData'
import useSEO from '../../hooks/useSEO'

// ── Keyframes injected once ───────────────────────────────────────────────────
const KEYFRAMES = `
  @keyframes lpkBlob1 {
    0%,100% { transform:translate(0,0) scale(1);          opacity:.42; }
    38%     { transform:translate(65px,-42px) scale(1.13); opacity:.64; }
    70%     { transform:translate(-18px,28px) scale(.93);  opacity:.34; }
  }
  @keyframes lpkBlob2 {
    0%,100% { transform:translate(0,0) scale(1);          opacity:.28; }
    34%     { transform:translate(-62px,46px) scale(1.2);  opacity:.46; }
    64%     { transform:translate(36px,-14px) scale(.9);   opacity:.22; }
  }
  @keyframes lpkBlob3 {
    0%,100% { transform:translate(0,0);        opacity:.16; }
    50%     { transform:translate(28px,-52px); opacity:.28; }
  }
  @keyframes lpkLineDraw {
    from { transform:scaleX(0); transform-origin:left center; }
    to   { transform:scaleX(1); transform-origin:left center; }
  }
  @keyframes lpkBounce {
    0%,100% { transform:translateX(-50%) translateY(0); }
    50%     { transform:translateX(-50%) translateY(7px); }
  }
`

// ── Logo ──────────────────────────────────────────────────────────────────────
// mode: 'dark' = blanco sobre fondo oscuro (screen blend), 'light' = logo normal
function LPKLogo({ size = 40, onClick, mode = 'dark' }) {
  return (
    <img
      src="/logo.webp"
      alt="La Pelukeria"
      onClick={onClick}
      style={{
        height: size,
        width: 'auto',
        objectFit: 'contain',
        cursor: onClick ? 'pointer' : 'default',
        mixBlendMode: 'normal',
        filter: 'none',
        opacity: mode === 'dark' ? 0.95 : 0.85,
        transition: 'opacity 200ms ease',
      }}
      onMouseEnter={e => { if (onClick) e.currentTarget.style.opacity = '0.65' }}
      onMouseLeave={e => { if (onClick) e.currentTarget.style.opacity = mode === 'dark' ? '1' : '0.9' }}
    />
  )
}

// ── Navbar ────────────────────────────────────────────────────────────────────
function Navbar({ currentPage, navigate }) {
  const [scrolled, setScrolled] = useState(false)
  const [adminHov, setAdminHov] = useState(false)

  useEffect(() => {
    if (currentPage !== 'home') { setScrolled(false); return }
    const check = () => setScrolled(window.scrollY > window.innerHeight * 0.72)
    check()
    window.addEventListener('scroll', check, { passive: true })
    return () => window.removeEventListener('scroll', check)
  }, [currentPage])

  const isHome = currentPage === 'home'
  const dark   = isHome && !scrolled

  const fg      = dark ? 'rgba(255,255,255,0.88)' : 'var(--color-black)'
  const fgMuted = dark ? 'rgba(255,255,255,0.42)' : 'var(--text-secondary)'
  const activeBdr = dark ? 'rgba(255,255,255,0.6)' : 'var(--color-black)'

  const links = [
    { key: 'home',     label: 'Inicio',    path: '/'          },
    { key: 'services', label: 'Servicios', path: '/servicios' },
    { key: 'gallery',  label: 'Galería',   path: '/galeria'   },
  ]

  return (
    <nav style={{
      position: isHome ? 'fixed' : 'sticky',
      top: isHome ? '18px' : 0,
      left: isHome ? '50%' : 0,
      right: isHome ? 'auto' : 0,
      transform: isHome ? 'translateX(-50%)' : 'none',
      width: isHome ? 'calc(100% - 80px)' : '100%',
      maxWidth: isHome ? '1200px' : 'none',
      zIndex: 100,
      height: '56px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 28px',
      background: dark
        ? 'rgba(13,12,10,0.38)'
        : 'rgba(255,255,255,0.92)',
      backdropFilter: 'blur(28px) saturate(1.4)',
      WebkitBackdropFilter: 'blur(28px) saturate(1.4)',
      borderRadius: isHome ? '14px' : '0',
      border: dark
        ? '1px solid rgba(255,255,255,0.09)'
        : '1px solid rgba(0,0,0,0.08)',
      boxShadow: dark
        ? '0 4px 32px rgba(0,0,0,0.32), inset 0 1px 0 rgba(255,255,255,0.06)'
        : '0 2px 20px rgba(0,0,0,0.08)',
      transition: 'background 420ms ease, border-color 420ms ease, top 420ms ease, border-radius 420ms ease, box-shadow 420ms ease',
    }}>
      <LPKLogo size={38} onClick={() => navigate('/')} />

      {/* Nav links */}
      <div style={{ display: 'flex', gap: '36px' }}>
        {links.map(link => {
          const active = currentPage === link.key
          return (
            <button key={link.key} onClick={() => navigate(link.path)} style={{
              fontFamily: 'var(--font-body)', fontSize: '10px', fontWeight: 500,
              letterSpacing: '0.2em', textTransform: 'uppercase',
              color: active ? fg : fgMuted,
              background: 'none', border: 'none',
              borderBottom: active ? `1px solid ${activeBdr}` : '1px solid transparent',
              paddingBottom: '2px', cursor: 'pointer',
              transition: 'color 300ms ease, border-color 300ms ease',
            }}
            onMouseEnter={e => { if (!active) e.currentTarget.style.color = fg }}
            onMouseLeave={e => { if (!active) e.currentTarget.style.color = fgMuted }}>
              {link.label}
            </button>
          )
        })}
      </div>

      {/* Acceso equipo */}
      <button
        onMouseEnter={() => setAdminHov(true)}
        onMouseLeave={() => setAdminHov(false)}
        onClick={() => navigate('/login')}
        style={{
          fontFamily: 'var(--font-body)', fontSize: '9px', fontWeight: 500,
          letterSpacing: '0.18em', textTransform: 'uppercase',
          color: dark ? 'rgba(255,255,255,0.28)' : 'rgba(0,0,0,0.3)',
          opacity: adminHov ? 1 : 0.7,
          background: 'none', border: 'none', padding: 0,
          cursor: 'pointer',
          transition: 'all 250ms ease',
          display: 'flex', alignItems: 'center', gap: '4px',
        }}>
        Acceso equipo
        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M7 17L17 7M7 7h10v10"/>
        </svg>
      </button>
    </nav>
  )
}

// ── Footer ────────────────────────────────────────────────────────────────────
function Footer({ navigate }) {
  const col = { fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'rgba(255,255,255,0.45)', lineHeight: 2 }
  const colLabel = { fontFamily: 'var(--font-body)', fontSize: '8px', fontWeight: 500, letterSpacing: '0.22em', textTransform: 'uppercase', opacity: 0.3, marginBottom: '14px', display: 'block' }

  return (
    <footer style={{ background: 'var(--color-warm-950)', color: 'white', padding: '64px 48px 28px' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '48px', paddingBottom: '32px' }}>
          <div>
            <LPKLogo size={48} />
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'rgba(255,255,255,0.35)', lineHeight: 1.8, maxWidth: '280px', marginTop: '20px' }}>
              Peluquería moderna y minimalista en Puerto Varas. Corte, color y tratamientos de alta gama.
            </p>
          </div>
          <div>
            <span style={colLabel}>Horario</span>
            <div style={col}>
              <div>Mar – Vie · 9:30 – 19:00</div>
              <div>Sábado · 10:00 – 18:00</div>
              <div style={{ opacity: 0.4 }}>Lun – Dom · Cerrado</div>
            </div>
          </div>
          <div>
            <span style={colLabel}>Contacto</span>
            <div style={col}>
              <div>Decher 60, Local N°5</div>
              <div>Puerto Varas, Los Lagos</div>
              <div>+56 9 2999 3799</div>
              <div>@lapelukeria_pv</div>
            </div>
          </div>
        </div>

        {/* Google Maps */}
        <div style={{ margin: '32px 0', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.07)' }}>
          <iframe
            title="La Pelukeria — Mapa"
            src="https://www.google.com/maps?q=Decher+60,+Puerto+Varas,+Chile&output=embed"
            width="100%"
            height="220"
            style={{ border: 0, display: 'block', filter: 'brightness(0.72) saturate(0.85)' }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: '9px', color: 'rgba(255,255,255,0.18)', letterSpacing: '0.1em' }}>
            © {new Date().getFullYear()} La Pelukeria · Puerto Varas
          </div>
          <button onClick={() => navigate('/login')} style={{ fontFamily: 'var(--font-body)', fontSize: '8px', color: 'rgba(255,255,255,0.15)', letterSpacing: '0.12em', textTransform: 'uppercase', background: 'none', border: 'none', cursor: 'pointer', transition: 'color 200ms' }}
            onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.45)'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.15)'}>
            Acceso equipo ↗
          </button>
        </div>
      </div>
    </footer>
  )
}


// ── Hero background — orbs cálidos en canvas ─────────────────────────────────
function HeroBg() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight }
    resize()
    window.addEventListener('resize', resize)

    // Orbs: posición, tamaño, color y movimiento distintos
    const orbs = [
      { x:.72, y:-.06, r:.64, col:[148,128,96],  op:.46, spd:14, ph:0   },  // ámbar cálido
      { x:-.08,y:.90,  r:.58, col:[88, 72, 52],  op:.52, spd:19, ph:2.1 },  // tierra oscura
      { x:.48, y:.38,  r:.42, col:[192,168,128], op:.14, spd:24, ph:4.4 },  // beige suave
      { x:.88, y:.62,  r:.38, col:[168,118,60],  op:.22, spd:16, ph:1.5 },  // cobre
      { x:.18, y:.18,  r:.34, col:[104,86,62],   op:.18, spd:21, ph:3.2 },  // marrón
    ]

    // Offscreen grain canvas
    let grainCanvas, grainCtx, grainFrame = 0
    grainCanvas = document.createElement('canvas')
    grainCanvas.width  = 256
    grainCanvas.height = 256
    grainCtx = grainCanvas.getContext('2d')

    const updateGrain = () => {
      const id = grainCtx.createImageData(256, 256)
      const d  = id.data
      for (let i = 0; i < d.length; i += 4) {
        const v = Math.random() * 255 | 0
        d[i] = d[i+1] = d[i+2] = v
        d[i+3] = Math.random() * 18 | 0   // muy baja opacidad
      }
      grainCtx.putImageData(id, 0, 0)
    }
    updateGrain()

    let t = 0, animId
    const draw = () => {
      const W = canvas.width, H = canvas.height
      ctx.clearRect(0, 0, W, H)

      orbs.forEach(o => {
        const px = (o.x + Math.sin(t / o.spd       + o.ph) * .09) * W
        const py = (o.y + Math.cos(t / o.spd * .65 + o.ph) * .07) * H
        const rad = o.r * Math.max(W, H) * .72

        ctx.save()
        // Aplana el orb verticalmente para dar forma elíptica
        ctx.translate(px, py)
        ctx.scale(1, .72)
        const g = ctx.createRadialGradient(0, 0, 0, 0, 0, rad)
        const [r, g_, b] = o.col
        g.addColorStop(0,    `rgba(${r},${g_},${b},${o.op})`)
        g.addColorStop(.38,  `rgba(${r},${g_},${b},${(o.op * .38).toFixed(3)})`)
        g.addColorStop(1,    `rgba(${r},${g_},${b},0)`)
        ctx.beginPath()
        ctx.arc(0, 0, rad, 0, Math.PI * 2)
        ctx.fillStyle = g
        ctx.fill()
        ctx.restore()
      })

      // Grain refresh cada 3 frames para efecto de película
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

  return (
    <canvas ref={canvasRef} style={{
      position:'absolute', inset:0, width:'100%', height:'100%',
      pointerEvents:'none', zIndex:0,
    }}/>
  )
}

// ── Floating particles ────────────────────────────────────────────────────────
function Particles() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    const resize = () => {
      canvas.width  = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    resize()
    window.addEventListener('resize', resize)

    // 60 partículas: mezcla de puntos blancos y dorado-cálido
    const particles = Array.from({ length: 60 }, () => ({
      x:       Math.random(),           // 0-1 normalizado
      y:       Math.random(),
      r:       Math.random() * 2.4 + 0.8,            // radio 0.8–3.2 px
      opacity: Math.random() * 0.45 + 0.12,          // 0.12–0.57
      vy:      -(Math.random() * 0.25 + 0.08),       // sube lento
      vx:      (Math.random() - 0.5) * 0.12,         // leve deriva horizontal
      warm:    Math.random(),                          // 0=blanco, 1=dorado suave
      pulse:   Math.random() * Math.PI * 2,           // fase de pulso
      pulseSpeed: Math.random() * 0.012 + 0.004,     // velocidad del pulso
    }))

    let animId
    const W = () => canvas.width
    const H = () => canvas.height

    const draw = () => {
      ctx.clearRect(0, 0, W(), H())

      particles.forEach(p => {
        // Pulso de opacidad suave
        p.pulse += p.pulseSpeed
        const op = p.opacity * (0.7 + 0.3 * Math.sin(p.pulse))

        // Color: blanco puro → dorado cálido
        const r = 255
        const g = Math.round(255 - p.warm * 38)   // 217–255
        const b = Math.round(255 - p.warm * 115)  // 140–255

        ctx.beginPath()
        ctx.arc(p.x * W(), p.y * H(), p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${r},${g},${b},${op})`
        ctx.fill()

        // Movimiento
        p.x += p.vx / W()
        p.y += p.vy / H()

        // Reiniciar al salir por arriba
        if (p.y < -0.02) {
          p.y = 1.02
          p.x = Math.random()
        }
        if (p.x < -0.02) p.x = 1.02
        if (p.x > 1.02)  p.x = -0.02
      })

      animId = requestAnimationFrame(draw)
    }
    draw()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute', inset: 0,
        width: '100%', height: '100%',
        pointerEvents: 'none', zIndex: 1,
      }}
    />
  )
}

// ── Hero ──────────────────────────────────────────────────────────────────────────────────────────
function Hero({ navigate }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60)
    return () => clearTimeout(t)
  }, [])

  const fu = (d) => ({
    opacity:   mounted ? 1 : 0,
    transform: mounted ? 'translateY(0px)' : 'translateY(26px)',
    transition: `opacity .72s cubic-bezier(.16,1,.3,1) ${d}s, transform .72s cubic-bezier(.16,1,.3,1) ${d}s`,
  })

  return (
    <section style={{ height: '100vh', background: '#0D0C0A', position: 'relative', overflow: 'hidden' }}>

      {/* Fondo animado — orbs cálidos + grain */}
      <HeroBg />

      {/* Partículas flotantes */}
      <Particles />

      {/* Overlays: grid + viñetas */}
      <div style={{ position:'absolute', inset:0, pointerEvents:'none', zIndex:2 }}>
        {/* Pixel grid */}
        <div style={{ position:'absolute', inset:0, backgroundImage:'linear-gradient(rgba(255,255,255,.014) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.014) 1px, transparent 1px)', backgroundSize:'80px 80px' }} />
        {/* Viñeta inferior */}
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(to bottom, transparent 28%, rgba(10,9,8,.88) 100%)' }} />
        {/* Viñeta lateral izquierda */}
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(to right, rgba(10,9,8,.38) 0%, transparent 55%)' }} />
        {/* Viñeta superior */}
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(to bottom, rgba(10,9,8,.45) 0%, transparent 22%)' }} />
      </div>


      {/* H1 oculto para crawlers — contenido SEO visible para Google, invisible visualmente */}
      <h1 style={{ position:'absolute', width:'1px', height:'1px', overflow:'hidden', clip:'rect(0,0,0,0)', whiteSpace:'nowrap', border:0, margin:'-1px', padding:0 }}>
        La Pelukeria — Peluquería en Puerto Varas · Corte, Balayage, Color y Tratamientos Capilares
      </h1>

      {/* Hero copy */}
      <div style={{ position:'absolute', bottom:'84px', left:'56px', right:'50%', minWidth:'420px', zIndex:2 }}>
        <div style={{ fontFamily:'var(--font-body)', fontSize:'9.6px', fontWeight:500, letterSpacing:'0.35em', textTransform:'uppercase', color:'rgba(255,255,255,.36)', marginBottom:'18px', ...fu(0.28) }}>
          Puerto Varas · Chile
        </div>
        <div style={{ fontFamily:'var(--font-display)', fontWeight:300, fontSize:'clamp(65px,10.2vw,134px)', lineHeight:.88, letterSpacing:'-0.04em', color:'white', marginBottom:'4px', ...fu(0.45) }}>
          La
        </div>
        <div style={{ fontFamily:'var(--font-display)', fontWeight:300, fontSize:'clamp(65px,10.2vw,134px)', lineHeight:.88, letterSpacing:'-0.04em', color:'white', marginBottom:'22px', ...fu(0.58) }}>
          Pelukeria
        </div>
        <div style={{ fontFamily:'var(--font-display)', fontStyle:'italic', fontWeight:300, fontSize:'1.14rem', color:'rgba(255,255,255,.3)', marginBottom:'40px', ...fu(0.8) }}>
          Hair Salon
        </div>
        <div style={{ display:'flex', gap:'10px', ...fu(1.0) }}>
          <button onClick={() => navigate('/agendar')}
            style={{ background:'white', color:'#0D0C0A', border:'1px solid white', padding:'15px 44px', fontFamily:'var(--font-body)', fontSize:'11px', fontWeight:600, letterSpacing:'0.22em', textTransform:'uppercase', cursor:'pointer', transition:'all 220ms ease', boxShadow:'0 0 32px rgba(255,255,255,0.18)' }}
            onMouseEnter={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.color='white';e.currentTarget.style.boxShadow='none';}}
            onMouseLeave={e=>{e.currentTarget.style.background='white';e.currentTarget.style.color='#0D0C0A';e.currentTarget.style.boxShadow='0 0 32px rgba(255,255,255,0.18)';}}>
            Reservar hora
          </button>
          <button onClick={() => navigate('/servicios')}
            style={{ background:'transparent', color:'rgba(255,255,255,.65)', border:'1px solid rgba(255,255,255,.15)', padding:'15px 28px', fontFamily:'var(--font-body)', fontSize:'11px', fontWeight:500, letterSpacing:'0.2em', textTransform:'uppercase', cursor:'pointer', transition:'all 200ms ease' }}
            onMouseEnter={e=>{e.currentTarget.style.color='white';e.currentTarget.style.borderColor='rgba(255,255,255,.32)';}}
            onMouseLeave={e=>{e.currentTarget.style.color='rgba(255,255,255,.65)';e.currentTarget.style.borderColor='rgba(255,255,255,.15)';}}>
            Ver servicios
          </button>
        </div>
      </div>

      {/* Scroll indicator */}
      {mounted && (
        <div style={{ position:'absolute', bottom:'28px', left:'50%', display:'flex', flexDirection:'column', alignItems:'center', gap:'8px', animation:'lpkBounce 2.2s ease-in-out 1.4s infinite', zIndex:3 }}>
          <div style={{ fontFamily:'var(--font-body)', fontSize:'7px', letterSpacing:'0.22em', textTransform:'uppercase', color:'rgba(255,255,255,.17)' }}>Scroll</div>
          <div style={{ width:'1px', height:'36px', background:'linear-gradient(to bottom, rgba(255,255,255,.14), transparent)' }} />
        </div>
      )}
    </section>
  )
}

// ── Services Section ──────────────────────────────────────────────────────────
function ServicesSection({ navigate }) {
  const [visible, setVisible] = useState(false)
  const [hov,     setHov]     = useState(null)
  const ref = useRef(null)

  useEffect(() => {
    const io = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) setVisible(true)
    }, { threshold: 0.12 })
    if (ref.current) io.observe(ref.current)
    return () => io.disconnect()
  }, [])

  const sr = (d) => ({
    opacity:    visible ? 1 : 0,
    transform:  visible ? 'translateY(0px)' : 'translateY(22px)',
    transition: `opacity .6s cubic-bezier(.16,1,.3,1) ${d}s, transform .6s cubic-bezier(.16,1,.3,1) ${d}s`,
  })

  const services = [
    { num: '01', name: 'Corte',        desc: 'Corte artístico adaptado a tu morfología facial y estilo de vida.',  price: 'desde $10.000' },
    { num: '02', name: 'Color',        desc: 'Técnicas de alta gama: Balayage, mechas, tinte, decoloración.',      price: 'desde $35.000' },
    { num: '03', name: 'Tratamientos', desc: 'Nutrición profunda y restauración de la fibra capilar.',             price: 'desde $20.000' },
  ]

  return (
    <section ref={ref} style={{ padding:'96px 48px', maxWidth:'1280px', margin:'0 auto' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:'48px', paddingBottom:'20px', borderBottom:'1px solid var(--border-default)', ...sr(0) }}>
        <h2 style={{ fontFamily:'var(--font-display)', fontSize:'var(--text-4xl)', fontWeight:300, letterSpacing:'-0.02em' }}>Servicios</h2>
        <button onClick={() => navigate('/servicios')} style={{ fontFamily:'var(--font-body)', fontSize:'var(--text-xs)', fontWeight:500, letterSpacing:'0.15em', textTransform:'uppercase', color:'var(--text-secondary)', background:'none', border:'none', borderBottom:'1px solid var(--border-default)', paddingBottom:'1px', cursor:'pointer' }}>
          Ver todos →
        </button>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'1px', background:'var(--border-default)' }}>
        {services.map((s, i) => (
          <div key={i} style={{ ...sr(0.1 + i * 0.1) }}>
            <div
              onMouseEnter={() => setHov(i)} onMouseLeave={() => setHov(null)}
              onClick={() => navigate('/servicios')}
              style={{ height:'100%', background:hov===i?'#000':'#fff', color:hov===i?'white':'inherit', padding:'48px 40px', cursor:'pointer', transition:'background 220ms ease, color 220ms ease' }}>
              <div style={{ fontFamily:'var(--font-body)', fontSize:'9px', fontWeight:500, letterSpacing:'0.2em', textTransform:'uppercase', color:hov===i?'rgba(255,255,255,.3)':'var(--text-muted)', marginBottom:'20px' }}>{s.num}</div>
              <h3 style={{ fontFamily:'var(--font-display)', fontSize:'var(--text-3xl)', fontWeight:300, marginBottom:'14px' }}>{s.name}</h3>
              <p style={{ fontFamily:'var(--font-body)', fontSize:'var(--text-sm)', lineHeight:1.75, color:hov===i?'rgba(255,255,255,.5)':'var(--text-secondary)', marginBottom:'28px' }}>{s.desc}</p>
              <div style={{ fontFamily:'var(--font-body)', fontSize:'var(--text-sm)', fontWeight:500 }}>{s.price}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

// Portfolio photos (from /public/portafolio/)
const PORTFOLIO_PHOTOS = Array.from({ length: 15 }, (_, i) =>
  `/portafolio/lpk_portfolio_${String(i + 1).padStart(2, '0')}.webp`
)

const SLOTS = 6 // visible grid cells

function shuffleArray(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// ── Gallery Section ───────────────────────────────────────────────────────────
function GallerySection({ navigate }) {
  const [visible,  setVisible]  = useState(false)
  const [hov,      setHov]      = useState(null)
  const [page,     setPage]     = useState(0)
  const [fading,   setFading]   = useState(false)
  const [paused,   setPaused]   = useState(false)
  const [photos,   setPhotos]   = useState(() => shuffleArray(PORTFOLIO_PHOTOS))
  const ref = useRef(null)

  const totalPages = Math.ceil(photos.length / SLOTS)

  // Scroll-reveal
  useEffect(() => {
    const io = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) setVisible(true)
    }, { threshold: 0.12 })
    if (ref.current) io.observe(ref.current)
    return () => io.disconnect()
  }, [])

  // Auto-rotate every 3.5 s
  useEffect(() => {
    if (paused) return
    const t = setInterval(() => goTo((p) => (p + 1) % totalPages), 3500)
    return () => clearInterval(t)
  }, [paused, totalPages])

  function goTo(nextFn) {
    setFading(true)
    setTimeout(() => {
      setPage(typeof nextFn === 'function' ? nextFn : () => nextFn)
      setFading(false)
    }, 280)
  }

  const sr = (d) => ({
    opacity:    visible ? 1 : 0,
    transform:  visible ? 'translateY(0px)' : 'translateY(22px)',
    transition: `opacity .6s cubic-bezier(.16,1,.3,1) ${d}s, transform .6s cubic-bezier(.16,1,.3,1) ${d}s`,
  })

  // Current 6 photos (pad with first ones if last page is short)
  const start = page * SLOTS
  const slice = photos.slice(start, start + SLOTS)
  const visible6 = slice.length < SLOTS
    ? [...slice, ...photos.slice(0, SLOTS - slice.length)]
    : slice

  return (
    <section
      ref={ref}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      style={{ padding:'0 48px 96px', maxWidth:'1280px', margin:'0 auto' }}
    >
      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'32px', paddingBottom:'20px', borderBottom:'1px solid var(--border-default)', ...sr(0) }}>
        <h2 style={{ fontFamily:'var(--font-display)', fontSize:'var(--text-4xl)', fontWeight:300, letterSpacing:'-0.02em' }}>Portfolio</h2>
        <div style={{ display:'flex', alignItems:'center', gap:'16px' }}>
          {/* Dot indicators */}
          <div style={{ display:'flex', gap:'6px' }}>
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                style={{
                  width: i === page ? '20px' : '6px', height:'6px',
                  borderRadius:'3px', border:'none', cursor:'pointer',
                  background: i === page ? 'var(--color-black)' : 'var(--border-default)',
                  transition:'all 300ms ease', padding:0,
                }}
              />
            ))}
          </div>
          {/* Prev / Next */}
          <div style={{ display:'flex', gap:'4px' }}>
            {['←','→'].map((arrow, dir) => (
              <button
                key={arrow}
                onClick={() => goTo(p => dir === 0 ? (p - 1 + totalPages) % totalPages : (p + 1) % totalPages)}
                style={{ width:'32px', height:'32px', borderRadius:'8px', border:'1px solid var(--border-default)', background:'none', cursor:'pointer', fontFamily:'monospace', fontSize:'14px', color:'var(--text-secondary)', display:'flex', alignItems:'center', justifyContent:'center', transition:'all 200ms ease' }}
                onMouseEnter={e => { e.currentTarget.style.background='var(--color-black)'; e.currentTarget.style.color='white'; e.currentTarget.style.borderColor='var(--color-black)' }}
                onMouseLeave={e => { e.currentTarget.style.background='none'; e.currentTarget.style.color='var(--text-secondary)'; e.currentTarget.style.borderColor='var(--border-default)' }}
              >{arrow}</button>
            ))}
          </div>
          <button onClick={() => navigate('/galeria')} style={{ fontFamily:'var(--font-body)', fontSize:'var(--text-xs)', fontWeight:500, letterSpacing:'0.15em', textTransform:'uppercase', color:'var(--text-secondary)', background:'none', border:'none', borderBottom:'1px solid var(--border-default)', paddingBottom:'1px', cursor:'pointer' }}>
            Ver galería →
          </button>
        </div>
      </div>

      {/* 3×2 photo grid */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'2px', opacity: fading ? 0 : 1, transition:'opacity 280ms ease' }}>
        {visible6.map((src, i) => (
          <div key={`${page}-${i}`} style={{ aspectRatio:'4/5', overflow:'hidden', ...sr(0.04 * i) }}>
            <div
              onMouseEnter={() => setHov(i)} onMouseLeave={() => setHov(null)}
              onClick={() => navigate('/galeria')}
              style={{ width:'100%', height:'100%', cursor:'pointer', position:'relative', transition:'opacity 250ms ease', opacity: hov!==null && hov!==i ? 0.55 : 1 }}
            >
              <img
                src={src}
                alt={`Portfolio ${start + i + 1}`}
                style={{ width:'100%', height:'100%', objectFit:'cover', display:'block', transition:'transform 500ms ease', transform: hov===i ? 'scale(1.04)' : 'scale(1)' }}
                loading="lazy"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Page counter */}
      <div style={{ marginTop:'16px', textAlign:'center', fontFamily:'var(--font-body)', fontSize:'11px', letterSpacing:'0.12em', color:'var(--text-muted)', ...sr(0.3) }}>
        {page + 1} / {totalPages} — {photos.length} fotos
      </div>
    </section>
  )
}

// ── Loyalty Teaser ────────────────────────────────────────────────────────────
function LoyaltyTeaser({ navigate }) {
  const [hov, setHov] = useState(false)

  return (
    <section style={{ background:'var(--color-warm-50)', borderTop:'1px solid var(--border-default)', borderBottom:'1px solid var(--border-default)' }}>
      <div style={{ maxWidth:'1280px', margin:'0 auto', padding:'80px 48px', display:'grid', gridTemplateColumns:'1fr 1fr', gap:'64px', alignItems:'center' }}>
        <div>
          <div style={{ fontFamily:'var(--font-body)', fontSize:'8px', fontWeight:500, letterSpacing:'0.3em', textTransform:'uppercase', color:'var(--text-muted)', marginBottom:'16px' }}>
            Programa de fidelidad
          </div>
          <h2 style={{ fontFamily:'var(--font-display)', fontSize:'var(--text-4xl)', fontWeight:300, letterSpacing:'-0.02em', lineHeight:1.1, marginBottom:'20px' }}>
            Cada visita<br/>te premia
          </h2>
          <p style={{ fontFamily:'var(--font-body)', fontSize:'var(--text-sm)', color:'var(--text-secondary)', lineHeight:1.8, marginBottom:'36px', maxWidth:'380px' }}>
            Acumula puntos en cada servicio y canjéalos por descuentos. Consulta tu saldo cuando quieras con tu RUT.
          </p>
          <button
            onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
            onClick={() => navigate('/mis-puntos')}
            style={{ background: hov ? 'var(--color-black)' : 'transparent', color: hov ? 'white' : 'var(--color-black)', border:'1px solid var(--color-black)', padding:'12px 32px', fontFamily:'var(--font-body)', fontSize:'10px', fontWeight:500, letterSpacing:'0.18em', textTransform:'uppercase', cursor:'pointer', transition:'all 220ms ease' }}>
            Ver mis puntos
          </button>
        </div>

        {/* Mini loyalty card visual */}
        <div style={{ display:'flex', justifyContent:'center' }}>
          <div style={{ width:'300px', aspectRatio:'1.6/1', background:'linear-gradient(135deg, #1A1917 0%, #3D3B37 60%, #6B6760 100%)', borderRadius:'16px', padding:'28px', display:'flex', flexDirection:'column', justifyContent:'space-between', boxShadow:'0 24px 64px rgba(0,0,0,0.22)' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 300, fontSize: '1.4rem', lineHeight: 1, letterSpacing: '-0.03em', color: 'white' }}>LPk</div>
              <div style={{ fontFamily:'var(--font-body)', fontSize:'7px', fontWeight:500, letterSpacing:'0.25em', textTransform:'uppercase', color:'rgba(255,255,255,0.35)' }}>Loyalty</div>
            </div>
            <div>
              <div style={{ fontFamily:'var(--font-body)', fontSize:'8px', letterSpacing:'0.2em', textTransform:'uppercase', color:'rgba(255,255,255,0.3)', marginBottom:'4px' }}>Puntos acumulados</div>
              <div style={{ fontFamily:'var(--font-display)', fontSize:'2.4rem', fontWeight:300, color:'white', letterSpacing:'-0.02em' }}>1.250 pts</div>
              {/* Progress bar */}
              <div style={{ marginTop:'12px', height:'2px', background:'rgba(255,255,255,0.12)', borderRadius:'1px', overflow:'hidden' }}>
                <div style={{ height:'100%', width:'62%', background:'rgba(200,184,154,0.7)', borderRadius:'1px' }} />
              </div>
              <div style={{ fontFamily:'var(--font-body)', fontSize:'7px', color:'rgba(255,255,255,0.25)', marginTop:'6px', letterSpacing:'0.1em' }}>750 pts para tu próximo beneficio</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ── Main Landing Page ─────────────────────────────────────────────────────────
export default function Landing() {
  const navigate = useNavigate()

  useSEO({
    title: 'Peluquería en Puerto Varas · La Pelukeria · Corte, Color y Tratamientos',
    description: 'La Pelukeria — peluquería premium en Puerto Varas, Chile. Especialistas en corte, balayage, tinte, alisado y tratamientos capilares de alta gama. Reserva tu hora online.',
    canonical: 'https://lapelukeria.cl/',
    ogImage: 'https://lapelukeria.cl/logo.webp',
  })

  // Inject keyframes once
  useEffect(() => {
    if (!document.getElementById('lpk-kf')) {
      const s = document.createElement('style')
      s.id = 'lpk-kf'
      s.textContent = KEYFRAMES
      document.head.appendChild(s)
    }
  }, [])

  const goTo = (path) => navigate(path)

  return (
    <div style={{ fontFamily: 'var(--font-body)', color: 'var(--text-primary)', background: 'var(--bg-primary)' }}>
      <Navbar currentPage="home" navigate={goTo} />
      <Hero navigate={goTo} />
      <ServicesSection navigate={goTo} />
      <GallerySection navigate={goTo} />
      <LoyaltyTeaser navigate={goTo} />
      <Footer navigate={goTo} />
    </div>
  )
}
