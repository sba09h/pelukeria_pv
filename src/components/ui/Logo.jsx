 const IMG_SIZES = { sm: 'h-10', md: 'h-12', lg: 'h-16', xl: 'h-24' }

export default function Logo({ size = 'md', variant = 'dark', href }) {
  // Logo now has transparent background — no filters needed
  const filter = 'none'

  const inner = (
    <img
      src="/logo.webp"
      alt="La Pelukeria Puerto Varas"
      className={`${IMG_SIZES[size]} w-auto object-contain select-none`}
      style={{ filter }}
    />
  )

  if (href) {
    return (
      <a href={href} className="hover:opacity-80 transition-opacity inline-flex">
        {inner}
      </a>
    )
  }

  return <div className="inline-flex">{inner}</div>
}
