/* ==========================================================================
   carousel.js — ⬜ PLACEHOLDER / PARTIAL
   --------------------------------------------------------------------------
   STATUS: the arrow buttons work. Dots and autoplay are NOT implemented.

   The carousel is usable with no JS at all: .carousel__viewport is a CSS
   scroll-snap strip, so it already swipes on touch devices. This module only
   adds the desktop arrow controls. Everything below marked TODO is yours.

   Markup contract:
     .carousel[data-carousel]
       .carousel__viewport[data-carousel-viewport]
         .carousel__slide            (one per item)
       .carousel__controls
         button[data-carousel-prev]
         button[data-carousel-next]
       -- not yet in the markup, add when you implement dots --
       .carousel__dots[data-carousel-dots]

   Optional attributes you may want to honour:
     data-carousel-autoplay="5000"   ms between advances
     data-carousel-loop              wrap around at the ends

   TODO(you) — 1. DOTS
     Generate one button per slide into [data-carousel-dots]; set
     aria-current on the active one; clicking scrolls to that slide.
     Keep them in sync with the scroll position (see the observer note below).

   TODO(you) — 2. ACTIVE-SLIDE TRACKING
     The clean way is an IntersectionObserver on the slides with
     `root: viewport, threshold: 0.6`, not a scroll listener. Store the index
     and use it for the dots and for disabling the arrows at the ends.

   TODO(you) — 3. AUTOPLAY
     setInterval that calls scrollByOneSlide(1). Must:
       - pause on pointerenter / focusin, resume on leave
       - pause when the carousel is offscreen (IntersectionObserver)
       - not run at all under prefers-reduced-motion
       - stop permanently after the first manual interaction

   TODO(you) — 4. ARIA
     Add role="group" aria-roledescription="carousel" to .carousel and
     aria-label="Slide N of M" to each slide, then announce changes in a
     polite live region. Or, if you'd rather not own this, swap the whole
     module for Splide / Embla / Swiper — the markup contract above maps onto
     all three with minimal edits.
   ========================================================================== */

export function init() {
  const carousels = document.querySelectorAll("[data-carousel]");
  if (carousels.length === 0) return;

  for (const carousel of carousels) {
    const viewport = carousel.querySelector("[data-carousel-viewport]");
    if (!viewport) continue;

    const prev = carousel.querySelector("[data-carousel-prev]");
    const next = carousel.querySelector("[data-carousel-next]");

    prev?.addEventListener("click", () => scrollByOneSlide(viewport, -1));
    next?.addEventListener("click", () => scrollByOneSlide(viewport, 1));
  }
}

/* Scrolls the viewport by exactly one slide width (including the gap), so it
   lands on a snap point rather than somewhere between two. */
function scrollByOneSlide(viewport, direction) {
  const slide = viewport.querySelector(".carousel__slide");
  if (!slide) return;

  const gap = Number.parseFloat(getComputedStyle(viewport).columnGap) || 0;
  const step = slide.getBoundingClientRect().width + gap;

  viewport.scrollBy({ left: step * direction, behavior: "smooth" });
}
