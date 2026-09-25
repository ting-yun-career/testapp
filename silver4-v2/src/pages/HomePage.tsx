import { ExpandableImage } from '../components/ExpandableImage'
import { VideoGrid } from '../components/VideoGrid'
import { BookAppointmentCta } from '../components/BookAppointmentCta'
import { FollowUsButton } from '../components/FollowUsButton'
import { HOMEPAGE_VIDEOS, MAP_EMBED_SRC, PRODUCTS, SCHEDULE } from '../data/site'

function Hero() {
  return (
    <section className="relative flex min-h-[70vh] items-center justify-center overflow-hidden bg-cream desktop:min-h-[85vh]">
      <h1 className="max-w-3xl px-[var(--gap_width)] text-center font-display text-4xl leading-tight desktop:text-6xl">
        Crafting personal rituals of style &amp; luxury
      </h1>
    </section>
  )
}

function WhyUs() {
  return (
    <section className="flex flex-col gap-[var(--gap_width)] px-[var(--gap_width)] py-[var(--gap_width)] desktop:flex-row">
      <ExpandableImage
        src="/gallery/about.webp"
        alt="Inside the Silver4 studio"
        wrapperClassName="desktop:w-1/2"
        className="aspect-square w-full object-cover desktop:aspect-auto desktop:h-full"
      />
      <div className="desktop:w-1/2">
        <p className="text-xs font-semibold uppercase tracking-wider text-accent">
          Premium Experience
        </p>
        <h2 className="mt-[var(--gap_width)] font-display text-4xl">Why us</h2>
        <p className="mt-[var(--gap_width)] text-sm font-semibold text-ink">
          Hair, Barber, SPA - A tribrid experience
        </p>
        <p className="mt-[var(--gap_width)] max-w-md text-sm leading-relaxed text-muted">
          We believe styling is an art form. Our masters of cuts and wellness therapists elevate
          your grooming into a therapeutic, premium self-care ritual.
        </p>
        <a
          href="https://www.fresha.com"
          target="_blank"
          rel="noreferrer"
          className="mt-[var(--gap_width)] inline-block bg-ink px-6 py-3 text-xs font-semibold uppercase tracking-wider text-white transition-opacity hover:opacity-85"
        >
          Book Appointment
        </a>
      </div>
    </section>
  )
}

function Products() {
  return (
    <section className="px-[var(--gap_width)] py-[var(--gap_width)]">
      <div className="grid grid-cols-2 gap-[var(--gap_width)] desktop:grid-cols-6">
        {PRODUCTS.map((product) => (
          <div key={product.name} className="flex flex-col gap-[var(--gap_width)]">
            <div className="aspect-square w-full bg-cream" />
            <p className="text-xs uppercase tracking-wider text-muted">{product.brand}</p>
            <p className="text-sm text-ink">{product.name}</p>
            <p className="text-sm text-muted">{product.price}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

function ScheduleAndMap() {
  return (
    <section className="grid gap-[var(--gap_width)] px-[var(--gap_width)] py-[var(--gap_width)] desktop:grid-cols-2">
      <div>
        <dl className="divide-y divide-hairline border-y border-hairline">
          {SCHEDULE.map((row) => (
            <div
              key={row.day}
              className={`flex items-center justify-between py-[var(--gap_width)] text-sm ${
                row.day === 'Saturday' ? 'font-semibold text-ink' : 'text-muted'
              }`}
            >
              <dt className="uppercase tracking-wider">{row.day}</dt>
              <dd>{row.hours}</dd>
            </div>
          ))}
        </dl>
        <a
          href="mailto:info@silver4salon.com"
          className="mt-[var(--gap_width)] inline-block bg-ink px-6 py-3 text-xs font-semibold uppercase tracking-wider text-white transition-opacity hover:opacity-85"
        >
          Contact Us
        </a>
      </div>
      <div className="relative min-h-64 overflow-hidden bg-cream">
        <iframe
          className="absolute inset-0 h-full w-full border-0"
          src={MAP_EMBED_SRC}
          title="Map showing Silver4 Hair & Beauty Salon"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
      </div>
    </section>
  )
}

export function HomePage() {
  return (
    <>
      <Hero />
      <section className="px-[var(--gap_width)] py-[var(--gap_width)]">
        <VideoGrid videos={HOMEPAGE_VIDEOS} />
      </section>
      <FollowUsButton />
      <WhyUs />
      <Products />
      <ScheduleAndMap />
      <BookAppointmentCta subtext="Colour consultations are free. Walk-ins welcome when we have space." />
    </>
  )
}
