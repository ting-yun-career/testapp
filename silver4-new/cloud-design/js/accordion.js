/* ==========================================================================
   accordion.js — enhances native <details> groups
   --------------------------------------------------------------------------
   Markup contract:
     div.accordion[data-accordion]           add data-accordion-single to
       details.accordion__item                make it exclusive (one open)
   The accordions work fully without this file — <details> is native. All this
   adds is optional single-open behaviour and a smooth height transition.
   ========================================================================== */

export function init() {
  const groups = document.querySelectorAll("[data-accordion]");
  if (groups.length === 0) return;

  for (const group of groups) {
    const items = [...group.querySelectorAll("details.accordion__item")];
    const single = group.hasAttribute("data-accordion-single");

    for (const item of items) {
      item.addEventListener("toggle", () => {
        if (!item.open || !single) return;
        for (const other of items) {
          if (other !== item) other.open = false;
        }
      });
    }
  }

  // Open the item targeted by the URL hash, e.g. policies.html#cancellation
  const target = document.querySelector(`details.accordion__item${location.hash || "#none"}`);
  if (target) target.open = true;
}
