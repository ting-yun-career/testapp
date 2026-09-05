import { Icon } from '../Icon'
import { useCarouselScroll } from '../../hooks/useCarouselScroll'

// ⬜ TO REPLACE (per HANDOFF.md item 6): stand-in copy — pull the client's
// real Google reviews.
const TESTIMONIALS = [
  {
    quote:
      '"I came for a trim and stayed for the hair wash. I have genuinely never been that relaxed in a salon chair."',
    author: 'Jamie, 34, Female',
  },
  {
    quote:
      '"My balayage grew out beautifully instead of turning into a line. That\'s the whole difference."',
    author: 'Priya, 28, Female',
  },
  {
    quote: '"The head spa is worth the price on its own. I book it between colour appointments now."',
    author: 'Marcus, 41, Male',
  },
  {
    quote:
      '"Japanese straightening here held for nearly a year. Nobody rushed me and nobody upsold me."',
    author: 'Ella, 25, Female',
  },
]

/* ==========================================================================
   Testimonials carousel — ported from .carousel/.testimonial in
   05-sections.css + js/carousel.js. Arrows scroll by one slide; swiping
   already works via the CSS scroll-snap strip with no JS at all. Dots and
   autoplay were never implemented upstream either (see the hand-off's
   carousel.js header) — only the working arrow behaviour is ported here.
   ========================================================================== */
export function Testimonials() {
  const { viewportRef, scrollPrev, scrollNext } = useCarouselScroll()

  return (
    <div className="relative">
      <div
        ref={viewportRef}
        className="grid grid-flow-col auto-cols-[88%] md:auto-cols-[46%] lg:auto-cols-[31.5%] gap-6 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {TESTIMONIALS.map((t) => (
          <article
            key={t.author}
            data-carousel-slide
            className="snap-center flex flex-col gap-6 h-full p-8 border border-line bg-paper"
          >
            <p className="flex gap-0.5 text-accent text-[1.125rem]" aria-label="Five out of five stars">
              <Icon name="star" filled />
              <Icon name="star" filled />
              <Icon name="star" filled />
              <Icon name="star" filled />
              <Icon name="star" filled />
            </p>
            <blockquote className="font-display text-sm italic leading-snug text-ink max-w-none">
              {t.quote}
            </blockquote>
            <p className="mt-auto text-xs tracking-wide uppercase text-muted">{t.author}</p>
          </article>
        ))}
      </div>

      <div className="flex justify-center gap-2 mt-6">
        <button
          type="button"
          onClick={scrollPrev}
          className="grid place-items-center w-11 h-11 border border-line-dark rounded-full transition-colors duration-[280ms] ease-[cubic-bezier(0.22,0.61,0.36,1)] hover:border-accent-soft hover:text-accent-soft"
        >
          <span className="sr-only">Previous review</span>
          <Icon name="arrow_back" />
        </button>
        <button
          type="button"
          onClick={scrollNext}
          className="grid place-items-center w-11 h-11 border border-line-dark rounded-full transition-colors duration-[280ms] ease-[cubic-bezier(0.22,0.61,0.36,1)] hover:border-accent-soft hover:text-accent-soft"
        >
          <span className="sr-only">Next review</span>
          <Icon name="arrow_forward" />
        </button>
      </div>
    </div>
  )
}
