import { Container } from '../layout'
import type { GalleryImage } from '../../lib/galleryImages'

/* ==========================================================================
   Gallery grid — ported from .gallery-grid in 05-sections.css. Every 7th
   tile spans two columns (and gets a wider aspect ratio) at md+, for rhythm.
   Clicking falls through to the full-size image — js/gallery.js never
   implemented the lightbox, so this fallback is the real, shipped behaviour.
   ========================================================================== */
export function GalleryGrid({ images, captions = false }: { images: GalleryImage[]; captions?: boolean }) {
  return (
    <Container as="ul" wide className="grid grid-cols-2 gap-2 md:grid-cols-3 md:gap-3 lg:grid-cols-4">
      {images.map((image, index) => {
        const wide = index % 7 === 0
        return (
          <li key={image.src} className={wide ? 'md:col-span-2' : ''}>
            <a
              href={image.src}
              data-gallery-item
              className="relative block after:content-[''] after:absolute after:inset-0 after:bg-ink after:opacity-0 hover:after:opacity-[0.18] after:transition-opacity after:duration-[280ms] after:ease-[cubic-bezier(0.22,0.61,0.36,1)]"
            >
              <div
                className={`relative overflow-hidden bg-paper-alt aspect-square ${wide ? 'md:aspect-[8/5]' : ''}`}
              >
                <img src={image.src} alt={image.alt} loading="lazy" decoding="async" className="w-full h-full object-cover" />
              </div>
              {captions && <span className="sr-only">{image.alt}</span>}
            </a>
          </li>
        )
      })}
    </Container>
  )
}
