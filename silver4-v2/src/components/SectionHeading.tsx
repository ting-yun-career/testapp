interface SectionHeadingProps {
  eyebrow: string
  title: string
  subtitle?: string
}

export function SectionHeading({ eyebrow, title, subtitle }: SectionHeadingProps) {
  return (
    <div className="mx-auto max-w-2xl px-[var(--gap_width)] text-center">
      <p className="text-xs font-semibold uppercase tracking-wider text-accent">{eyebrow}</p>
      <h2 className="mt-[var(--gap_width)] font-display text-4xl">{title}</h2>
      {subtitle && (
        <p className="mt-[var(--gap_width)] text-sm leading-relaxed text-muted">{subtitle}</p>
      )}
    </div>
  )
}
