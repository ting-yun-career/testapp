/* ==========================================================================
   nav.js — mobile drawer + scrolled-header state
   --------------------------------------------------------------------------
   Markup contract:
     header[data-header]
     button[data-nav-toggle][aria-expanded][aria-controls="site-nav"]
     nav[data-nav]#site-nav
     div[data-nav-backdrop]
   With JS off the drawer can't open, so every nav destination is also in the
   footer. That is deliberate — don't remove the footer nav.
   ========================================================================== */

const SELECTORS = {
  header:   "[data-header]",
  toggle:   "[data-nav-toggle]",
  nav:      "[data-nav]",
  backdrop: "[data-nav-backdrop]",
};

const FOCUSABLE =
  'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';

export function init() {
  const header   = document.querySelector(SELECTORS.header);
  const toggle   = document.querySelector(SELECTORS.toggle);
  const nav      = document.querySelector(SELECTORS.nav);
  const backdrop = document.querySelector(SELECTORS.backdrop);

  if (header) initScrolledState(header);
  if (!toggle || !nav) return;

  let lastFocused = null;

  const isOpen = () => toggle.getAttribute("aria-expanded") === "true";

  function open() {
    lastFocused = document.activeElement;
    toggle.setAttribute("aria-expanded", "true");
    nav.dataset.open = "true";
    if (backdrop) backdrop.dataset.open = "true";
    document.body.dataset.scrollLocked = "true";
    focusFirstWhenVisible(nav);
  }

  function close() {
    toggle.setAttribute("aria-expanded", "false");
    nav.dataset.open = "false";
    if (backdrop) backdrop.dataset.open = "false";
    delete document.body.dataset.scrollLocked;
    lastFocused?.focus();
  }

  toggle.addEventListener("click", () => (isOpen() ? close() : open()));
  backdrop?.addEventListener("click", close);

  // Close after tapping a link (same-page anchors would otherwise stay hidden
  // behind the open drawer).
  nav.addEventListener("click", (event) => {
    if (event.target.closest("a") && isOpen()) close();
  });

  document.addEventListener("keydown", (event) => {
    if (!isOpen()) return;
    if (event.key === "Escape") { close(); return; }
    if (event.key === "Tab") trapFocus(event, nav);
  });

  // If the viewport grows past the desktop breakpoint the drawer becomes an
  // inline nav; reset state so scroll isn't left locked.
  window.matchMedia("(min-width: 64rem)").addEventListener("change", (event) => {
    if (event.matches && isOpen()) close();
  });
}

/* Moves focus into the drawer so keyboard users aren't stranded behind it,
   and so trapFocus() below has something inside the panel to hold on to.

   The wait matters: .site-nav transitions `visibility` over 280ms, and an
   element whose computed visibility is still `hidden` cannot take focus. A
   synchronous focus() call — or a requestAnimationFrame — silently fails and
   leaves activeElement on <body>. So wait for the transition to finish, with
   a timeout fallback in case the transition is cancelled or suppressed (it is
   under prefers-reduced-motion, where the duration drops to ~0). */
function focusFirstWhenVisible(nav) {
  let done = false;

  const focusFirst = () => {
    if (done) return;
    done = true;
    nav.querySelector(FOCUSABLE)?.focus();
  };

  nav.addEventListener(
    "transitionend",
    (event) => {
      if (event.target === nav && event.propertyName === "visibility") focusFirst();
    },
    { once: true }
  );

  const duration = Number.parseFloat(getComputedStyle(nav).transitionDuration) || 0;
  window.setTimeout(focusFirst, duration * 1000 + 50);
}

/* Adds a shadow to the sticky header once the page has scrolled. */
function initScrolledState(header) {
  const sentinel = document.createElement("div");
  sentinel.setAttribute("aria-hidden", "true");
  header.before(sentinel);

  new IntersectionObserver(
    ([entry]) => { header.dataset.scrolled = String(!entry.isIntersecting); },
    { rootMargin: "0px" }
  ).observe(sentinel);
}

/* Keeps Tab cycling inside the open drawer. */
function trapFocus(event, container) {
  const items = [...container.querySelectorAll(FOCUSABLE)].filter(
    (el) => el.offsetParent !== null
  );
  if (items.length === 0) return;

  const first = items[0];
  const last  = items[items.length - 1];

  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}
