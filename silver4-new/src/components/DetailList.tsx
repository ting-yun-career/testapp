import type { ElementType, ReactNode } from 'react'

/* ==========================================================================
   Detail rows — ported from .detail-list / .detail-row in 04-components.css.
   Used for the hours table (dl > div > dt/dd) and the plain bullet list on
   the About page (ul > li).
   ========================================================================== */

export function DetailList({
  children,
  as: As = 'dl',
  className = '',
}: {
  children: ReactNode
  as?: ElementType
  className?: string
}) {
  return <As className={`flex flex-col m-0 ${className}`}>{children}</As>
}

export function DetailRow({
  children,
  as: As = 'div',
  className = '',
}: {
  children: ReactNode
  as?: ElementType
  className?: string
}) {
  return (
    <As
      className={`flex justify-between items-baseline gap-4 py-3 border-b border-line last:border-b-0 ${className}`}
    >
      {children}
    </As>
  )
}

export function DetailKey({ children, today }: { children: ReactNode; today?: boolean }) {
  return (
    <dt
      className={`text-sm tracking-wide uppercase ${
        today ? 'text-accent font-medium' : 'text-ink-soft'
      }`}
    >
      {children}
    </dt>
  )
}

export function DetailVal({
  children,
  today,
  openTime,
  closeTime,
  as: As = 'dd',
}: {
  children: ReactNode
  today?: boolean
  openTime?: string
  closeTime?: string
  as?: ElementType
}) {
  return (
    <As
      className={`text-base ${today ? 'text-accent font-medium' : ''}`}
      data-open-time={openTime}
      data-close-time={closeTime}
    >
      {children}
    </As>
  )
}
