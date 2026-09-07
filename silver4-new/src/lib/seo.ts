/** Site-wide SEO constants, shared by the per-page useSeo() calls and by
    scripts/prerender.mjs (which duplicates the handful of primitive values
    it needs, since it runs under plain Node rather than Vite/TS). */
export const SITE_URL = 'https://silver4salon.com'
export const SITE_NAME = 'Silver 4 Hair Salon • Barbershop • Spa'

/** 1200x630, generated from src/assets/team/group.webp via ffmpeg. Falls
    back to this on every page that doesn't pass its own `image`. */
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.jpg`
