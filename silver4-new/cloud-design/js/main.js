/* ==========================================================================
   main.js — the single entry point.
   --------------------------------------------------------------------------
   This is the ONLY script the pages load, as <script type="module" defer>.
   Every module exports an `init()` that is safe to call on any page: if the
   markup it needs isn't present, it returns immediately.
   To add a behaviour: write js/thing.js exporting init(), then import and
   call it here. Never add a second <script> tag to a page.
   ========================================================================== */

import { init as initNav }       from "./nav.js";
import { init as initHero }      from "./hero.js";
import { init as initAccordion } from "./accordion.js";
import { init as initHours }     from "./hours.js";
import { init as initMap }       from "./map.js";
import { init as initReveal }    from "./reveal.js";
import { init as initJumpNav }   from "./jumpnav.js";
import { init as initCarousel }  from "./carousel.js";
import { init as initGallery }   from "./gallery.js";
import { init as initCopy }      from "./copy.js";

const modules = [
  initNav,
  initHero,
  initAccordion,
  initHours,
  initMap,
  initReveal,
  initJumpNav,
  initCarousel,
  initGallery,
  initCopy,
];

function boot() {
  for (const init of modules) {
    // One broken module must not stop the rest of the page working.
    try {
      init();
    } catch (error) {
      console.error("[silver4] module failed to init:", error);
    }
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot, { once: true });
} else {
  boot();
}
