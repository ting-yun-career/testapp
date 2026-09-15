import { ExpandableImage } from '../components/ExpandableImage'
import { PhotoGrid } from '../components/PhotoGrid'
import { FollowUsButton } from '../components/FollowUsButton'
import { SectionHeading } from '../components/SectionHeading'
import { BookAppointmentCta } from '../components/BookAppointmentCta'
import { HAIR_SERVICE_GALLERY, STYLISTS } from '../data/site'

function ServiceHero() {
  return (
    <section className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-8 desktop:flex-row desktop:items-center desktop:gap-14">
      <div className="aspect-4/3 w-full bg-cream desktop:w-1/2" />
      <div className="desktop:w-1/2">
        <h1 className="font-display text-4xl desktop:text-5xl">Curated Hair Services</h1>
        <p className="mt-4 max-w-md text-sm leading-relaxed text-muted">
          At Silver4, styling is elevated into a therapeutic self-care practice. Every treatment
          begins with a complimentary aroma-infused sensory diagnostic, paving the way for
          customized cuts, premium plant-based coloring, and restorative scalp therapy. Our
          stylists combine contemporary mastercraft with absolute quietude to nourish both your
          crown and spirit.
        </p>
      </div>
    </section>
  )
}

function StylistCard({ stylist }: { stylist: (typeof STYLISTS)[number] }) {
  return (
    <div className="flex flex-col gap-3">
      {stylist.image ? (
        <ExpandableImage
          src={stylist.image}
          alt={stylist.name}
          className="aspect-3/4 w-full object-cover"
        />
      ) : (
        <div className="aspect-3/4 w-full bg-cream" />
      )}
      <p className="text-xs font-semibold uppercase tracking-wider text-accent">{stylist.role}</p>
      <h3 className="font-display text-2xl">{stylist.name}</h3>
      <p className="text-sm leading-relaxed text-muted">{stylist.bio}</p>
      <p className="border-t border-hairline pt-3 text-xs uppercase tracking-wider text-muted">
        {stylist.languages}
      </p>
    </div>
  )
}

export function HairServicesPage() {
  return (
    <>
      <ServiceHero />

      <SectionHeading eyebrow="Aesthetic Portfolio" title="Masterwork from the Studio Floor" />
      <section className="px-4 py-6 desktop:px-6">
        <PhotoGrid photos={HAIR_SERVICE_GALLERY} />
      </section>

      <FollowUsButton />

      <SectionHeading
        eyebrow="Premium Craftsmen"
        title="Masters of the Ritual"
        subtitle="A curated collective of stylists, colorists, and wellness practitioners committed to styling as a high art form."
      />
      <section className="mx-auto max-w-6xl px-6 py-6">
        <div className="grid grid-cols-2 gap-6 desktop:grid-cols-4">
          {STYLISTS.map((stylist) => (
            <StylistCard key={stylist.name} stylist={stylist} />
          ))}
        </div>
      </section>

      <BookAppointmentCta subtext="Book your appointment for a cut, color, or restorative scalp ritual." />
    </>
  )
}
