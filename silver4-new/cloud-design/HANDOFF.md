# Silver4 Salon — handoff notes

Revision 1. Static site: no build step, no dependencies, no package.json.
Open `index.html` in a browser and it works.

---

## Where things live

```
index.html  services.html  team.html  gallery.html  about.html
css/        00-tokens → 06-utilities, imported by main.css in cascade order
js/         ES modules; main.js is the only <script> tag on any page
assets/     video/ img/ — currently EMPTY, see "Assets to add" below
```

**HTML** carries content and structure only. Behaviour hooks are `data-*`
attributes (`data-nav-toggle`, `data-hero-video`, `data-carousel`), never CSS
classes — so you can restyle or rename classes without breaking JS.

**CSS**: BEM-lite (`.block__element--variant`), one nesting level, no ids, no
`!important` outside `06-utilities.css`. Every value comes from a custom
property in `00-tokens.css`. Two breakpoints only: `48rem` and `64rem`,
mobile-first (`min-width` queries).

**JS**: one module per behaviour, each exporting `init()`, all registered in
the array at the top of `js/main.js`. To add a behaviour, write the module and
add it to that array. A module that throws is caught and logged without taking
down the rest of the page.

Nothing on the site requires JavaScript to be readable or navigable.

---

## ⬜ Open items

### 1. `js/gallery.js` — lightbox NOT implemented
The markup (`.lightbox` in `gallery.html`) and all the CSS
(`.lightbox*` in `05-sections.css`) are finished. Only the behaviour is
missing. Right now a click falls through to the full-size image, which is an
acceptable fallback.
Full markup contract and a 7-step TODO list are in the file header.
Alternative: drop in PhotoSwipe v5 or GLightbox — both bind to `a[href]`
inside a container and match the existing markup.

### 2. `js/carousel.js` — partial
Arrows work. **Dots and autoplay are TODO** (4 numbered items in the file
header). The viewport is a CSS scroll-snap strip, so swiping already works
with no JS at all.

### 3. Hero video
Put the client's files at:
```
assets/video/hero.mp4     H.264, 1920×1080, no audio track, ≤8 MB, 10–20 s loop
assets/video/hero.webm    optional, better compression where supported
```
**The two `<source>` tags in `index.html` are commented out** so the page
doesn't fire two 404s on every load. Uncomment them when the files land.

The hero scrim (`.hero__scrim`, `05-sections.css`) is deliberately heavy —
two stacked gradients, vertical and horizontal — because the headline has to
stay legible over *any* frame of a video we haven't seen. If you lighten it,
test against a bright, high-key frame, not a dark one.
Encoding notes are in the comment above the `<section class="hero">` in
`index.html`. Keep the subject roughly centred — on phones the frame crops
hard to the middle.

`js/hero.js` reveals the video only on the `playing` event, so a missing,
blocked or slow video shows the still image instead of a black rectangle. It
also pauses the video when the hero scrolls offscreen, and stays paused
entirely under `prefers-reduced-motion`.

### 4. Images are hot-linked from the old site
Every photo currently points at `https://silver4salon.com/asset/…`. **Fix
before launch**: download them, re-export at ~1600px wide (WebP if you can),
and serve from `assets/img/`. For the gallery, generate small thumbs for the
`src` and keep the full size on the link `href`.

### 5. Stylist portraits are placeholders
All six are `placehold.co` stand-ins. Real files → `assets/img/team/<name>.jpg`,
3:4 crop, ≥800px wide. The `.figure` wrapper holds the aspect ratio, so
swapping the `src` causes no reflow.

### 6. Testimonials are placeholder copy
Four stand-in quotes on the home page. Replace with real Google reviews.

### 7. VVIP package is still an image
`about.html#vvip` embeds the old site's `vvip/content.png`. An image of a
price list is unreadable on a phone, unsearchable and inaccessible — the tiers
should be re-typed as text using the existing `.price-row` component.

### 8. To confirm with the client
- **Email address.** The old site hid it behind Cloudflare protection.
  `info@silver4salon.com` is a guess.
- **Street address.** `1263 Kingsway` is inferred from the map embed
  coordinates; verify it.
- **Social links.** Footer icons point at `#`.
- **COVID-19 safety plan.** The 2020 plan is condensed into an evergreen
  "Health & safety" accordion on `about.html`; the original full text is
  quoted in a source comment. Recommendation: keep the short version.
- **Alberto's and Sam's bios.** Both were empty on the old site.
- **The 10% COVID-era discount** from the old site has been dropped. Confirm.

---

## Duplicated markup

Header, footer and the mobile action bar are copy-pasted into all five pages —
that's the cost of having no build step. They're marked in every file as
"partial #1 / #2 / #3". If you move to a templating layer (Eleventy, Astro,
PHP includes, whatever), those three blocks are your partials. Note that
`aria-current="page"` moves between nav links per page.

---

## Accessibility built in

Skip link, landmarks, one `h1` per page, `aria-expanded` on the drawer toggle
with focus trap and Escape-to-close, `:focus-visible` rings from the accent
token, `aria-current="page"` in the nav, decorative images marked
`aria-hidden`, and all icon-only buttons carry a `.visually-hidden` label.

## Performance choices

- Google Maps is behind a click-to-load button (`js/map.js`) — the embed is
  ~500 KB of third-party JS that most visitors never need.
- All below-fold images are `loading="lazy" decoding="async"`.
- Every image sits in an `aspect-ratio` box, so there's no layout shift.
- Two font families, two weights each, `display=swap`.
