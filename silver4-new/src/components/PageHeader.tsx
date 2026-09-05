import type { ReactNode } from 'react'
import { Container } from './layout'
import { Breadcrumb } from './Breadcrumb'

interface PageHeaderProps {
  crumbLabel: string
  title: ReactNode
  lede: ReactNode
}

/** The compact dark banner on every interior page — ported from .page-header. */
export function PageHeader({ crumbLabel, title, lede }: PageHeaderProps) {
  return (
    <section className="relative py-16 bg-ink text-paper overflow-hidden">
      <Container className="relative z-10 flex flex-col gap-3">
        <Breadcrumb items={[{ label: 'Home', to: '/' }, { label: crumbLabel }]} />
        <h1 className="font-marker text-2xl text-paper">{title}</h1>
        <p className="text-md text-white/80 max-w-[40rem]">{lede}</p>
      </Container>
    </section>
  )
}
