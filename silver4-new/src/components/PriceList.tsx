import type { ReactNode } from 'react'

/* ==========================================================================
   Price list — ported from .price-list / .price-row in 04-components.css.
   ========================================================================== */

export function PriceNotes({ children }: { children: ReactNode }) {
  return <div className="flex flex-col gap-1 mb-6 text-sm text-muted">{children}</div>
}

export function PriceList({ children }: { children: ReactNode }) {
  return <div className="flex flex-col">{children}</div>
}

interface PriceRowProps {
  name: ReactNode
  price: ReactNode
  note?: ReactNode
  priceIsText?: boolean
}

export function PriceRow({ name, price, note, priceIsText }: PriceRowProps) {
  return (
    <div className="grid grid-cols-[1fr_auto] items-baseline gap-x-4 gap-y-2 py-3 border-b border-line last:border-b-0">
      <p className="text-base font-normal">{name}</p>
      <p
        className={
          priceIsText
            ? 'font-body text-xs tracking-wide uppercase text-ink-soft whitespace-nowrap'
            : 'font-display text-md italic text-accent whitespace-nowrap'
        }
      >
        {price}
      </p>
      {note && <p className="col-span-2 text-sm text-muted">{note}</p>}
    </div>
  )
}
