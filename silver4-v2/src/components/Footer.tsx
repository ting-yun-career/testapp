import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CopyIcon, FacebookIcon, InstagramIcon, XIcon } from './icons'
import { CONTACT, FOOTER_HOURS, SOCIAL_LINKS } from '../data/site'
import { Wordmark } from './Wordmark'

function CopyableLine({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // Clipboard access can fail (permissions, insecure context) — ignore.
    }
  }

  return (
    <div className="flex items-center gap-2 text-sm text-white/80">
      <span>{value}</span>
      <button
        type="button"
        onClick={handleCopy}
        aria-label={`Copy ${label}`}
        className="text-white/50 transition-colors hover:text-white"
      >
        <CopyIcon className="size-3.5" />
      </button>
      {copied && <span className="text-xs text-accent">Copied</span>}
    </div>
  )
}

const EXPLORE_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'Our stylists', to: '/hair-services' },
  { label: 'Gallery', to: '/hair-services' },
  { label: 'About Silver4', to: '/' },
  { label: 'Hours & location', to: '/' },
]

const SERVICE_LINKS = [
  { label: 'Hair Services', to: '/hair-services' },
  { label: 'Barber Services', to: '/barber-services' },
  { label: 'Spa Services', to: '/spa-services' },
  { label: 'Skin Therapy', to: '/skin-therapy' },
  { label: 'Special Rituals', to: '/special-rituals' },
]

export function Footer() {
  return (
    <footer className="bg-panel text-white">
      <div className="mx-auto max-w-6xl gap-10 px-6 py-12 sm:grid sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex flex-col gap-4">
          <Wordmark tone="light" />
          <p className="max-w-xs text-sm text-white/70">
            A sanctuary of bespoke hair styling, barber grooming, and refined spa experiences
            designed to elevate your personal ritual.
          </p>
          <div className="flex flex-col gap-1">
            <CopyableLine value={CONTACT.phone} label="phone number" />
            <CopyableLine value={CONTACT.email} label="email address" />
            <CopyableLine value={CONTACT.address} label="address" />
          </div>
          <div className="flex items-center gap-3 pt-1">
            <a
              href={SOCIAL_LINKS.instagram}
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
              className="text-white/80 transition-colors hover:text-white"
            >
              <InstagramIcon className="size-4" />
            </a>
            <a
              href={SOCIAL_LINKS.facebook}
              target="_blank"
              rel="noreferrer"
              aria-label="Facebook"
              className="text-white/80 transition-colors hover:text-white"
            >
              <FacebookIcon className="size-4" />
            </a>
            <a
              href={SOCIAL_LINKS.x}
              target="_blank"
              rel="noreferrer"
              aria-label="X"
              className="text-white/80 transition-colors hover:text-white"
            >
              <XIcon className="size-4" />
            </a>
          </div>
        </div>

        <div className="mt-8 sm:mt-0">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-accent">Explore</h3>
          <ul className="mt-4 flex flex-col gap-2">
            {EXPLORE_LINKS.map((item) => (
              <li key={item.label}>
                <Link to={item.to} className="text-sm text-white/80 hover:text-white">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-8 sm:mt-0">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-accent">Services</h3>
          <ul className="mt-4 flex flex-col gap-2">
            {SERVICE_LINKS.map((item) => (
              <li key={item.label}>
                <Link to={item.to} className="text-sm text-white/80 hover:text-white">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-8 sm:mt-0">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-accent">Hours</h3>
          <p className="mt-4 text-sm text-white/80">{FOOTER_HOURS}</p>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-col-reverse items-center gap-3 px-6 py-5 text-xs text-white/60 sm:flex-row sm:justify-between">
          <p>&copy; {new Date().getFullYear()} Silver4 Salon &amp; Spa. All rights reserved.</p>
          <div className="flex gap-4">
            <Link to="/" className="hover:text-white">
              Privacy Policy
            </Link>
            <Link to="/" className="hover:text-white">
              Terms of Service
            </Link>
            <Link to="/" className="hover:text-white">
              Sitemap
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
