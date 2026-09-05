import { Link } from 'react-router-dom'
import { Container } from '../layout'
import { Icon } from '../Icon'
import { CopyButton } from '../CopyButton'
import {
  ADDRESS,
  EMAIL,
  FOOTER_EXPLORE_LINKS,
  FOOTER_GUEST_LINKS,
  GOOGLE_REVIEW_URL,
  PHONE_DISPLAY,
  PHONE_TEL,
} from '../../lib/constants'

/** Site footer, duplicated on every page in the original hand-off (partial #2).
    Also the JS-off fallback for the mobile drawer's nav links. */
export function SiteFooter() {
  return (
    <footer id="site-footer" className="bg-ink-deep text-white/72 pt-16 pb-8 text-sm">
      <Container>
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-3 text-md text-paper">
              <span>{PHONE_DISPLAY}</span>
              <CopyButton value={PHONE_TEL} label="Copy phone number" />
            </div>
            <div className="mt-2 flex items-center gap-3 text-md text-paper">
              <span>{EMAIL}</span>
              <CopyButton value={EMAIL} label="Copy email address" />
            </div>
            <div className="mt-3 flex items-center gap-3 text-md text-paper">
              <span>{ADDRESS}</span>
              <CopyButton value={ADDRESS} label="Copy address" />
            </div>
            <div className="mt-6 flex gap-2">
              <a
                href="#"
                aria-label="Silver4 on Instagram"
                className="grid place-items-center w-11 h-11 border border-line-dark transition-colors duration-[280ms] ease-[cubic-bezier(0.22,0.61,0.36,1)] hover:border-accent-soft hover:text-accent-soft"
              >
                <Icon name="photo_camera" />
              </a>
              <a
                href="#"
                aria-label="Silver4 on Facebook"
                className="grid place-items-center w-11 h-11 border border-line-dark transition-colors duration-[280ms] ease-[cubic-bezier(0.22,0.61,0.36,1)] hover:border-accent-soft hover:text-accent-soft"
              >
                <Icon name="thumb_up" />
              </a>
              <a
                href={GOOGLE_REVIEW_URL}
                target="_blank"
                rel="noopener"
                aria-label="Leave a Google review"
                className="grid place-items-center w-11 h-11 border border-line-dark transition-colors duration-[280ms] ease-[cubic-bezier(0.22,0.61,0.36,1)] hover:border-accent-soft hover:text-accent-soft"
              >
                <Icon name="star" />
              </a>
            </div>
          </div>

          <nav aria-label="Footer navigation">
            <p className="text-xs font-medium tracking-wider uppercase text-accent-soft mb-4">
              Explore
            </p>
            <ul className="flex flex-col gap-2">
              {FOOTER_EXPLORE_LINKS.map((item) => (
                <li key={item.label}>
                  <Link to={item.to} className="hover:text-paper">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Guest information">
            <p className="text-xs font-medium tracking-wider uppercase text-accent-soft mb-4">
              Guest information
            </p>
            <ul className="flex flex-col gap-2">
              {FOOTER_GUEST_LINKS.map((item) => (
                <li key={item.label}>
                  <Link to={item.to} className="hover:text-paper">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="flex flex-wrap gap-x-6 gap-y-4 justify-between mt-16 pt-6 border-t border-line-dark text-xs text-white/50">
          <p>© <span>2026</span> Silver4 Salon™.</p>
        </div>
      </Container>
    </footer>
  )
}
