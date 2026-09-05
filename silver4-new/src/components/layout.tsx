import type { ElementType, ReactNode } from 'react'

/* ==========================================================================
   Layout primitives — ported from 03-layout.css (.container, .section,
   .stack, .cluster, .grid, .split). Position and spacing only; no colour,
   no type.
   ========================================================================== */

interface ContainerProps {
  children: ReactNode
  className?: string
  narrow?: boolean
  wide?: boolean
  flush?: boolean
  as?: ElementType
}

export function Container({
  children,
  className = '',
  narrow,
  wide,
  flush,
  as: As = 'div',
}: ContainerProps) {
  const maxWidth = narrow ? 'max-w-[46rem]' : wide ? 'max-w-[90rem]' : 'max-w-[75rem]'
  const padding = flush ? 'px-0' : 'px-[clamp(1.25rem,0.75rem+2.5vw,3rem)]'
  return <As className={`w-full mx-auto ${maxWidth} ${padding} ${className}`}>{children}</As>
}

interface SectionProps {
  children: ReactNode
  className?: string
  tight?: boolean
  flushTop?: boolean
  flushBottom?: boolean
  id?: string
}

export function Section({ children, className = '', tight, flushTop, flushBottom, id }: SectionProps) {
  const py = tight
    ? 'py-[calc(clamp(3.5rem,2rem+6vw,7.5rem)*0.55)]'
    : 'py-[clamp(3.5rem,2rem+6vw,7.5rem)]'
  const top = flushTop ? 'pt-0' : ''
  const bottom = flushBottom ? 'pb-0' : ''
  return (
    <section id={id} className={`${py} ${top} ${bottom} ${className}`}>
      {children}
    </section>
  )
}

interface SectionHeadProps {
  children: ReactNode
  center?: boolean
  className?: string
}

export function SectionHead({ children, center, className = '' }: SectionHeadProps) {
  return (
    <div
      className={`flex flex-col gap-4 mb-12 ${center ? 'mx-auto text-center items-center' : ''} ${className}`}
    >
      {children}
    </div>
  )
}

const gapMap = { sm: 'gap-4', md: 'gap-6', lg: 'gap-8', xl: 'gap-12' } as const

interface StackProps {
  children: ReactNode
  gap?: keyof typeof gapMap
  className?: string
  as?: ElementType
}

export function Stack({ children, gap = 'sm', className = '', as: As = 'div' }: StackProps) {
  return <As className={`flex flex-col ${gapMap[gap]} ${className}`}>{children}</As>
}

interface ClusterProps {
  children: ReactNode
  gap?: 'sm' | 'md'
  className?: string
}

export function Cluster({ children, gap = 'sm', className = '' }: ClusterProps) {
  return (
    <div className={`flex flex-wrap items-center ${gap === 'md' ? 'gap-6' : 'gap-4'} ${className}`}>
      {children}
    </div>
  )
}

interface GridProps {
  children: ReactNode
  cols: 2 | 3 | 4
  className?: string
}

const gridColsMap: Record<2 | 3 | 4, string> = {
  2: 'grid-cols-1 md:grid-cols-2',
  3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
}

export function Grid({ children, cols, className = '' }: GridProps) {
  return (
    <div className={`grid gap-6 md:gap-8 ${gridColsMap[cols]} ${className}`}>{children}</div>
  )
}

interface SplitProps {
  children: ReactNode
  copyWide?: boolean
  mediaWide?: boolean
  className?: string
}

export function Split({ children, copyWide, mediaWide, className = '' }: SplitProps) {
  const templateCols = copyWide
    ? 'lg:grid-cols-[1fr_1.15fr]'
    : mediaWide
      ? 'lg:grid-cols-[1.15fr_1fr]'
      : 'lg:grid-cols-2'
  return (
    <div
      className={`grid gap-12 items-center lg:gap-[clamp(3rem,5vw,6rem)] ${templateCols} ${className}`}
    >
      {children}
    </div>
  )
}
