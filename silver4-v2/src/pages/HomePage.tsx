import { ExpandableImage } from '../components/ExpandableImage'
import { PhotoGrid } from '../components/PhotoGrid'
import { BookAppointmentCta } from '../components/BookAppointmentCta'
import { FollowUsButton } from '../components/FollowUsButton'
import { PinIcon } from '../components/icons'
import { HOMEPAGE_GALLERY, PRODUCTS, SCHEDULE } from '../data/site'

function Hero() {
  return (
    <section className="relative flex min-h-[70vh] items-center justify-center overflow-hidden bg-cream desktop:min-h-[85vh]">
      <h1 className="max-w-3xl px-6 text-center font-display text-4xl leading-tight desktop:text-6xl">
        Crafting personal rituals of style &amp; luxury
      </h1>
    </section>
  )
}

function WhyUs() {
  return (
    <section className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-6 desktop:flex-row desktop:items-center desktop:gap-14">
      <ExpandableImage
        src="/gallery/about.webp"
        alt="Inside the Silver4 studio"
        wrapperClassName="desktop:w-1/2"
        className="aspect-4/3 w-full object-cover"
      />
      <div className="desktop:w-1/2">
        <p className="text-xs font-semibold uppercase tracking-wider text-accent">
          Premium Experience
        </p>
        <h2 className="mt-2 font-display text-4xl">Why us</h2>
        <p className="mt-3 text-sm font-semibold text-ink">Bespoke Hair &amp; Body Rituals</p>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-muted">
          We believe styling is an art form. Our masters of cuts and wellness therapists elevate
          your grooming into a therapeutic, premium self-care ritual.
        </p>
        <a
          href="https://www.fresha.com"
          target="_blank"
          rel="noreferrer"
          className="mt-5 inline-block bg-ink px-6 py-3 text-xs font-semibold uppercase tracking-wider text-white transition-opacity hover:opacity-85"
        >
          Book Appointment
        </a>
      </div>
    </section>
  )
}

function Products() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-6">
      <div className="grid grid-cols-2 gap-5 desktop:grid-cols-4 desktop:gap-6">
        {PRODUCTS.map((product) => (
          <div key={product.name} className="flex flex-col gap-2">
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
    <section className="mx-auto grid max-w-6xl gap-6 px-6 py-6 desktop:grid-cols-2">
      <div>
        <dl className="divide-y divide-hairline border-y border-hairline">
          {SCHEDULE.map((row) => (
            <div
              key={row.day}
              className={`flex items-center justify-between py-3 text-sm ${
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
          className="mt-5 inline-block bg-ink px-6 py-3 text-xs font-semibold uppercase tracking-wider text-white transition-opacity hover:opacity-85"
        >
          Contact Us
        </a>
      </div>
      <div className="flex min-h-64 flex-col items-center justify-center gap-2 bg-cream text-muted">
        <PinIcon className="size-6" />
        <span className="text-xs uppercase tracking-wider">Map coming soon</span>
      </div>
    </section>
  )
}

export function HomePage() {
  return (
    <>
      <Hero />
      <section className="px-4 py-6 desktop:px-6">
        <PhotoGrid photos={HOMEPAGE_GALLERY} />
      </section>
      <FollowUsButton />
      <WhyUs />
      <Products />
      <ScheduleAndMap />
      <BookAppointmentCta subtext="Colour consultations are free. Walk-ins welcome when we have space." />
    </>
  )
}
