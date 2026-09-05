import { useEffect, useRef } from 'react'

export interface JumpLink {
  href: string
  label: string
}

/** Sticky category pill nav on the Services page — ported from .jump-nav.
    js/jumpnav.js only adds the active-pill highlight via IntersectionObserver;
    the links themselves are plain anchors and work with JS off. */
export function JumpNav({ links }: { links: JumpLink[] }) {
  const navRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const nav = navRef.current
    if (!nav) return

    const anchors = [...nav.querySelectorAll<HTMLAnchorElement>('a[href^="#"]')]
    const map = new Map<Element, HTMLAnchorElement>()
    for (const a of anchors) {
      const section = document.querySelector(a.getAttribute('href') || '')
      if (section) map.set(section, a)
    }
    if (map.size === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          for (const a of anchors) delete a.dataset.active
          const active = map.get(entry.target)
          if (active) active.dataset.active = 'true'
        }
      },
      { rootMargin: '-30% 0px -60% 0px' },
    )

    for (const section of map.keys()) observer.observe(section)
    return () => observer.disconnect()
  }, [links])

  return (
    <nav
      ref={navRef}
      aria-label="Jump to a service category"
      className="sticky top-[4.25rem] z-10 flex gap-2 overflow-x-auto py-3 mb-8 bg-paper border-b border-line [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {links.map((link) => (
        <a
          key={link.href}
          href={link.href}
          className="flex-none px-4 py-2 border border-line rounded-full text-xs tracking-wide uppercase whitespace-nowrap transition-colors duration-[280ms] ease-[cubic-bezier(0.22,0.61,0.36,1)] hover:border-accent hover:text-accent data-[active=true]:bg-ink data-[active=true]:border-ink data-[active=true]:text-paper"
        >
          {link.label}
        </a>
      ))}
    </nav>
  )
}
