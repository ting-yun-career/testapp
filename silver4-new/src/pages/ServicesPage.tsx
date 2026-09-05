import { PageHeader } from '../components/PageHeader'
import { JumpNav } from '../components/JumpNav'
import { CtaBand } from '../components/CtaBand'
import { Container, Section, SectionHead, Stack } from '../components/layout'
import { Eyebrow, Lede, Figure } from '../components/primitives'
import { PriceList, PriceNotes, PriceRow } from '../components/PriceList'
import { useDocumentMeta } from '../hooks/useDocumentMeta'

const JUMP_LINKS = [
  { href: '#haircut', label: 'Haircut' },
  { href: '#styling', label: 'Shampoo & Styling' },
  { href: '#colour', label: 'Colour' },
  { href: '#perm', label: 'Perm & Texture' },
  { href: '#headspa', label: 'Head Spa & Treatment' },
]

export default function ServicesPage() {
  useDocumentMeta(
    'Services & Prices — Silver4 Hair & Beauty Salon',
    'Silver4 Salon price list: haircuts, shampoo and styling, colour and balayage, perms and Japanese straightening, head spa and Kérastase treatments.',
  )

  return (
    <>
      <PageHeader
        crumbLabel="Services"
        title={
          <>
            Services &amp; <em>prices</em>
          </>
        }
        lede="Prices are a starting range and vary with the level of your stylist and the length and density of your hair. Colour consultations are always free."
      />

      <Section>
        <Container>
          <JumpNav links={JUMP_LINKS} />

          <Stack gap="xl">
            <section id="haircut" className="flex flex-col gap-6">
              <h2 className="text-[30px]">Haircut</h2>
              <PriceNotes>
                <p>Includes wash, scalp massage, conditioning, blow-dry and style.</p>
                <p>Undo styling does not include shampoo; to add shampoo, $35.</p>
              </PriceNotes>
              <PriceList>
                <PriceRow name="Men" price="$55+ – $75+" />
                <PriceRow name="Women" price="$75+ – $95+" />
                <PriceRow name="Kids" price="$45+ – $65+" />
              </PriceList>
            </section>

            <section id="styling" className="flex flex-col gap-6">
              <h2 className="text-[30px]">Shampoo &amp; Styling</h2>
              <PriceList>
                <PriceRow name="Shampoo + Styling" price="$50+ – $75+" />
                <PriceRow name="Undo Styling" price="$75+ – $95+" />
              </PriceList>
            </section>

            <section id="colour" className="flex flex-col gap-6">
              <h2 className="text-[30px]">
                Colour <em>·</em> consultation free
              </h2>
              <PriceNotes>
                <p>Price varies according to the level of stylist.</p>
                <p>Includes shampoo and styling.</p>
                <p>Prices do not include a toner.</p>
              </PriceNotes>
              <PriceList>
                <PriceRow name="New Growth" note="Under 1 inch" price="$135+" />
                <PriceRow name="All Over Hair Colour" price="$165+ – $250+" />
                <PriceRow name="Partial Highlights" price="$185+ – $255+" />
                <PriceRow name="Full Highlights" price="$255+ – $325+" />
                <PriceRow name="Partial Balayage" price="$280+ – $360+" />
                <PriceRow name="Full Balayage" price="$320+ – $400+" />
                <PriceRow name="Toner" note="Add-on for colour services" price="$75+ – $120+" />
                <PriceRow name="Blonding — New Growth" price="By consultation" priceIsText />
                <PriceRow name="Blonding — Full Length" price="By consultation" priceIsText />
                <PriceRow name="Colour Correction" price="By consultation" priceIsText />
              </PriceList>
            </section>

            <section id="perm" className="flex flex-col gap-6">
              <h2 className="text-[30px]">Perm &amp; Texture</h2>
              <PriceNotes>
                <p>Includes shampoo and styling.</p>
              </PriceNotes>
              <PriceList>
                <PriceRow name="Permanent Wave" price="$160+ – $260" />
                <PriceRow name="Digital Perm" price="$270+ – $380" />
                <PriceRow name="Japanese Straightening" price="$270+ – $380" />
                <PriceRow name="Down Perm" note="Add-on service" price="$40+" />
                <PriceRow name="Bang Perm" note="Add-on service" price="$50+" />
              </PriceList>
            </section>

            <section id="headspa" className="flex flex-col gap-6">
              <h2 className="text-[30px]">
                Head Spa &amp; Hair <em>Treatment</em>
              </h2>
              <PriceNotes>
                <p>Includes shampoo and styling.</p>
              </PriceNotes>
              <PriceList>
                <PriceRow name="Silver4 Head Spa" price="$160+ – $260" />
                <PriceRow name="Silver4 Scalp Treatment" price="$120+ – $200" />
                <PriceRow name="Kérastase Hair Masque Treatment" price="$120+ – $200" />
                <PriceRow name="Kérastase Fusio-Dose" note="Add-on" price="$58 per bottle" />
                <PriceRow name="Kérastase Chronologiste Caviar Treatment" price="$260+ – $400" />
              </PriceList>
            </section>
          </Stack>
        </Container>
      </Section>

      {/* ⬜ TO REPLACE (HANDOFF.md item 7): the old site published the VVIP
          tiers as a flat, unreadable-on-phone image. Embedded as-is so
          nothing is lost; the tiers should be re-typed as text using
          PriceRow. */}
      <Section className="bg-paper-alt" id="vvip">
        <Container>
          <SectionHead>
            <Eyebrow>Members</Eyebrow>
            <h2>
              The VVIP <em>package</em>
            </h2>
            <Lede>
              Prepaid packages for guests who visit us regularly. Ask at reception for the
              current terms.
            </Lede>
          </SectionHead>
          <Figure
            ratio="16/9"
            contain
            src="https://silver4salon.com/asset/vvip/content.png"
            alt="Silver4 VVIP package details"
            loading="lazy"
            decoding="async"
          />
          <p className="mt-6 text-muted">
            <small>⬜ Placeholder: this content needs re-typing as text. See the comment in the source.</small>
          </p>
        </Container>
      </Section>

      <CtaBand
        eyebrow="Not sure which service?"
        title={
          <>
            Book a free <em>consultation</em>
          </>
        }
        body="We'll look at your hair, talk through what's realistic and quote you before we start."
      />
    </>
  )
}
