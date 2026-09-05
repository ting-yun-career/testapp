import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

type Variant = 'primary' | 'outline' | 'light' | 'ghost-light'

const VARIANT_CLASSES: Record<Variant, string> = {
  // Base .btn (no modifier in the hand-off) doubles as the outline look:
  // transparent bg, ink border/text, filling to ink on hover.
  outline: 'bg-transparent text-ink border-ink hover:bg-ink hover:text-paper',
  primary: 'bg-ink text-paper border-ink hover:bg-accent hover:border-accent active:bg-[#7d6a50] active:border-[#7d6a50]',
  light: 'bg-paper text-ink border-paper hover:bg-transparent hover:text-paper',
  'ghost-light': 'bg-transparent text-paper border-white/55 hover:bg-paper hover:text-ink hover:border-paper',
}

interface ButtonProps {
  children: ReactNode
  variant: Variant
  size?: 'default' | 'sm'
  block?: boolean
  href?: string
  to?: string
  target?: string
  rel?: string
  className?: string
  disabled?: boolean
  id?: string
}

const BASE =
  'inline-flex items-center justify-center gap-2 border font-body text-xs font-medium tracking-wider uppercase text-center whitespace-nowrap transition-colors duration-[280ms] ease-[cubic-bezier(0.22,0.61,0.36,1)]'

export function Button({
  children,
  variant,
  size = 'default',
  block,
  href,
  to,
  target,
  rel,
  className = '',
  disabled,
  id,
}: ButtonProps) {
  const sizeClasses = size === 'sm' ? 'min-h-10 px-4 py-2' : 'min-h-12 px-6 py-3'
  const classes = `${BASE} ${sizeClasses} ${VARIANT_CLASSES[variant]} ${block ? 'w-full' : ''} ${
    disabled ? 'opacity-45 pointer-events-none' : ''
  } ${className}`

  if (to) {
    return (
      <Link id={id} to={to} className={classes} aria-disabled={disabled}>
        {children}
      </Link>
    )
  }

  return (
    <a id={id} href={href} target={target} rel={rel} className={classes} aria-disabled={disabled}>
      {children}
    </a>
  )
}
