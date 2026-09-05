import { PageHeader } from '../components/PageHeader'
import { CtaBand } from '../components/CtaBand'
import { Section } from '../components/layout'
import { GalleryGrid } from '../components/sections/GalleryGrid'
import { Lightbox } from '../components/sections/Lightbox'
import { useDocumentMeta } from '../hooks/useDocumentMeta'
import { GALLERY_IMAGES } from '../lib/galleryImages'

export default function GalleryPage() {
  useDocumentMeta(
    'Gallery — Silver4 Hair & Beauty Salon',
    'Recent cuts, colour, balayage and styling from the Silver4 Salon team in Vancouver.',
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
        <GalleryGrid images={GALLERY_IMAGES} captions />
      </Section>

      <Lightbox />

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
