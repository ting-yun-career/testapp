import type { ReactNode } from 'react'
import { useReveal } from '../../hooks/useReveal'

interface TeamCardProps {
  name: string
  role: string
  imgSrc: string
  imgAlt: string
  langs: string
  bio?: ReactNode
  bioMuted?: boolean
  delay?: number
  headingLevel?: 'h2' | 'h3'
}

/** ported from .team-card in 05-sections.css, layered on the generic .card. */
export function TeamCard({
  name,
  role,
  imgSrc,
  imgAlt,
  langs,
  bio,
  bioMuted,
  delay = 0,
  headingLevel = 'h3',
}: TeamCardProps) {
  const { ref, className } = useReveal<HTMLElement>(delay)
  const Heading = headingLevel

  return (
    <article ref={ref} className={`flex flex-col gap-3 bg-paper ${className}`}>
      <div className="group relative overflow-hidden aspect-[3/4] bg-paper-alt mb-2">
        <img
          src={imgSrc}
          alt={imgAlt}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover transition-transform duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
        />
      </div>
      <p className="text-xs tracking-wider uppercase text-accent">{role}</p>
      <Heading className="font-display text-lg mt-2">{name}</Heading>
      {bio && (
        <p className={`text-sm leading-loose ${bioMuted ? 'text-muted' : 'text-ink-soft'}`}>
          {bio}
        </p>
      )}
      <p className="text-xs tracking-wide uppercase text-muted pt-2 border-t border-line">
        {langs}
      </p>
    </article>
  )
}
