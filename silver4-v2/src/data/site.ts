export const NAV_ITEMS = [
  { label: 'Home', to: '/' },
  { label: 'Hair Services', to: '/hair-services' },
  { label: 'Barber Services', to: '/barber-services' },
  { label: 'Spa Services', to: '/spa-services' },
]

export const SERVICE_MENU_ITEMS = [
  { label: 'Home', to: '/' },
  { label: 'Hair Services', to: '/hair-services' },
  { label: 'Barber Services', to: '/barber-services' },
  { label: 'Spa Services', to: '/spa-services' },
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

export const FOOTER_HOURS = { days: 'Mon – Sun:', time: '11:00AM – 7:00PM' }

export const MAP_EMBED_SRC =
  'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d5206.765320462814!2d-123.10597657590498!3d49.269145945345905!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x54867383559906e3%3A0x14cfe4501a9605d7!2sSilver4+Hair%26Beauty+Salon!5e0!3m2!1sen!2sca!4v1550675095906'

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

export const STYLISTS = [
  { name: 'Viola', role: 'Receptionist', bio: 'Bio to come', image: '/team/viola.webp' },
  { name: 'Yi', role: 'Stylist', bio: 'Bio to come', image: '/team/yi.webp' },
  { name: 'Alberto', role: 'Stylist', bio: 'Bio to come', image: '/team/alberto.webp' },
  { name: 'Sam', role: 'Stylist', bio: 'Bio to come', image: '/team/sam.webp' },
  { name: 'Kawal', role: 'Stylist', bio: 'Bio to come', image: '/team/kawal.webp' },
  { name: 'Becca', role: 'Stylist', bio: 'Bio to come', image: '/team/becca.webp' },
]
