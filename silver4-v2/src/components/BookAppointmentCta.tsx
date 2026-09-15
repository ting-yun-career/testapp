interface BookAppointmentCtaProps {
  subtext: string
}

export function BookAppointmentCta({ subtext }: BookAppointmentCtaProps) {
  return (
    <section className="mx-auto max-w-3xl px-[var(--gap_width)] py-[var(--gap_width)] text-center">
      <h2 className="font-display text-4xl leading-tight desktop:text-5xl">
        Book your
        <br />
        <span className="text-accent">appointment</span>
      </h2>
      <p className="mx-auto mt-[var(--gap_width)] max-w-md text-sm text-muted">{subtext}</p>
      <a
        href="https://www.fresha.com"
        target="_blank"
        rel="noreferrer"
        className="mt-[var(--gap_width)] inline-block bg-ink px-8 py-3 text-xs font-semibold uppercase tracking-wider text-white transition-opacity hover:opacity-85"
      >
        Book on Fresha
      </a>
    </section>
  )
}
