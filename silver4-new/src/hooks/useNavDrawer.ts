import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'

const FOCUSABLE =
  'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])'

/* ==========================================================================
   useNavDrawer — the mobile off-canvas drawer: open/close, focus trap,
   Escape-to-close, body scroll lock, close-on-link-click, and resetting when
   the viewport grows past the desktop breakpoint. Ported from js/nav.js.
   ========================================================================== */
export function useNavDrawer() {
  const [isOpen, setIsOpen] = useState(false)
  const navRef = useRef<HTMLElement | null>(null)
  const toggleRef = useRef<HTMLButtonElement | null>(null)
  const lastFocused = useRef<HTMLElement | null>(null)
  const location = useLocation()

  const close = useCallback(() => {
    setIsOpen(false)
    lastFocused.current?.focus()
  }, [])

  const open = useCallback(() => {
    lastFocused.current = document.activeElement as HTMLElement
    setIsOpen(true)
  }, [])

  // Close the drawer whenever the route changes (same effect as nav.js
  // closing after a same-page anchor tap, generalised to real navigation) —
  // synchronizing with the router's location, not state derived from a render.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsOpen(false)
  }, [location.pathname, location.hash])

  // Body scroll lock + focus into the drawer once its open transition ends.
  useEffect(() => {
    if (!isOpen) {
      document.body.style.overflow = ''
      return
    }

    document.body.style.overflow = 'hidden'
    const nav = navRef.current
    if (!nav) return

    let done = false
    const focusFirst = () => {
      if (done) return
      done = true
      nav.querySelector<HTMLElement>(FOCUSABLE)?.focus()
    }

    nav.addEventListener(
      'transitionend',
      (event) => {
        if (event.target === nav && event.propertyName === 'transform') focusFirst()
      },
      { once: true },
    )
    const duration = Number.parseFloat(getComputedStyle(nav).transitionDuration) || 0
    const timeout = window.setTimeout(focusFirst, duration * 1000 + 50)

    return () => window.clearTimeout(timeout)
  }, [isOpen])

  // Escape to close, Tab trapped inside the drawer.
  useEffect(() => {
    if (!isOpen) return

    function onKeydown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        close()
        return
      }
      if (event.key !== 'Tab' || !navRef.current) return

      const items = [...navRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(
        (el) => el.offsetParent !== null,
      )
      if (items.length === 0) return
      const first = items[0]
      const last = items[items.length - 1]

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeydown)
    return () => document.removeEventListener('keydown', onKeydown)
  }, [isOpen, close])

  // If the viewport grows past the desktop breakpoint, the drawer becomes an
  // inline nav; reset so scroll isn't left locked.
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 64rem)')
    const onChange = (event: MediaQueryListEvent) => {
      if (event.matches && isOpen) close()
    }
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [isOpen, close])

  return { isOpen, open, close, navRef, toggleRef }
}
