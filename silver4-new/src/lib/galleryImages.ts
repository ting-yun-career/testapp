import back1 from '../assets/gallery/back1.webp'
import img5185 from '../assets/gallery/img_5185.webp'
import back2 from '../assets/gallery/back2.webp'
import back3 from '../assets/gallery/back3.webp'
import img5186 from '../assets/gallery/img_5186.webp'
import back4 from '../assets/gallery/back4.webp'
import back5 from '../assets/gallery/back5.webp'
import back6 from '../assets/gallery/back6.webp'
import back7 from '../assets/gallery/back7.webp'
import img5187 from '../assets/gallery/img_5187.webp'
import back8 from '../assets/gallery/back8.webp'
import back9 from '../assets/gallery/back9.webp'
import dsc02480 from '../assets/gallery/dsc02480_comp.webp'
import back10 from '../assets/gallery/back10.webp'
import back11 from '../assets/gallery/back11.webp'
import img5188 from '../assets/gallery/img_5188.webp'
import back12 from '../assets/gallery/back12.webp'
import back13 from '../assets/gallery/back13.webp'
import back14 from '../assets/gallery/back14.webp'
import img5189 from '../assets/gallery/img_5189.webp'
import back15 from '../assets/gallery/back15.webp'
import back16 from '../assets/gallery/back16.webp'
import back17 from '../assets/gallery/back17.webp'
import back18 from '../assets/gallery/back18.webp'
import back19 from '../assets/gallery/back19.webp'
import back21 from '../assets/gallery/back21.webp'
import back22 from '../assets/gallery/back22.webp'
import back23 from '../assets/gallery/back23.webp'

export interface GalleryImage {
  src: string
  alt: string
}

export const GALLERY_IMAGES: GalleryImage[] = [
  { src: back1, alt: 'Long balayage, styled' },
  { src: img5185, alt: 'Precision cut, glossy finish' },
  { src: back2, alt: 'Warm brunette with soft layers' },
  { src: back3, alt: 'Mid-length cut with movement' },
  { src: img5186, alt: 'Blow-dry and style' },
  { src: back4, alt: 'Soft waves with warm highlights' },
  { src: back5, alt: 'Full highlights, blow-dried' },
  { src: back6, alt: 'Layered cut, natural finish' },
  { src: back7, alt: 'Blunt cut, glossy finish' },
  { src: img5187, alt: 'Colour and style' },
  { src: back8, alt: 'Balayage on long hair' },
  { src: back9, alt: 'Shoulder-length cut' },
  { src: dsc02480, alt: 'Inside the salon' },
  { src: back10, alt: 'Partial highlights' },
  { src: back11, alt: 'Layered cut with movement' },
  { src: img5188, alt: 'Finished style' },
  { src: back12, alt: 'Cool-toned blonde' },
  { src: back13, alt: 'Long waves' },
  { src: back14, alt: 'Rich brunette colour' },
  { src: img5189, alt: 'Styled and finished' },
  { src: back15, alt: 'Full highlights, blow-dried' },
  { src: back16, alt: 'Textured bob' },
  { src: back17, alt: 'Soft balayage' },
  { src: back18, alt: 'Straightened long hair' },
  { src: back19, alt: 'Warm brunette, mid-length' },
  { src: back21, alt: 'Curled and styled' },
  { src: back22, alt: 'Highlighted lengths' },
  { src: back23, alt: 'Finished blow-dry' },
]

export interface HomeGalleryTeaserItem extends GalleryImage {
  tag: string
}

// The home page teaser shows this curated subset, each tagged with a
// short colour/texture label shown below the widget as the photo comes
// into focus.
export const HOME_GALLERY_TEASER: HomeGalleryTeaserItem[] = [
  { src: back1, alt: 'Long balayage, styled', tag: 'Ash Grey / Straight' },
  { src: back4, alt: 'Soft waves with warm highlights', tag: 'Chestnut Brown / Braided' },
  { src: back7, alt: 'Blunt cut, glossy finish', tag: 'Golden Balayage / Wavy' },
  { src: back11, alt: 'Layered cut with movement', tag: 'Silver / Wavy' },
  { src: back15, alt: 'Full highlights, blow-dried', tag: 'Rose Ash / Straight' },
  { src: back19, alt: 'Warm brunette, mid-length', tag: 'Copper Auburn / Wavy' },
  { src: img5185, alt: 'Precision cut, glossy finish', tag: 'Blue Black / Wavy' },
  { src: back9, alt: 'Shoulder-length cut', tag: 'Platinum Blonde / Wavy' },
  { src: back14, alt: 'Rich brunette colour', tag: 'Golden Beige / Wavy' },
  { src: back22, alt: 'Highlighted lengths', tag: 'Golden Copper / Straight' },
]
