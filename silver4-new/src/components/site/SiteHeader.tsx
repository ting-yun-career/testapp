import { Link, NavLink } from 'react-router-dom'
import { Container } from '../layout'
import { Button } from '../Button'
import { Icon } from '../Icon'
import { CopyButton } from '../CopyButton'
import { useScrolledHeader } from '../../hooks/useScrolledHeader'
import { useNavDrawer } from '../../hooks/useNavDrawer'
import { ADDRESS, BOOKING_URL, EMAIL, NAV_ITEMS, PHONE_DISPLAY, PHONE_TEL } from '../../lib/constants'
import logo from '../../assets/logos/SL4_FLOURISH_Black.png'

/** Site header — sticky, with a mobile off-canvas drawer at <64rem and an
    inline nav at >=64rem. Ported from .site-header/.site-nav/.nav-toggle. */
export function SiteHeader() {
  const scrolled = useScrolledHeader()
  const { isOpen, open, close, navRef, toggleRef } = useNavDrawer()

  return (
    <header
      className={`sticky top-0 z-[100] bg-paper border-b border-line transition-shadow duration-[280ms] ease-[cubic-bezier(0.22,0.61,0.36,1)] ${
        scrolled ? 'shadow-[0_1px_2px_rgb(20_17_15/6%),0_2px_8px_rgb(20_17_15/4%)]' : ''
      }`}
    >
      <Container className="flex items-center justify-between gap-6 min-h-[4.25rem]">
        <Link to="/" className="flex flex-col leading-none">
          <img className="block h-11 w-auto" src={logo} alt="Silver4 Hair &amp; Beauty Salon" />
        </Link>

        <nav
          id="site-nav"
          ref={navRef}
          aria-label="Main navigation"
          className={`fixed inset-y-0 right-0 z-[200] w-[min(22rem,86vw)] px-6 pt-12 pb-8 bg-ink text-paper overflow-y-auto transition-[transform,visibility] duration-[280ms] ease-[cubic-bezier(0.16,1,0.3,1)] lg:static lg:w-auto lg:px-0 lg:py-0 lg:bg-transparent lg:text-inherit lg:overflow-visible ${
            isOpen ? 'translate-x-0 visible' : 'translate-x-full invisible lg:translate-x-0 lg:visible'
          }`}
        >
          <ul className="flex flex-col gap-2 mt-8 lg:flex-row lg:items-center lg:gap-6 lg:mt-0">
            {NAV_ITEMS.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) =>
                    `block py-3 border-b border-line-dark font-nav text-lg transition-colors duration-150 ease-[cubic-bezier(0.22,0.61,0.36,1)] hover:text-accent-soft lg:border-b-0 lg:py-2 lg:font-body lg:text-xs lg:font-medium lg:tracking-wider lg:uppercase lg:hover:text-accent ${
                      isActive ? 'text-accent-soft lg:text-accent' : ''
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-col gap-2 text-sm text-white/70 lg:hidden">
            <div className="flex items-center gap-3 text-md text-paper">
              <span>{PHONE_DISPLAY}</span>
              <CopyButton value={PHONE_TEL} label="Copy phone number" />
            </div>
            <div className="flex items-center gap-3 text-md text-paper">
              <span>{EMAIL}</span>
              <CopyButton value={EMAIL} label="Copy email address" />
            </div>
            <div className="flex items-center gap-3 text-md text-paper">
              <span>{ADDRESS}</span>
              <CopyButton value={ADDRESS} label="Copy address" />
            </div>
            <p className="mt-3">Open daily 11:00AM–7:00PM</p>
          </div>
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden md:block">
            <Button variant="primary" size="sm" href={BOOKING_URL} target="_blank" rel="noopener">
              Book Now
            </Button>
          </div>

          <button
            type="button"
            ref={toggleRef}
            aria-expanded={isOpen}
            aria-controls="site-nav"
            onClick={() => (isOpen ? close() : open())}
            className="grid place-items-center w-11 h-11 text-ink lg:hidden"
          >
            <span className="sr-only">Menu</span>
            <Icon name={isOpen ? 'close' : 'menu'} className="text-[1.75rem]" />
          </button>
        </div>
      </Container>

      <div
        aria-hidden="true"
        onClick={close}
        className={`fixed inset-0 z-[199] bg-[rgb(10_9_8/70%)] transition-opacity duration-[280ms] ease-[cubic-bezier(0.22,0.61,0.36,1)] lg:hidden ${
          isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
      />
    </header>
  )
}
