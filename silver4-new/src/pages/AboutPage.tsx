import { PageHeader } from '../components/PageHeader'
import { CtaBand } from '../components/CtaBand'
import { Container, Section, SectionHead, Split } from '../components/layout'
import { Eyebrow, Lede, Figure } from '../components/primitives'
import { DetailList, DetailRow, DetailVal } from '../components/DetailList'
import { Accordion, type AccordionItemData } from '../components/Accordion'
import { useReveal } from '../hooks/useReveal'
import { useDocumentMeta } from '../hooks/useDocumentMeta'
import storyPhoto from '../assets/gallery/about.webp'

const POLICY_ITEMS: AccordionItemData[] = [
  {
    id: 'satisfaction',
    summary: 'Satisfaction guarantee',
    content: (
      <>
        <p>
          The team at Silver4 Salon prides itself on providing you with an exceptional service
          and experience. All designers are licensed professionals and are committed to
          continuing education. We strive for 100% customer satisfaction and do not issue
          refunds.
        </p>
        <p>
          Please notify us within 72 hours if you are dissatisfied with our services. Redo
          appointments will usually be accommodated within 7 days. If the client schedules
          beyond this time, or chooses to reschedule, the appointment is no longer considered a
          redo and charges will apply.
        </p>
        <p>
          Certain services at Silver4 Salon will not be guaranteed without the purchase of
          at-home maintenance products bought directly from us. All discounted services are
          final sale — we do not offer a redo or refund on discounted services. Please inspect
          your result before leaving the salon.
        </p>
      </>
    ),
  },
  {
    id: 'cancellation',
    summary: 'Cancellation policy',
    content: (
      <p>
        To ensure we can provide the best customer service possible to our clients, we require
        48 hours&rsquo; notice of cancellation of any appointment, so our designers have the
        opportunity to schedule another client for that time. If 48 hours&rsquo; notice of
        cancellation is not given, up to a maximum of 100% of the charge of the service booked
        will be charged to your credit card.
      </p>
    ),
  },
  {
    id: 'deposit',
    summary: 'Deposit policy',
    content: (
      <p>
        A service that requires 3+ hours of scheduled time will be asked to place a 25% deposit
        at the time of booking to secure your appointment. This deposit will be non-refundable
        if the appointment is not cancelled within our 24-hour cancellation policy.
      </p>
    ),
  },
  {
    // ⬜ TO DECIDE WITH THE CLIENT: this is the 2020 COVID-19 safety plan from
    // the old site, parked here rather than deleted (see HANDOFF.md item 8).
    // Recommendation: keep a short evergreen hygiene paragraph and drop the
    // rest — most of it (temperature checks, the 10% discount) no longer
    // reflects how the salon operates.
    id: 'health',
    summary: 'Health & safety',
    content: (
      <>
        <p>
          Silver4 Salon is committed to protecting you and your family. Stations are cleaned
          thoroughly with disinfectant before every service, tools are disinfected between
          clients, and hand sanitiser is available to every guest on arrival.
        </p>
        <p>
          If you have flu-like symptoms, please let us know at booking time — even if they are
          mild — and we will reschedule you at no cost.
        </p>
        <p>
          <small>Our full 2020 COVID-19 safety plan is retained on file and available on request.</small>
        </p>
      </>
    ),
  },
]

function StoryCopy() {
  const { ref, className } = useReveal<HTMLDivElement>(0)
  return (
    <div ref={ref} className={`flex flex-col gap-6 ${className}`}>
      <Eyebrow>Our story</Eyebrow>
      <h2>
        If you hated going to the hair salon <em>because</em>&hellip;
      </h2>
      <DetailList as="ul" className="mt-6">
        <DetailRow as="li">
          <DetailVal as="span">It takes too long to finish.</DetailVal>
        </DetailRow>
        <DetailRow as="li">
          <DetailVal as="span">You dislike sitting down with nothing to do.</DetailVal>
        </DetailRow>
        <DetailRow as="li">
          <DetailVal as="span">The stylist doesn&rsquo;t wash your hair properly.</DetailVal>
        </DetailRow>
      </DetailList>
      <Lede className="mt-6">This will not happen at Silver4 Salon.</Lede>
      <p>
        At Silver4 we have introduced the world&rsquo;s most comfortable Japanese hair washing
        unit, which combines hair washing, body massage and chromatherapy in one service.
        Chromatherapy is known to have the effect of calming the emotions and blood pressure,
        brightening the skin, and more.
      </p>
      <p>
        Our feature hair care product, Kérastase, is the icon of the highest quality hair care
        brands. It sets the most reputable standard in the industry — only selected hair salons
        may use or promote their products, and the customers of those salons are the ones who
        judge the result.
      </p>
      <p>
        The service we provide is a complete experience and much more than a typical hair salon.
        Here you are getting more than just a haircut: you are getting an unforgettable
        experience having your hair washed by our stylists.
      </p>
    </div>
  )
}

function StoryPhoto() {
  const { ref, className } = useReveal<HTMLDivElement>(120)
  return (
    <div ref={ref} className={className}>
      <Figure
        ratio="2/3"
        src={storyPhoto}
        alt="Illustration of a client reclined for a hair wash"
        loading="lazy"
        decoding="async"
      />
    </div>
  )
}

export default function AboutPage() {
  useDocumentMeta(
    'About — Silver4 Hair & Beauty Salon',
    'About Silver4 Salon in Vancouver: the Japanese hair washing unit, chromatherapy, Kérastase, our VVIP package and our guest policies.',
  )

  return (
    <>
      <PageHeader
        crumbLabel="About"
        title={
          <>
            About <em>Silver4</em>
          </>
        }
        lede="A complete experience, and much more than a typical hair salon."
      />

      <Section>
        <Container>
          <Split copyWide>
            <StoryCopy />
            <StoryPhoto />
          </Split>
        </Container>
      </Section>

      <Section>
        <Container narrow>
          <SectionHead>
            <Eyebrow>Guest information</Eyebrow>
            <h2>Policies</h2>
          </SectionHead>
          <Accordion items={POLICY_ITEMS} single />
        </Container>
      </Section>

      <CtaBand
        eyebrow="Come and see"
        title={
          <>
            The best hair wash of your <em>life</em>
          </>
        }
      />
    </>
  )
}
