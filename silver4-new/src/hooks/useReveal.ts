import { useEffect, useRef, useState, type RefObject } from 'react'

/* ==========================================================================
   useReveal — fade-and-rise as an element enters the viewport.
   Ported from js/reveal.js. Elements are visible by default (armed=false)
   so nothing is ever invisible if this never runs; once armed, the element
   starts hidden and transitions in on intersection.
   ========================================================================== */
export function useReveal<T extends HTMLElement = HTMLElement>(
  delay = 0,
): { ref: RefObject<T | null>; className: string } {
  const ref = useRef<T>(null)
  // Lazy initializer, not effect state: whether reduced-motion is on is
  // known synchronously and never changes for the life of this component.
  const [armed] = useState(() => !window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el || !armed) return

    let timeout: number | undefined

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          timeout = window.setTimeout(() => setVisible(true), delay)
          observer.unobserve(el)
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -8% 0px' },
    )

    observer.observe(el)
    return () => {
      observer.disconnect()
      window.clearTimeout(timeout)
    }
  }, [delay, armed])

  const className = !armed
    ? ''
    : `transition-[opacity,transform] duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-[18px]'
      }`

  return { ref, className }
}
