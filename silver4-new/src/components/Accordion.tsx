import { useEffect, useRef, type ReactNode } from 'react'
import { Icon } from './Icon'

/* ==========================================================================
   Accordion — built on native <details>, ported from 04-components.css.
   Adds optional single-open behaviour and opens the item matching the URL
   hash on mount, same as js/accordion.js.
   ========================================================================== */

export interface AccordionItemData {
  id: string
  summary: ReactNode
  content: ReactNode
}

export function Accordion({ items, single = true }: { items: AccordionItemData[]; single?: boolean }) {
  const refs = useRef<Array<HTMLDetailsElement | null>>([])

  useEffect(() => {
    const details = refs.current.filter((el): el is HTMLDetailsElement => el !== null)

    const handlers = details.map((el) => {
      const handler = () => {
        if (!el.open || !single) return
        for (const other of details) {
          if (other !== el) other.open = false
        }
      }
      el.addEventListener('toggle', handler)
      return { el, handler }
    })

    const hash = window.location.hash
    if (hash) {
      const target = details.find((el) => `#${el.id}` === hash)
      if (target) target.open = true
    }

    return () => {
      for (const { el, handler } of handlers) el.removeEventListener('toggle', handler)
    }
  }, [items, single])

  return (
    <div className="flex flex-col border-t border-line">
      {items.map((item, i) => (
        <details
          key={item.id}
          id={item.id}
          ref={(el) => {
            refs.current[i] = el
          }}
          className="group border-b border-line"
        >
          <summary className="flex justify-between items-center gap-4 min-h-14 py-4 cursor-pointer font-display text-lg transition-colors duration-150 ease-[cubic-bezier(0.22,0.61,0.36,1)] hover:text-accent">
            {item.summary}
            <Icon
              name="add"
              className="flex-none text-accent transition-transform duration-[280ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-open:rotate-45"
            />
          </summary>
          <div className="pb-6 text-base leading-loose text-ink-soft">{item.content}</div>
        </details>
      ))}
    </div>
  )
}
