import { useAuth0 } from '@auth0/auth0-react'
import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from 'react-router-dom'
import BookingCalendar from './components/web/BookingCalendar'
import BottomNav, { type NavView } from './components/BottomNav'
import MenuDropdown from './components/MenuDropdown'
import Button from './components/web/Button'
import { hasAuth0Config } from './auth-config'
import { usePaymentApi } from './hooks/usePaymentApi'
import CheckoutPage from './pages/Checkout'
import PaymentSuccessPage from './pages/PaymentSuccess'

const APPOINTMENT_PRICE_ID = 'price_1TaL08K3O3rcWSY2XwJYNITC'

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
      <Route element={<CheckoutPage />} path="/checkout" />
      <Route element={<PaymentSuccessPage />} path="/payment/success" />
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
  const navigate = useNavigate()
  const { createPaymentIntent } = usePaymentApi()
  const [activeView, setActiveView] = useState<NavView>('calendar')
  const [buyLoading, setBuyLoading] = useState(false)
  const [buyError, setBuyError] = useState<string | null>(null)

  async function handleBuy(priceId: string) {
    setBuyLoading(true)
    setBuyError(null)
    try {
      const clientSecret = await createPaymentIntent(priceId)
      navigate('/checkout', { state: { clientSecret } })
    } catch (err) {
      setBuyError(err instanceof Error ? err.message : 'Something went wrong.')
      setBuyLoading(false)
    }
  }

  const menuItems = [
    {
      label: 'Log out',
      onClick: () => {
        if (!hasAuth0Config) return
        logout({ logoutParams: { returnTo: window.location.origin } })
      },
    },
  ]

  return (
    <div className="relative min-h-screen">
      <div className="fixed left-4 top-4 z-20 sm:left-6 sm:top-6">
        <MenuDropdown items={menuItems} />
      </div>

      {activeView === 'calendar' && <BookingCalendar />}
      {activeView === 'shop' && (
        <ShopView
          error={buyError}
          loading={buyLoading}
          onBuy={priceId => void handleBuy(priceId)}
        />
      )}

      <BottomNav active={activeView} onChange={setActiveView} />
    </div>
  )
}

function ShopView({
  error,
  loading,
  onBuy,
}: {
  error: string | null
  loading: boolean
  onBuy: (priceId: string) => void
}) {
  return (
    <div className="flex min-h-screen items-center justify-center px-6 pb-24 pt-16">
      <div className="w-full max-w-sm rounded-[3px] border border-white/8 bg-white/[0.03] px-8 py-10 shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
        <p className="text-xs uppercase tracking-[0.28em] text-white/40">Appointment</p>
        <h2 className="mt-3 text-xl font-semibold tracking-tight text-white">Consultation</h2>
        <p className="mt-2 text-sm text-white/50">Book a one-on-one consultation session.</p>
        <p className="mt-4 text-3xl font-semibold text-white">$50</p>
        {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
        <div className="mt-6">
          <Button
            disabled={loading}
            onClick={() => onBuy(APPOINTMENT_PRICE_ID)}
            variant="solid"
          >
            {loading ? 'Preparing...' : 'Buy now'}
          </Button>
        </div>
      </div>
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
