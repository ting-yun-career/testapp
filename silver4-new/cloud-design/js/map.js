/* ==========================================================================
   map.js — click-to-load Google Maps embed
   --------------------------------------------------------------------------
   Markup contract:
     .map[data-map]
       button.map__placeholder[data-map-load]
       template[data-map-embed]   holds the <iframe> markup

   Why: the Maps embed is ~500KB of third-party JS. Deferring it until the
   visitor asks keeps the phone experience fast and avoids the third-party
   cookie on first load.
   ========================================================================== */

export function init() {
  const maps = document.querySelectorAll("[data-map]");
  if (maps.length === 0) return;

  for (const map of maps) {
    const button   = map.querySelector("[data-map-load]");
    const template = map.querySelector("[data-map-embed]");
    if (!button || !template) continue;

    button.addEventListener(
      "click",
      () => {
        map.append(template.content.cloneNode(true));
        map.dataset.loaded = "true";
      },
      { once: true }
    );
  }
}
