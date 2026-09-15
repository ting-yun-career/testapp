interface SectionHeadingProps {
  eyebrow: string
  title: string
  subtitle?: string
}

export function SectionHeading({ eyebrow, title, subtitle }: SectionHeadingProps) {
  return (
    <div className="mx-auto max-w-2xl px-6 text-center">
      <p className="text-xs font-semibold uppercase tracking-wider text-accent">{eyebrow}</p>
      <h2 className="mt-2 font-display text-4xl">{title}</h2>
      {subtitle && <p className="mt-3 text-sm leading-relaxed text-muted">{subtitle}</p>}
    </div>
  )
}
