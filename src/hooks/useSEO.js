import { useEffect } from 'react'

/**
 * Hook para actualizar title, meta description y canonical por ruta.
 * Reemplaza react-helmet-async sin dependencias externas.
 */
export default function useSEO({ title, description, canonical, ogImage }) {
  useEffect(() => {
    // Title
    if (title) document.title = title

    // Meta description
    setMeta('name', 'description', description)

    // Canonical
    if (canonical) {
      let link = document.querySelector('link[rel="canonical"]')
      if (!link) {
        link = document.createElement('link')
        link.rel = 'canonical'
        document.head.appendChild(link)
      }
      link.href = canonical
    }

    // Open Graph
    if (title)       setMeta('property', 'og:title',       title)
    if (description) setMeta('property', 'og:description', description)
    if (canonical)   setMeta('property', 'og:url',         canonical)
    if (ogImage)     setMeta('property', 'og:image',       ogImage)

    // Twitter
    if (title)       setMeta('name', 'twitter:title',       title)
    if (description) setMeta('name', 'twitter:description', description)
    if (ogImage)     setMeta('name', 'twitter:image',       ogImage)
  }, [title, description, canonical, ogImage])
}

function setMeta(attr, key, content) {
  if (!content) return
  let el = document.querySelector(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}
