/* ==========================================================================
   reveal.js — fade-and-rise elements as they enter the viewport
   --------------------------------------------------------------------------
   Markup contract: any element with [data-reveal].
   Optional: [data-reveal-delay="120"] in milliseconds.

   Note the order of operations: elements are VISIBLE in CSS by default. This
   module adds data-reveal-armed to hide them, then data-reveal-visible to
   bring them in. So if JS fails or is disabled, nothing is ever invisible.
   ========================================================================== */

export function init() {
  const targets = document.querySelectorAll("[data-reveal]");
  if (targets.length === 0) return;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  for (const el of targets) el.dataset.revealArmed = "true";

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const el = entry.target;
        const delay = Number(el.dataset.revealDelay || 0);
        window.setTimeout(() => { el.dataset.revealVisible = "true"; }, delay);
        observer.unobserve(el);
      }
    },
    { threshold: 0.1, rootMargin: "0px 0px -8% 0px" }
  );

  for (const el of targets) observer.observe(el);
}
