export const NAV_ITEMS = [
  { label: 'Home', to: '/' },
  { label: 'Hair Services', to: '/hair-services' },
  { label: 'Barber Services', to: '/barber-services' },
  { label: 'Spa Services', to: '/spa-services' },
]

export const SERVICE_MENU_ITEMS = [
  { label: 'Hair Services', to: '/hair-services' },
  { label: 'Barber Services', to: '/barber-services' },
  { label: 'Spa Services', to: '/spa-services' },
  { label: 'Skin Therapy', to: '/skin-therapy' },
  { label: 'Special Rituals', to: '/special-rituals' },
]

export const CONTACT = {
  phone: '(604) 423-4223',
  email: 'info@silver4salon.com',
  address: '177 W 2nd Ave, Vancouver, BC V5Y 0L8',
}

export const SCHEDULE = [
  { day: 'Monday', hours: '11:00AM – 7:00PM' },
  { day: 'Tuesday', hours: '11:00AM – 7:00PM' },
  { day: 'Wednesday', hours: '11:00AM – 7:00PM' },
  { day: 'Thursday', hours: '11:00AM – 7:00PM' },
  { day: 'Friday', hours: '11:00AM – 7:00PM' },
  { day: 'Saturday', hours: '11:00AM – 7:00PM' },
  { day: 'Sunday', hours: '11:00AM – 7:00PM' },
]

export const FOOTER_HOURS = 'Mon – Sun: 11:00AM – 7:00PM'

export const SOCIAL_LINKS = {
  instagram: 'https://instagram.com/silver4salon',
  facebook: 'https://facebook.com/silver4salon',
  x: 'https://x.com/silver4salon',
}

export const HOMEPAGE_GALLERY = [
  'back1',
  'back2',
  'back3',
  'back4',
  'back5',
  'back6',
  'back7',
  'back8',
  'back9',
  'back10',
  'back11',
  'back12',
].map((name) => ({ src: `/gallery/${name}.webp`, alt: 'Silver4 styling work' }))

export const PRODUCTS = [
  { brand: 'GHD', name: 'Classic 1" Flat Iron', price: '$279.00' },
  { brand: 'K18', name: 'Molecular Repair Oil', price: '$92.00' },
  { brand: 'Olaplex', name: 'No.3 Hair Perfector', price: '$30.00' },
  { brand: 'Kevin.Murphy', name: 'Shimmer.Me Blonde', price: '$50.00' },
]

export const HAIR_SERVICE_GALLERY = [
  'back13',
  'back14',
  'back15',
  'back16',
  'back17',
  'back18',
  'back19',
  'back21',
  'back22',
  'back23',
  'img_5185',
  'img_5186',
].map((name) => ({ src: `/gallery/${name}.webp`, alt: 'Silver4 hair styling work' }))

// Only "Mike" has a matching photo in public/team/ so far — the rest stay
// as placeholders until real photos for Sophia, Nicholas, and Yuki are added.
export const STYLISTS = [
  {
    name: 'Mike',
    role: 'Stylist',
    bio: 'Master of structural hair sculpting, precision scissor cuts, and modern barbering rituals. Dedicated to clean aesthetics and customized styling profiles.',
    languages: 'English',
    image: '/team/mike.webp',
  },
  {
    name: 'Sophia',
    role: 'Creative Colorist',
    bio: 'Specialist in bespoke balayage, organic pigment blending, and corrective therapy. Sophia designs luminous tones that evolve beautifully over time.',
    languages: 'English, French',
    image: null,
  },
  {
    name: 'Nicholas',
    role: 'Artistic Director',
    bio: "With over two decades in high-fashion editorial styling, Nicholas shapes unforgettable silhouettes tailored to each guest's natural bone structure.",
    languages: 'English, Greek',
    image: null,
  },
  {
    name: 'Yuki',
    role: 'Ritual Specialist',
    bio: 'Expert in traditional scalp wellness therapies, head spa acupressure, and custom oil infusions. Reclaiming healthy hair starting at the root.',
    languages: 'English, Japanese',
    image: null,
  },
]
