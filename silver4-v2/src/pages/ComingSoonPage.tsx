export function ComingSoonPage({ title }: { title: string }) {
  return (
    <section className="mx-auto flex min-h-[50vh] max-w-3xl flex-col items-center justify-center px-6 text-center">
      <p className="text-xs font-semibold uppercase tracking-wider text-accent">Coming soon</p>
      <h1 className="mt-2 font-display text-4xl">{title}</h1>
      <p className="mt-3 text-sm text-muted">This page is being crafted — check back soon.</p>
    </section>
  )
}
