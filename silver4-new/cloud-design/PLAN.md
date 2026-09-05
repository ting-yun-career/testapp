# Silver4 Salon — Rebuild Plan, Revision 1

Reference for style: **issalonvancouver.com** (is. Salon Yaletown)
Content source: **silver4salon.com** (all existing content carried over)

---

## 1. What I took from each site

**From is. Salon (the look & feel the client likes)**
- Full-bleed **video hero** as the first thing on screen: muted autoplay loop, an eyebrow line ("YALETOWN'S ORIGINAL BOUTIQUE SALON"), a big two-line headline with an italic accent word, and two buttons (primary "BOOK NOW" + secondary "BROWSE SERVICES"). The hero is a **slider of 3 video slides**, each with its own headline/CTA.
- Editorial, near-monochrome palette. Uppercase, wide-tracked labels; a serif/display voice for headlines mixed with italics for emphasis.
- Sticky slim header, hamburger drawer on mobile, prominent Book button always reachable.
- Section rhythm: hero → logo/brand strip → about with paired photos → services → team → gallery/Instagram → offer band → contact/footer with columns.
- Mobile-first "quick action" row: Call / Text / Email / Book — as icon buttons. Very useful for a salon; I'm keeping this.

**From silver4salon (everything that must survive)**
- Booking link → Fresha (`fresha.com/book-now/silver-4-hair-and-beauty-salon-p5x0yfdh`)
- Phone (604) 423-4223, email, Google Maps embed, hours (Mon–Sun 11:00AM–7:00PM)
- About Us copy — the "if you hated going to a hair salon because…" hook, Japanese hair-washing unit, chromatherapy, Kérastase
- Full price list: Haircut · Shampoo & Styling · Colour · Perm/Texture · Head Spa & Treatment (every line item and footnote, verbatim)
- 6 stylist/staff bios: Yi, Alberto, Viola, Sam, Kawal, Becca (+ languages)
- Gallery (~30 images)
- Policies: Satisfaction Guarantee, Cancellation, Deposit
- VVIP Package
- Copyright notice
- **COVID-19 safety plan** — dated 2020 content. My recommendation: retire it (or park it on a policies page). Flagging for the client, not deleting silently.

---

## 2. Site structure

Multi-page static site (matches how is. Salon is organised — better for SEO and for a salon's "find the price" behaviour than one endless scroll).

| Page | File | Contents |
|---|---|---|
| Home | `index.html` | Video hero slider · quick actions · brand strip (Kérastase) · about teaser · services teaser · signature experience (Japanese wash unit / chromatherapy) · stylist teaser · gallery teaser · hours + map · footer |
| Services | `services.html` | Full price list, grouped, with footnotes. Sticky category jump-nav on mobile |
| Team | `team.html` | 6 stylist cards with photos, bios, languages |
| Gallery | `gallery.html` | Masonry grid + lightbox |
| About | `about.html` | Long-form about, the experience, VVIP package |
| Contact | `contact.html` | Map, hours, phone/email, directions, booking CTA |
| Policies | `policies.html` | Satisfaction / Cancellation / Deposit as accordions (+ COVID plan if kept) |

Shared header and footer markup is duplicated per page (static site, no build step). If you'd rather include them once, say so — I'd swap to a tiny `include.js` fetch or you drop it into your templating layer.

---

## 3. Code structure

```
silver4/
├── index.html
├── services.html
├── team.html
├── gallery.html
├── about.html
├── contact.html
├── policies.html
│
├── css/
│   ├── 00-tokens.css       # ONLY custom properties: colour, type scale, spacing, radii, z-index, breakpoints
│   ├── 01-reset.css        # modern reset, box-sizing, media defaults
│   ├── 02-base.css         # html/body, headings, p, a, ul, focus-visible ring
│   ├── 03-layout.css       # .container, .section, .grid, .stack — spacing rhythm only
│   ├── 04-components.css   # .btn .card .tag .price-row .accordion .site-header .site-footer
│   ├── 05-sections.css     # .hero .brand-strip .team-grid .gallery-grid .hours-table
│   ├── 06-utilities.css    # .visually-hidden, .text-center, .u-mt-*
│   └── main.css            # @import manifest, in cascade order
│
├── js/
│   ├── main.js             # single entry: imports modules, calls init() on DOMContentLoaded
│   ├── nav.js              # mobile drawer open/close, aria-expanded, focus trap, esc to close
│   ├── hero-slider.js      # video hero rotation + pause-when-offscreen + reduced-motion respect
│   ├── accordion.js        # policies / service groups disclosure (<details> upgrade)
│   ├── gallery.js          # ⬜ PLACEHOLDER — lightbox. Stubbed with a documented API
│   ├── carousel.js         # ⬜ PLACEHOLDER — generic horizontal carousel (brand strip, testimonials)
│   └── reveal.js           # IntersectionObserver scroll-fade (optional, off with prefers-reduced-motion)
│
└── assets/
    ├── video/              # client's hero videos: hero-1.mp4 + hero-1.webm + hero-1-poster.jpg
    ├── img/
    │   ├── salon/          # interior/exterior (carried from silver4salon)
    │   ├── team/           # stylist portraits
    │   └── gallery/        # gallery images
    └── favicon/
```

### Rules I'll hold to

**HTML = content and structure.**
Semantic landmarks (`header`/`nav`/`main`/`section`/`footer`), heading levels in order, one `h1` per page. No layout `<div>` soup, no styling attributes, no inline styles. Behaviour hooks are **`data-*` attributes**, never styling classes — so you can restyle without breaking JS and vice versa:
```html
<button data-nav-toggle aria-expanded="false" aria-controls="site-nav">
```

**CSS = presentation.**
- Every value comes from a custom property in `00-tokens.css`. No hard-coded hex or px in component files.
- Class naming: **BEM-lite** — `.block`, `.block__element`, `.block--variant`. Flat, one level of nesting, no `#id` selectors, no `!important`.
- **Mobile-first**: base styles are the phone layout; `min-width` media queries add up from there. Breakpoints: `48rem` (tablet) and `64rem` (desktop) only — two, not five.
- Flex/grid with `gap` for all spacing between siblings. `clamp()` for fluid type so headlines don't need per-breakpoint overrides.
- Files load in numbered cascade order — a later file may only override an earlier one, never the reverse.

**JS = enhancement only.**
- Every module is one ES module exporting `init()`; `main.js` is the only file in a `<script type="module">` tag. No globals, no jQuery, no inline `onclick`.
- The site is fully readable and navigable with JS disabled: services accordions are native `<details>`, gallery is real `<a>`-wrapped images, hero falls back to the poster image.
- `prefers-reduced-motion: reduce` kills the slider auto-advance and all reveal animation.

**Placeholders for you to finish.** Where a real component is needed I'll ship a working-but-minimal version plus a commented contract, e.g.:
```js
// js/gallery.js
// ⬜ PLACEHOLDER — lightbox not implemented.
// Markup contract: figure[data-gallery-item] > a[href=<full-size>] > img[src=<thumb>]
// TODO(you): on click, preventDefault, open overlay with the href image.
//            Needs: next/prev (← →), Esc to close, focus return to trigger, body scroll lock.
// Suggested drop-in if you don't want to write it: PhotoSwipe or GLightbox.
export function init() { /* … */ }
```
Same treatment for `carousel.js`.

---

## 4. Hero video — how it works

```html
<section class="hero" data-hero-slider>
  <div class="hero__slide is-active" data-hero-slide>
    <video class="hero__video" autoplay muted loop playsinline preload="metadata"
           poster="assets/video/hero-1-poster.jpg">
      <source src="assets/video/hero-1.webm" type="video/webm">
      <source src="assets/video/hero-1.mp4"  type="video/mp4">
    </video>
    <div class="hero__content"> eyebrow · h1 · two buttons </div>
  </div>
  <!-- + slide 2, slide 3 -->
</section>
```
- `muted` + `playsinline` are what make iOS autoplay work at all. `poster` shows instantly so mobile never sees a black box.
- Only slide 1's video gets `preload="metadata"`; the others load lazily on first advance — important on cellular.
- A dark scrim overlay behind the text so white type stays legible over any frame.
- I need from the client: the actual video files (MP4 H.264, ideally ≤8 MB each, 1080p, and a vertical or centre-safe crop since most traffic is mobile). Until then I'll use a Unsplash still + a short stock loop as stand-in.

**What I'll need to confirm:** how many hero videos, and whether each has its own headline (like is. Salon's three) or one video with one message.

---

## 5. Fonts & icons (Google, as requested)

- **Display/headings:** Cormorant Garamond — high-contrast serif, close to is. Salon's editorial feel, with a real italic for the accent words.
- **Body/UI:** Jost — geometric sans that takes uppercase letter-spacing well for the nav and buttons.
- **Icons:** Material Symbols Outlined, loaded as a variable icon font, weight 200 to stay delicate. Used only for: phone, sms, mail, calendar, menu, close, chevrons, instagram/facebook.
- Loaded with one `<link>` + `display=swap`. Two families, two weights each — deliberately light so mobile stays fast.

*(A different type direction is on the table — see the question form.)*

---

## 6. Mobile-first specifics

- Sticky header collapses to logo + hamburger + a **Book** pill.
- Fixed **bottom action bar** on phones only: Call · Text · Book. This is the single highest-value mobile feature for a salon.
- Tap targets ≥ 44px everywhere.
- Price list becomes a two-column name/price row that wraps gracefully instead of a table that scrolls sideways.
- Gallery: 2 columns on phone, 3–4 on desktop, lazy-loaded, `aspect-ratio` boxes so nothing jumps as images arrive.
- Map is a lazy-loaded iframe (`loading="lazy"`) behind a click-to-load poster so it doesn't cost 500 KB on first paint.

---

## 7. Build order

1. Tokens + reset + base type — the foundation, reviewable on its own
2. Header/nav + footer + `index.html` hero (this is the "does it feel like is. Salon?" checkpoint)
3. Rest of home page sections
4. `services.html` (all content, no new patterns)
5. `team.html`, `gallery.html`
6. `about.html`, `contact.html`, `policies.html`
7. JS modules + placeholder stubs + a `HANDOFF.md` listing every TODO

---

## 8. Open questions

See the form — mainly: page set, COVID content, whether to keep the Fresha booking link, hero video count, and one type-direction call.
