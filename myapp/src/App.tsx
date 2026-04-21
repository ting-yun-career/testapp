import { useAuth0 } from '@auth0/auth0-react'
import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from 'react-router-dom'
import { hasAuth0Config } from './auth-config'
import BookingCalendar from './components/web/BookingCalendar'
import Button from './components/web/Button'
import { MenuIcon } from './icons'

function App() {
  return (
    <Routes>
      <Route element={<LandingPage />} path="/" />
      <Route
        element={
          <RequireAuth>
            <DashboardPage />
          </RequireAuth>
        }
        path="/dashboard"
      />
      <Route element={<Navigate replace to="/" />} path="*" />
    </Routes>
  )
}

function LandingPage() {
  const navigate = useNavigate()
  const { isAuthenticated, isLoading, loginWithRedirect } = useAuth0()

  useEffect(() => {
    if (hasAuth0Config && !isLoading && isAuthenticated) {
      navigate('/dashboard', { replace: true })
    }
  }, [isAuthenticated, isLoading, navigate])

  const handleLogin = async () => {
    if (!hasAuth0Config) {
      navigate('/dashboard')
      return
    }

    await loginWithRedirect({
      appState: {
        returnTo: '/dashboard',
      },
    })
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <div className="mx-auto flex min-h-screen max-w-5xl items-center px-6 py-16">
        <section className="w-full rounded-[3px] border border-white/8 bg-white/[0.03] px-8 py-12 shadow-[0_24px_80px_rgba(0,0,0,0.45)] sm:px-12">
          <p className="text-sm uppercase tracking-[0.28em] text-white/45">
            Appointment Platform
          </p>
          <h1 className="mt-4 max-w-2xl text-5xl font-semibold tracking-tight text-white">
            Book and manage appointments from one dashboard.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-white/68">
            Sign in to access the booking dashboard and continue with the
            calendar workflow.
          </p>
          <div className="mt-10">
            <Button onClick={() => void handleLogin()} variant="solid">
              Login
            </Button>
          </div>
        </section>
      </div>
    </main>
  )
}

function DashboardPage() {
  const { logout } = useAuth0()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!isMenuOpen) {
      return
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setIsMenuOpen(false)
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false)
      }
    }

    window.addEventListener('mousedown', handlePointerDown)
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('mousedown', handlePointerDown)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isMenuOpen])

  const handleLogout = () => {
    setIsMenuOpen(false)

    if (!hasAuth0Config) {
      return
    }

    logout({
      logoutParams: {
        returnTo: window.location.origin,
      },
    })
  }

  return (
    <div className="flex min-h-screen flex-col bg-neutral-950">
      <header className="border-b border-white/8 bg-neutral-950/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-[1800px] items-center justify-end px-4 py-3 sm:px-6 lg:px-8">
          <div className="relative" ref={menuRef}>
            <button
              aria-controls="global-menu"
              aria-expanded={isMenuOpen}
              aria-haspopup="menu"
              className="flex h-11 w-11 items-center justify-center rounded-[3px] border border-white/10 bg-white/[0.03] text-white/72 transition hover:border-white/18 hover:bg-white/[0.06] hover:text-white"
              onClick={() => setIsMenuOpen((current) => !current)}
              type="button"
            >
              <MenuIcon />
            </button>

            {isMenuOpen ? (
              <div
                className="absolute right-0 top-[calc(100%+0.1rem)] z-30 min-w-[10rem] rounded-[3px] border border-white/10 bg-neutral-900 p-1 shadow-[0_18px_60px_rgba(0,0,0,0.55)]"
                id="global-menu"
                role="menu"
              >
                <button
                  className="flex w-full items-center rounded-[3px] px-3 py-2 text-left text-sm font-medium text-white/78 transition hover:bg-white/[0.06] hover:text-white"
                  onClick={handleLogout}
                  role="menuitem"
                  type="button"
                >
                  Log out
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </header>
      <BookingCalendar />
    </div>
  )
}

function RequireAuth({ children }: { children: ReactNode }) {
  const location = useLocation()
  const { isAuthenticated, isLoading, loginWithRedirect } = useAuth0()

  useEffect(() => {
    if (hasAuth0Config && !isLoading && !isAuthenticated) {
      void loginWithRedirect({
        appState: {
          returnTo: location.pathname,
        },
      })
    }
  }, [isAuthenticated, isLoading, location.pathname, loginWithRedirect])

  if (!hasAuth0Config) {
    return children
  }

  if (isLoading || !isAuthenticated) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-neutral-950 text-sm text-white/60">
        Loading dashboard...
      </main>
    )
  }

  return children
}

export default App
