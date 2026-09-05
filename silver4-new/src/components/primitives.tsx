import type { ImgHTMLAttributes, ReactNode } from 'react'

/* ==========================================================================
   Small presentational primitives — ported from 04-components.css.
   ========================================================================== */

export function Eyebrow({
  children,
  invert,
  className = '',
}: {
  children: ReactNode
  invert?: boolean
  className?: string
}) {
  return (
    <p
      className={`font-body text-xs font-medium tracking-wider uppercase ${invert ? 'text-accent-soft' : 'text-accent'} ${className}`}
    >
      {children}
    </p>
  )
}

export function Lede({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <p className={`text-md leading-loose text-ink-soft ${className}`}>{children}</p>
}

export function Rule({ center, className = '' }: { center?: boolean; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`block h-px w-14 bg-accent ${center ? 'mx-auto' : ''} ${className}`}
    />
  )
}

export function Tag({
  children,
  accent,
  className = '',
}: {
  children: ReactNode
  accent?: boolean
  className?: string
}) {
  return (
    <span
      className={`inline-block px-2 py-[0.2rem] border text-xs tracking-wide uppercase ${
        accent ? 'border-accent text-accent' : 'border-line text-ink-soft'
      } ${className}`}
    >
      {children}
    </span>
  )
}

type FigureRatio = '4/3' | '3/4' | '1/1' | '16/9' | '2/3'

const RATIO_CLASSES: Record<FigureRatio, string> = {
  '4/3': 'aspect-[4/3]',
  '3/4': 'aspect-[3/4]',
  '1/1': 'aspect-square',
  '16/9': 'aspect-video',
  '2/3': 'aspect-[2/3]',
}

interface FigureProps extends ImgHTMLAttributes<HTMLImageElement> {
  ratio?: FigureRatio
  zoom?: boolean
  contain?: boolean
  caption?: ReactNode
  className?: string
}

/** The standard image treatment: fixed aspect ratio, no layout shift. */
export function Figure({
  ratio = '4/3',
  zoom,
  contain,
  caption,
  className = '',
  alt,
  ...imgProps
}: FigureProps) {
  return (
    <div>
      <div
        className={`group relative overflow-hidden ${RATIO_CLASSES[ratio]} ${
          contain ? 'bg-paper' : 'bg-paper-alt'
        } ${className}`}
      >
        <img
          alt={alt}
          className={`w-full h-full transition-transform duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
            contain ? 'object-contain' : 'object-cover'
          } ${zoom ? 'group-hover:scale-[1.04]' : ''}`}
          {...imgProps}
        />
      </div>
      {caption && <p className="mt-2 text-sm text-muted">{caption}</p>}
    </div>
  )
}
