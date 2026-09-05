import { useRef } from 'react'

/** Ported from js/carousel.js — the arrow buttons scroll the viewport by
    exactly one slide width (including the gap) so it lands on a snap point.
    Swiping already works with no JS at all via CSS scroll-snap. */
export function useCarouselScroll() {
  const viewportRef = useRef<HTMLDivElement | null>(null)

  function scrollByOneSlide(direction: 1 | -1) {
    const viewport = viewportRef.current
    const slide = viewport?.querySelector<HTMLElement>('[data-carousel-slide]')
    if (!viewport || !slide) return

    const gap = Number.parseFloat(getComputedStyle(viewport).columnGap) || 0
    const step = slide.getBoundingClientRect().width + gap
    viewport.scrollBy({ left: step * direction, behavior: 'smooth' })
  }

  return { viewportRef, scrollPrev: () => scrollByOneSlide(-1), scrollNext: () => scrollByOneSlide(1) }
}
