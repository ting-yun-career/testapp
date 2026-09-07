import { PageHeader } from '../components/PageHeader'
import { CtaBand } from '../components/CtaBand'
import { Container, Section } from '../components/layout'
import { Gallery, GalleryGrid, GalleryImage } from '../components/ui/shared-element-gallery'
import { useDocumentMeta } from '../hooks/useDocumentMeta'
import { GALLERY_IMAGES } from '../lib/galleryImages'

export default function GalleryPage() {
  useDocumentMeta(
    'Gallery — Silver4 Hair & Beauty Salon',
    'Recent cuts, colour, balayage and styling from the Silver4 Salon team in Vancouver.',
    '/gallery',
  )

  return (
    <>
      <PageHeader
        crumbLabel="Gallery"
        title={
          <>
            Recent <em>work</em>
          </>
        }
        lede="Cuts, colour and styling from the Silver4 floor. Tap any image to see it full size."
      />

      <Section>
        <Container wide>
          <Gallery>
            <GalleryGrid>
              {GALLERY_IMAGES.map((image, index) => (
                <GalleryImage key={image.src} id={String(index)} src={image.src} alt={image.alt} />
              ))}
            </GalleryGrid>
          </Gallery>
        </Container>
      </Section>

      <CtaBand
        eyebrow="Seen something you like?"
        title={
          <>
            Bring us a <em>reference</em>
          </>
        }
        body="Save the picture and show your stylist. Colour consultations are free."
      />
    </>
  )
}
