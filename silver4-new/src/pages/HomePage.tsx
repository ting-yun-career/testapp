import { useState } from "react";
import { Hero } from "../components/sections/Hero";
import { Testimonials } from "../components/sections/Testimonials";
import { TeamCard } from "../components/sections/TeamCard";
import { Map } from "../components/sections/Map";
import CardFanCarousel from "../components/ui/card-fan-carousel";
import { getFanInitialCenterIndex } from "../components/ui/card-fan-carousel-utils";
import { CtaBand } from "../components/CtaBand";
import {
  Container,
  Section,
  SectionHead,
  Grid,
  Cluster,
  Stack,
} from "../components/layout";
import { Eyebrow, Lede } from "../components/primitives";
import { Button } from "../components/Button";
import {
  DetailList,
  DetailRow,
  DetailKey,
  DetailVal,
} from "../components/DetailList";
import { useHours } from "../hooks/useHours";
import { useDocumentMeta } from "../hooks/useDocumentMeta";
import { HOURS, HOURS_DISPLAY_ORDER, SERVICES_URL } from "../lib/constants";
import { HOME_GALLERY_TEASER } from "../lib/galleryImages";
import yiPhoto from "../assets/team/yi.webp";
import kawalPhoto from "../assets/team/kawal.webp";
import beccaPhoto from "../assets/team/becca.webp";
import mikePhoto from "../assets/team/mike.webp";

const TEAM_TEASER = [
  {
    name: "Yi",
    role: "Stylist",
    img: yiPhoto,
    langs: "English · Mandarin · Cantonese",
    delay: 0,
  },
  {
    name: "Kawal",
    role: "Stylist",
    img: kawalPhoto,
    langs: "English",
    delay: 80,
  },
  {
    name: "Becca",
    role: "Stylist",
    img: beccaPhoto,
    langs: "English",
    delay: 160,
  },
  {
    name: "Mike",
    role: "Stylist",
    img: mikePhoto,
    langs: "English",
    delay: 240,
  },
];

export default function HomePage() {
  useDocumentMeta(
    "Silver4 Hair & Beauty Salon — Vancouver",
    "Silver4 Salon in Vancouver: precision cuts, colour, balayage, Japanese straightening and the head spa experience with Kérastase and the world's most comfortable Japanese hair washing unit.",
  );

  const { today, status } = useHours();
  const [activeTeaserIndex, setActiveTeaserIndex] = useState(() =>
    getFanInitialCenterIndex(HOME_GALLERY_TEASER.length),
  );

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
              Every cut includes a wash, scalp massage, conditioning, blow-dry
              and style. Colour consultations are always free.
            </Lede>
          </SectionHead>

          <Cluster className="mt-4">
            <Button
              variant="primary"
              href={SERVICES_URL}
              target="_blank"
              rel="noopener"
            >
              View services &amp; pricing
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
          <SectionHead className="!mb-6">
            <Eyebrow invert>Gallery</Eyebrow>
            <h2>Recent work</h2>
          </SectionHead>
        </Container>

        <CardFanCarousel
          cards={HOME_GALLERY_TEASER.map((image) => ({
            imgUrl: image.src,
            alt: image.alt,
          }))}
          onCenterChange={setActiveTeaserIndex}
        />

        <p className="max-w-none text-center text-sm tracking-wide uppercase text-paper/60">
          {HOME_GALLERY_TEASER[activeTeaserIndex]?.tag}
        </p>

        <Container className="mt-6">
          <Cluster>
            <Button variant="outline" to="/gallery">
              View the full gallery
            </Button>
          </Cluster>
        </Container>
      </Section>

      <Section className="bg-paper-alt" id="visit">
        <Container>
          <Stack>
            <Eyebrow>Visit us</Eyebrow>
            <h2>
              Open <em>every</em> day
            </h2>
            <p className="text-muted">{status?.text ?? " "}</p>
          </Stack>
          <div className="mt-10 flex flex-col lg:flex-row gap-12 lg:gap-[clamp(3rem,5vw,6rem)]">
            <Stack gap="lg" className="flex-1">
              <DetailList>
                {HOURS_DISPLAY_ORDER.map((day) => {
                  const row = HOURS.find((h) => h.day === day)!;
                  const isToday = today === day;
                  return (
                    <DetailRow key={day}>
                      <DetailKey today={isToday}>{row.label}</DetailKey>
                      <DetailVal
                        today={isToday}
                        openTime={row.openTime}
                        closeTime={row.closeTime}
                      >
                        {row.display}
                      </DetailVal>
                    </DetailRow>
                  );
                })}
              </DetailList>

              <Cluster>
                <Button variant="primary" href="#site-footer">
                  Contact us
                </Button>
              </Cluster>
            </Stack>

            <div className="flex-1">
              <Map />
            </div>
          </div>
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
  );
}
