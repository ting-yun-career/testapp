export function ComingSoonPage({ title }: { title: string }) {
  return (
    <section className="mx-auto flex min-h-[50vh] max-w-3xl flex-col items-center justify-center px-[var(--gap_width)] text-center">
      <p className="text-xs font-semibold uppercase tracking-wider text-accent">Coming soon</p>
      <h1 className="mt-[var(--gap_width)] font-display text-4xl">{title}</h1>
      <p className="mt-[var(--gap_width)] text-sm text-muted">
        This page is being crafted — check back soon.
      </p>
    </section>
  )
}
