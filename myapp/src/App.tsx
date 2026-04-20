import { useAuth0 } from '@auth0/auth0-react'
import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { hasAuth0Config } from './auth-config'
import BookingCalendar from './components/BookingCalendar'
import Button from './components/web/Button'

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
            YYYBook and manage appointments from one dashboard.
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

  return (
    <div className="relative">
      <div className="absolute right-4 top-4 z-20 sm:right-6 sm:top-6">
        <Button
          onClick={() => {
            if (!hasAuth0Config) {
              return
            }

            logout({
              logoutParams: {
                returnTo: window.location.origin,
              },
            })
          }}
          variant="ghost"
        >
          Logout
        </Button>
      </div>
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
