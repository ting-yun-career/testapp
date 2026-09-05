/* ==========================================================================
   jumpnav.js — marks the active pill in the services page category nav
   --------------------------------------------------------------------------
   Markup contract:
     .jump-nav[data-jump-nav]
       a.jump-nav__link[href="#haircut"]
     section[id="haircut"]   … the targets

   The links are plain anchors, so navigation works with JS off; this only
   adds the active highlight.
   ========================================================================== */

export function init() {
  const nav = document.querySelector("[data-jump-nav]");
  if (!nav) return;

  const links = [...nav.querySelectorAll("a[href^='#']")];
  const map = new Map();

  for (const link of links) {
    const section = document.querySelector(link.getAttribute("href"));
    if (section) map.set(section, link);
  }
  if (map.size === 0) return;

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        for (const link of links) delete link.dataset.active;
        map.get(entry.target).dataset.active = "true";
      }
    },
    // Trigger when a section reaches the band just under the sticky header.
    { rootMargin: "-30% 0px -60% 0px" }
  );

  for (const section of map.keys()) observer.observe(section);
}
