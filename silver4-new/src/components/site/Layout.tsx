import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { SiteHeader } from './SiteHeader'
import { SiteFooter } from './SiteFooter'
import { ActionBar } from './ActionBar'
import { Button } from '../Button'

/** Every page's shell: skip link, sticky header, main content, footer, and
    the mobile action bar. Also reproduces what a full page navigation used
    to give for free: land on #hash if the URL has one, otherwise scroll to
    top. */
export function Layout() {
  const location = useLocation()

  useEffect(() => {
    if (location.hash) {
      const el = document.querySelector(location.hash)
      if (el) {
        el.scrollIntoView()
        return
      }
    }
    window.scrollTo(0, 0)
  }, [location.pathname, location.hash])

  return (
    <>
      <Button
        variant="primary"
        href="#main"
        className="fixed top-2 left-2 z-[101] -translate-y-[150%] transition-transform duration-150 ease-[cubic-bezier(0.22,0.61,0.36,1)] focus-visible:translate-y-0 focus:translate-y-0"
      >
        Skip to content
      </Button>

      <SiteHeader />

      <main id="main">
        <Outlet />
      </main>

      <SiteFooter />
      <ActionBar />
    </>
  )
}
