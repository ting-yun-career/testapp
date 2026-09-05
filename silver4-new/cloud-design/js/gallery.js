/* ==========================================================================
   gallery.js — ⬜ PLACEHOLDER / NOT IMPLEMENTED
   --------------------------------------------------------------------------
   STATUS: does nothing. Clicking a gallery image opens the full-size file in
   a normal browser navigation, which is a perfectly acceptable fallback and
   is what happens today.

   The overlay MARKUP and CSS are already done for you:
     - markup:  the .lightbox block at the bottom of gallery.html
     - styles:  .lightbox* in css/05-sections.css (open state is
                driven by the data-open="true" attribute)

   Markup contract in the grid:
     li.gallery-grid__item
       a.gallery-grid__link[data-gallery-item][href="<full-size.jpg>"]
         figure.figure > img[src="<thumb.jpg>"][alt]
       figcaption is optional and, if present, becomes the lightbox caption.

   Overlay contract:
     .lightbox[data-lightbox][data-open]
       img.lightbox__img[data-lightbox-img]
       p.lightbox__caption[data-lightbox-caption]
       button[data-lightbox-close]
       button[data-lightbox-prev]
       button[data-lightbox-next]

   TODO(you) — implement, in this order:
     1. Collect [data-gallery-item] into an array once, at init.
     2. On click: event.preventDefault(), record the index, open the overlay
        (lightbox.dataset.open = "true"), set the img src from the link's href
        and the caption from the figcaption text.
     3. Keyboard: ArrowLeft/ArrowRight to step, Escape to close.
     4. Lock body scroll while open (document.body.dataset.scrollLocked =
        "true" — the CSS for that already exists in 04-components.css).
     5. Focus management: focus the close button on open, return focus to the
        triggering link on close, and trap Tab inside the overlay. There is a
        reusable trapFocus() in js/nav.js you can lift.
     6. Preload the neighbouring images (new Image().src = next.href) so
        stepping through feels instant.
     7. Touch: swipe left/right. Simplest approach is pointerdown/pointerup
        with a 50px horizontal threshold — don't pull in a gesture library
        for this.

   If you'd rather not write it: PhotoSwipe v5 or GLightbox both bind to
   a[href] inside a container and would work against the markup above with
   about three lines of config. Drop the vendor file in js/vendor/ and replace
   this module's body.
   ========================================================================== */

export function init() {
  const items = document.querySelectorAll("[data-gallery-item]");
  if (items.length === 0) return;

  // Remove this warning once the lightbox is implemented.
  console.info(
    `[silver4] gallery.js: ${items.length} items found; lightbox not implemented — ` +
      "clicks fall through to the full-size image. See the TODOs in js/gallery.js."
  );
}
