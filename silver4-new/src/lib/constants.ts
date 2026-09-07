export const PHONE_DISPLAY = '(604) 423-4223'
export const PHONE_TEL = '+16044234223'
export const EMAIL = 'info@silver4salon.com'
export const ADDRESS = '177 W 2nd Ave, Vancouver, BC V5Y 0L8'

export const BOOKING_URL =
  'https://www.fresha.com/book-now/silver-4-hair-and-beauty-salon-p5x0yfdh/all-offer?share=true&pId=2865797'

export const SERVICES_URL =
  'https://www.fresha.com/a/silver-4-hair-barbershop-spa-vancouver-177-west-2nd-avenue-cgfj9k0s?pId=2865797'

export const GOOGLE_REVIEW_URL = 'https://www.google.com/search?q=silver4+salon#lrd=reviews'

export const MAP_EMBED_SRC =
  'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d5206.765320462814!2d-123.10597657590498!3d49.269145945345905!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x54867383559906e3%3A0x14cfe4501a9605d7!2sSilver4+Hair%26Beauty+Salon!5e0!3m2!1sen!2sca!4v1550675095906'

export interface NavItem {
  label: string
  to: string
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'Home', to: '/' },
  { label: 'Our Stylists', to: '/team' },
  { label: 'Gallery', to: '/gallery' },
  { label: 'About', to: '/about' },
]

export const FOOTER_EXPLORE_LINKS: NavItem[] = [
  { label: 'Home', to: '/' },
  { label: 'Our stylists', to: '/team' },
  { label: 'Gallery', to: '/gallery' },
  { label: 'About Silver4', to: '/about' },
  { label: 'Hours & location', to: '/#visit' },
]

export const FOOTER_GUEST_LINKS: NavItem[] = [
  { label: 'Satisfaction guarantee', to: '/about#satisfaction' },
  { label: 'Cancellation policy', to: '/about#cancellation' },
  { label: 'Deposit policy', to: '/about#deposit' },
  { label: 'Health & safety', to: '/about#health' },
]

/** 0 = Sunday … 6 = Saturday, matching Date#getDay(). */
export const HOURS = [
  { day: 0, label: 'Sunday', openTime: '11:00', closeTime: '19:00', display: '11:00AM – 7:00PM' },
  { day: 1, label: 'Monday', openTime: '11:00', closeTime: '19:00', display: '11:00AM – 7:00PM' },
  { day: 2, label: 'Tuesday', openTime: '11:00', closeTime: '19:00', display: '11:00AM – 7:00PM' },
  {
    day: 3,
    label: 'Wednesday',
    openTime: '11:00',
    closeTime: '19:00',
    display: '11:00AM – 7:00PM',
  },
  {
    day: 4,
    label: 'Thursday',
    openTime: '11:00',
    closeTime: '19:00',
    display: '11:00AM – 7:00PM',
  },
  { day: 5, label: 'Friday', openTime: '11:00', closeTime: '19:00', display: '11:00AM – 7:00PM' },
  {
    day: 6,
    label: 'Saturday',
    openTime: '11:00',
    closeTime: '19:00',
    display: '11:00AM – 7:00PM',
  },
] as const

// The hand-off markup lists Monday first (order 1,2,3,4,5,6,0); keep that
// display order even though HOURS above is keyed 0-indexed for lookups.
export const HOURS_DISPLAY_ORDER = [1, 2, 3, 4, 5, 6, 0]
