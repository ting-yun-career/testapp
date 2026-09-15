import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { ChevronDownIcon, FacebookIcon, InstagramIcon, XIcon } from './icons'
import { NAV_ITEMS, SERVICE_MENU_ITEMS, SOCIAL_LINKS } from '../data/site'
import { Wordmark } from './Wordmark'

function SocialIcons({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <a
        href={SOCIAL_LINKS.instagram}
        target="_blank"
        rel="noreferrer"
        aria-label="Instagram"
        className="text-ink transition-opacity hover:opacity-60"
      >
        <InstagramIcon className="size-4" />
      </a>
      <a
        href={SOCIAL_LINKS.facebook}
        target="_blank"
        rel="noreferrer"
        aria-label="Facebook"
        className="text-ink transition-opacity hover:opacity-60"
      >
        <FacebookIcon className="size-4" />
      </a>
      <a
        href={SOCIAL_LINKS.x}
        target="_blank"
        rel="noreferrer"
        aria-label="X"
        className="text-ink transition-opacity hover:opacity-60"
      >
        <XIcon className="size-4" />
      </a>
    </div>
  )
}

const desktopNavLinkClass = ({ isActive }: { isActive: boolean }) =>
  `text-xs font-medium uppercase tracking-wider transition-colors ${
    isActive ? 'text-ink' : 'text-muted hover:text-ink'
  }`

export function Header() {
  const [servicesOpen, setServicesOpen] = useState(false)

  return (
    <header className="border-b border-hairline bg-white">
      {/* Desktop */}
      <div className="mx-auto hidden max-w-6xl flex-col gap-4 px-6 py-4 lg:flex">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center">
          <div />
          <Link to="/" className="justify-self-center">
            <img src="/logos/SL4_LOGO_Black.png" alt="Silver4" className="h-8 w-auto" />
          </Link>
          <SocialIcons className="justify-self-end" />
        </div>
        <nav className="flex justify-center gap-8">
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.to === '/'} className={desktopNavLinkClass}>
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Mobile */}
      <div className="lg:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <Link to="/">
            <Wordmark />
          </Link>
          <SocialIcons />
        </div>
        <div className="relative border-t border-hairline">
          <button
            type="button"
            onClick={() => setServicesOpen((value) => !value)}
            className="flex w-full items-center justify-between px-4 py-3"
            aria-expanded={servicesOpen}
          >
            <span className="text-xs font-medium uppercase tracking-wider text-accent">
              Explore Rituals
            </span>
            <span className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-ink">
              Hair Services
              <ChevronDownIcon
                className={`size-3.5 transition-transform ${servicesOpen ? 'rotate-180' : ''}`}
              />
            </span>
          </button>
          {servicesOpen && (
            <ul className="border-t border-hairline">
              {SERVICE_MENU_ITEMS.map((item) => (
                <li key={item.to} className="border-b border-hairline last:border-b-0">
                  <NavLink
                    to={item.to}
                    onClick={() => setServicesOpen(false)}
                    className="block px-4 py-3 text-sm text-ink hover:bg-cream"
                  >
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </header>
  )
}
