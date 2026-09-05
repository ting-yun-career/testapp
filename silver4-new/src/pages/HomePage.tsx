import { Hero } from '../components/sections/Hero'
import { Testimonials } from '../components/sections/Testimonials'
import { TeamCard } from '../components/sections/TeamCard'
import { Map } from '../components/sections/Map'
import CardFanCarousel from '../components/ui/card-fan-carousel'
import { CtaBand } from '../components/CtaBand'
import { Container, Section, SectionHead, Grid, Cluster, Stack, Split } from '../components/layout'
import { Eyebrow, Lede } from '../components/primitives'
import { Button } from '../components/Button'
import { BorderedCardLink, CardMeta, CardTitle, CardBody } from '../components/Card'
import { DetailList, DetailRow, DetailKey, DetailVal } from '../components/DetailList'
import { useHours } from '../hooks/useHours'
import { useReveal } from '../hooks/useReveal'
import { useDocumentMeta } from '../hooks/useDocumentMeta'
import { HOURS, HOURS_DISPLAY_ORDER } from '../lib/constants'
import { GALLERY_IMAGES, HOME_GALLERY_TEASER_SRCS } from '../lib/galleryImages'

const SERVICE_CARDS = [
  { href: '/services#haircut', meta: 'From $45', title: 'Haircut', body: 'Men, women and kids. Includes wash, scalp massage, conditioning, blow-dry and style.', delay: 0 },
  { href: '/services#styling', meta: 'From $50', title: 'Shampoo & Styling', body: 'Everyday styling through to updos for weddings and events.', delay: 80 },
  { href: '/services#colour', meta: 'From $135 · Free consult', title: 'Colour', body: 'All-over colour, highlights, balayage, blonding and colour correction.', delay: 160 },
  { href: '/services#perm', meta: 'From $160', title: 'Perm & Texture', body: 'Permanent wave, digital perm and Japanese straightening.', delay: 0 },
  { href: '/services#headspa', meta: 'From $120', title: 'Head Spa & Treatment', body: 'Our signature scalp and hair treatments, including Kérastase Fusio-Dose and Chronologiste.', delay: 80 },
  { href: '/services#vvip', meta: 'Members', title: 'VVIP Package', body: 'Prepaid packages for guests who visit regularly. Ask at reception for current terms.', delay: 160 },
]

// ⬜ TO REPLACE (HANDOFF.md item 5): placehold.co stand-ins.
const TEAM_TEASER = [
  { name: 'Yi', role: 'Stylist', img: 'https://placehold.co/600x800/f5f2ee/8b847e?text=Yi', langs: 'English · Mandarin · Cantonese', delay: 0 },
  { name: 'Kawal', role: 'Colour & Cutting', img: 'https://placehold.co/600x800/f5f2ee/8b847e?text=Kawal', langs: 'English', delay: 80 },
  { name: 'Becca', role: 'Transformations', img: 'https://placehold.co/600x800/f5f2ee/8b847e?text=Becca', langs: 'English', delay: 160 },
  { name: 'Sam', role: 'Stylist', img: 'https://placehold.co/600x800/f5f2ee/8b847e?text=Sam', langs: 'English · Korean', delay: 240 },
]

function ServiceCard({ href, meta, title, body, delay }: (typeof SERVICE_CARDS)[number]) {
  const { ref, className } = useReveal<HTMLAnchorElement>(delay)
  return (
    <BorderedCardLink to={href} className={className} ref={ref}>
      <CardMeta>{meta}</CardMeta>
      <CardTitle>{title}</CardTitle>
      <CardBody>{body}</CardBody>
    </BorderedCardLink>
  )
}

export default function HomePage() {
  useDocumentMeta(
    'Silver4 Hair & Beauty Salon — Vancouver',
    "Silver4 Salon in Vancouver: precision cuts, colour, balayage, Japanese straightening and the head spa experience with Kérastase and the world's most comfortable Japanese hair washing unit.",
  )

  const { today, status } = useHours()
  const teaserImages = HOME_GALLERY_TEASER_SRCS.map(
    (src) => GALLERY_IMAGES.find((img) => img.src === src)!,
  )

  return (
    <div className="page-home">
      <Hero />

      <Section className="bg-paper-alt">
        <Container>
          <SectionHead>
            <Eyebrow>Services</Eyebrow>
            <h2>
              Cut, colour, texture and <em>care</em>
            </h2>
            <Lede>
              Every cut includes a wash, scalp massage, conditioning, blow-dry and style. Colour
              consultations are always free.
            </Lede>
          </SectionHead>

          <Grid cols={3}>
            {SERVICE_CARDS.map((card) => (
              <ServiceCard key={card.href} {...card} />
            ))}
          </Grid>

          <Cluster className="mt-12">
            <Button variant="primary" to="/services">
              See the full price list
            </Button>
          </Cluster>
        </Container>
      </Section>

      <Section className="bg-ink text-paper">
        <Container>
          <SectionHead>
            <Eyebrow invert>Guest reviews</Eyebrow>
            <h2>
              What people say <em>afterwards</em>
            </h2>
          </SectionHead>
          <Testimonials />
        </Container>
      </Section>

      <Section>
        <Container>
          <SectionHead>
            <Eyebrow>Our stylists</Eyebrow>
            <h2>
              The people behind the <em>chair</em>
            </h2>
          </SectionHead>

          <Grid cols={4}>
            {TEAM_TEASER.map((member) => (
              <TeamCard
                key={member.name}
                name={member.name}
                role={member.role}
                imgSrc={member.img}
                imgAlt={`${member.name}, ${member.role.toLowerCase()}`}
                langs={member.langs}
                delay={member.delay}
              />
            ))}
          </Grid>

          <Cluster className="mt-12">
            <Button variant="outline" to="/team">
              Meet the whole team
            </Button>
          </Cluster>
        </Container>
      </Section>

      <Section className="bg-ink text-paper">
        <Container>
          <SectionHead>
            <Eyebrow invert>Gallery</Eyebrow>
            <h2>Recent work</h2>
          </SectionHead>
        </Container>

        <CardFanCarousel
          cards={teaserImages.map((image) => ({
            imgUrl: image.src,
            alt: image.alt,
            linkUrl: '/gallery',
          }))}
        />

        <Container className="mt-12">
          <Cluster>
            <Button variant="outline" to="/gallery">
              View the full gallery
            </Button>
          </Cluster>
        </Container>
      </Section>

      <Section className="bg-paper-alt" id="visit">
        <Container>
          <Split copyWide>
            <Stack gap="lg">
              <Stack>
                <Eyebrow>Visit us</Eyebrow>
                <h2>
                  Open <em>every</em> day
                </h2>
                <p className="text-muted">{status?.text ?? ' '}</p>
              </Stack>

              <DetailList>
                {HOURS_DISPLAY_ORDER.map((day) => {
                  const row = HOURS.find((h) => h.day === day)!
                  const isToday = today === day
                  return (
                    <DetailRow key={day}>
                      <DetailKey today={isToday}>{row.label}</DetailKey>
                      <DetailVal today={isToday} openTime={row.openTime} closeTime={row.closeTime}>
                        {row.display}
                      </DetailVal>
                    </DetailRow>
                  )
                })}
              </DetailList>

              <Cluster>
                <Button variant="primary" href="#site-footer">
                  Contact us
                </Button>
              </Cluster>
            </Stack>

            <Map />
          </Split>
        </Container>
      </Section>

      <CtaBand
        eyebrow="Ready when you are"
        title={
          <>
            Book your <em>appointment</em>
          </>
        }
        body="Colour consultations are free. Walk-ins welcome when we have space."
      />
    </div>
  )
}
