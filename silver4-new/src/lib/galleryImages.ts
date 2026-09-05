export interface GalleryImage {
  src: string
  alt: string
}

const BASE = 'https://silver4salon.com/asset/salon'

// ⬜ TO REPLACE (per HANDOFF.md item 4): these are hot-linked from the old
// site. Download, re-export at ~1600px wide, and serve from local assets —
// a small thumb for `src`, full size kept on the link `href`.
export const GALLERY_IMAGES: GalleryImage[] = [
  { src: `${BASE}/profile2/back1.jpg`, alt: 'Long balayage, styled' },
  { src: `${BASE}/profile1/IMG_5185.JPG`, alt: 'Precision cut, glossy finish' },
  { src: `${BASE}/profile2/back2.jpg`, alt: 'Warm brunette with soft layers' },
  { src: `${BASE}/profile2/back3.jpg`, alt: 'Mid-length cut with movement' },
  { src: `${BASE}/profile1/IMG_5186.JPG`, alt: 'Blow-dry and style' },
  { src: `${BASE}/profile2/back4.jpg`, alt: 'Soft waves with warm highlights' },
  { src: `${BASE}/profile2/back5.jpg`, alt: 'Full highlights, blow-dried' },
  { src: `${BASE}/Yuki-washing.jpg`, alt: 'A client in the Japanese hair washing unit' },
  { src: `${BASE}/profile2/back6.jpg`, alt: 'Layered cut, natural finish' },
  { src: `${BASE}/profile2/back7.jpg`, alt: 'Blunt cut, glossy finish' },
  { src: `${BASE}/profile1/IMG_5187.JPG`, alt: 'Colour and style' },
  { src: `${BASE}/profile2/back8.jpg`, alt: 'Balayage on long hair' },
  { src: `${BASE}/profile2/back9.jpg`, alt: 'Shoulder-length cut' },
  { src: `${BASE}/DSC02480_comp.jpg`, alt: 'Inside the salon' },
  { src: `${BASE}/profile2/back10.jpg`, alt: 'Partial highlights' },
  { src: `${BASE}/profile2/back11.jpg`, alt: 'Layered cut with movement' },
  { src: `${BASE}/profile1/IMG_5188.JPG`, alt: 'Finished style' },
  { src: `${BASE}/profile2/back12.jpg`, alt: 'Cool-toned blonde' },
  { src: `${BASE}/profile2/back13.jpg`, alt: 'Long waves' },
  { src: `${BASE}/profile2/back14.jpg`, alt: 'Rich brunette colour' },
  { src: `${BASE}/profile1/IMG_5189.JPG`, alt: 'Styled and finished' },
  { src: `${BASE}/profile2/back15.jpg`, alt: 'Full highlights, blow-dried' },
  { src: `${BASE}/profile2/back16.jpg`, alt: 'Textured bob' },
  { src: `${BASE}/profile2/back17.jpg`, alt: 'Soft balayage' },
  { src: `${BASE}/profile2/back18.jpg`, alt: 'Straightened long hair' },
  { src: `${BASE}/profile2/back19.jpg`, alt: 'Warm brunette, mid-length' },
  { src: `${BASE}/profile2/back21.jpg`, alt: 'Curled and styled' },
  { src: `${BASE}/profile2/back22.jpg`, alt: 'Highlighted lengths' },
  { src: `${BASE}/profile2/back23.jpg`, alt: 'Finished blow-dry' },
]

// The home page teaser shows this specific subset (matches index.html).
export const HOME_GALLERY_TEASER_SRCS = [
  `${BASE}/profile2/back1.jpg`,
  `${BASE}/profile2/back4.jpg`,
  `${BASE}/profile2/back7.jpg`,
  `${BASE}/profile2/back11.jpg`,
  `${BASE}/profile2/back15.jpg`,
  `${BASE}/profile2/back19.jpg`,
]
