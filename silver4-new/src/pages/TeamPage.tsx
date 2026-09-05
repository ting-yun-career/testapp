import { PageHeader } from '../components/PageHeader'
import { CtaBand } from '../components/CtaBand'
import { Container, Section, Grid } from '../components/layout'
import { TeamCard } from '../components/sections/TeamCard'
import { useDocumentMeta } from '../hooks/useDocumentMeta'

// ⬜ TO REPLACE (HANDOFF.md item 5): every portrait is a placehold.co
// stand-in. Bios are carried over verbatim from silver4salon.com; Alberto's
// and Sam's were empty on the old site (⬜ TO CONFIRM with the client).
const TEAM = [
  {
    name: 'Yi',
    role: 'Stylist',
    img: 'https://placehold.co/600x800/f5f2ee/8b847e?text=Yi',
    langs: 'English · Mandarin · Cantonese',
    delay: 0,
    bio: "Graduated from Blanche Macdonald and Vidal Sassoon, with over six years of experience in hair beauty. She specialises in styling, colour and hair treatment. Passionate about art and beauty, she is always looking for creative ways to bring the two into her work.",
  },
  {
    name: 'Kawal',
    role: 'Colour & Cutting',
    img: 'https://placehold.co/600x800/f5f2ee/8b847e?text=Kawal',
    langs: 'English',
    delay: 80,
    bio: 'With over ten years of experience as a hair artist, Kawal has perfected her craft when it comes to colouring and cutting hair. She specialises in all things hair colour and cuts, and offers smoothing treatments for unmanageable hair textures. If you are looking for a hairdresser who cares about your hair goals, Kawal is your stylist.',
  },
  {
    name: 'Becca',
    role: 'Transformations',
    img: 'https://placehold.co/600x800/f5f2ee/8b847e?text=Becca',
    langs: 'English',
    delay: 160,
    bio: 'Ten years in the hair industry, running under “Becca Milani Hair Inc.” since 2020. Becca is great with transformations. Contact her online to book.',
  },
  {
    name: 'Alberto',
    role: 'Stylist',
    img: 'https://placehold.co/600x800/f5f2ee/8b847e?text=Alberto',
    langs: 'English · Spanish',
    delay: 0,
    bio: 'Bio to come.',
    bioMuted: true,
  },
  {
    name: 'Sam',
    role: 'Stylist',
    img: 'https://placehold.co/600x800/f5f2ee/8b847e?text=Sam',
    langs: 'English · Korean',
    delay: 80,
    bio: 'Bio to come.',
    bioMuted: true,
  },
  {
    name: 'Viola',
    role: 'Reception',
    img: 'https://placehold.co/600x800/f5f2ee/8b847e?text=Viola',
    langs: 'English · Mandarin · Cantonese',
    delay: 160,
    bio: 'Viola is an awesome receptionist. She practises excellent verbal communication, active listening and great customer service. She is friendly, approachable and likeable — and, most importantly, has a helpful attitude and a natural interest in talking with people.',
  },
]

export default function TeamPage() {
  useDocumentMeta(
    'Our Stylists — Silver4 Hair & Beauty Salon',
    'Meet the Silver4 Salon team: stylists and colourists in Vancouver working in English, Mandarin, Cantonese, Korean and Spanish.',
  )

  return (
    <>
      <PageHeader
        crumbLabel="Our Stylists"
        title={
          <>
            The team behind the <em>chair</em>
          </>
        }
        lede="Between us we speak English, Mandarin, Cantonese, Korean and Spanish. Ask for whoever you like when you book."
      />

      <Section>
        <Container>
          <Grid cols={3}>
            {TEAM.map((member) => (
              <TeamCard
                key={member.name}
                name={member.name}
                role={member.role}
                imgSrc={member.img}
                imgAlt={`Portrait of ${member.name}`}
                langs={member.langs}
                bio={member.bio}
                bioMuted={member.bioMuted}
                delay={member.delay}
                headingLevel="h2"
              />
            ))}
          </Grid>
        </Container>
      </Section>

      <CtaBand
        eyebrow="Have someone in mind?"
        title={
          <>
            Book with your <em>stylist</em>
          </>
        }
        body="Choose your stylist and service when you book online, or call and we'll match you."
      />
    </>
  )
}
