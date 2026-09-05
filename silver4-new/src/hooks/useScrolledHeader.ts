import { useEffect, useState } from 'react'

/** Adds a shadow to the sticky header once the page has scrolled.
    Ported from the sentinel + IntersectionObserver in js/nav.js. */
export function useScrolledHeader() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 0)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return scrolled
}
