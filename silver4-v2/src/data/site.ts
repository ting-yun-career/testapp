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
