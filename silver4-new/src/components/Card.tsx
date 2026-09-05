import { forwardRef, type ReactNode } from 'react'
import { Link } from 'react-router-dom'

/* ==========================================================================
   Card — ported from the .card / .card--bordered rules in 04-components.css.
   ========================================================================== */

export function CardMeta({ children }: { children: ReactNode }) {
  return <p className="text-xs tracking-wide uppercase text-muted">{children}</p>
}

export function CardTitle({ children, as: As = 'h3' }: { children: ReactNode; as?: 'h2' | 'h3' }) {
  return <As className="font-display text-lg leading-snug">{children}</As>
}

export function CardBody({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <p className={`text-sm leading-loose text-ink-soft ${className}`}>{children}</p>
}

interface BorderedCardLinkProps {
  children: ReactNode
  to: string
  className?: string
}

/** The bordered, hoverable service-teaser card — always a link in the hand-off. */
export const BorderedCardLink = forwardRef<HTMLAnchorElement, BorderedCardLinkProps>(
  function BorderedCardLink({ children, to, className = '' }, ref) {
    return (
      <Link
        ref={ref}
        to={to}
        className={`flex flex-col gap-3 bg-paper border border-line p-6 transition-transform duration-[280ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-[3px] ${className}`}
      >
        {children}
      </Link>
    )
  },
)

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <article className={`flex flex-col gap-3 bg-paper ${className}`}>{children}</article>
}
