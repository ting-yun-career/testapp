import type { ReactNode } from 'react'
import { Container } from './layout'
import { Eyebrow } from './primitives'
import { Button } from './Button'
import { BOOKING_URL } from '../lib/constants'

interface CtaBandProps {
  eyebrow: ReactNode
  title: ReactNode
  body?: ReactNode
}

/** ported from .cta-band in 05-sections.css — the closing "book now" band on every page. */
export function CtaBand({ eyebrow, title, body }: CtaBandProps) {
  return (
    <section className="py-[clamp(3.5rem,2rem+6vw,7.5rem)] bg-ink text-paper text-center">
      <Container className="flex flex-col items-center gap-6">
        <Eyebrow>{eyebrow}</Eyebrow>
        <h2 className="text-2xl text-paper">{title}</h2>
        {body && <p className="text-white/78">{body}</p>}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Button variant="light" href={BOOKING_URL} target="_blank" rel="noopener">
            Book on Fresha
          </Button>
        </div>
      </Container>
    </section>
  )
}
