import { useAuth0 } from '@auth0/auth0-react'
import { useEffect, useState } from 'react'
import { Link, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { auth0Connection, hasAuth0Config } from './auth'

type ConfigResponse = {
  appEnv: string
  apiBaseUrl: string
  featureSignup: boolean
  hasApiSecret: boolean
}

type AuthControlsProps = {
  isAuthenticated: boolean
  onLogin: () => Promise<void>
  onLogout: () => void
}

type WorkerPanelProps = {
  config: ConfigResponse | null
  error: string | null
}

type ProfilePanelProps = {
  isAuthLoading: boolean
  isAuthenticated: boolean
  user?: {
    name?: string | null
    email?: string | null
  }
}

function Shell({
  children,
  isAuthenticated,
  onLogin,
  onLogout,
}: React.PropsWithChildren<AuthControlsProps>) {
  return (
    <main className="min-h-screen bg-neutral-950 px-6 py-16 text-neutral-50">
      <div className="mx-auto max-w-5xl">
        <header className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-orange-400">
              React + Worker example
            </p>
            <h1 className="mt-4 text-5xl font-semibold tracking-tight">
              MyApp
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-neutral-300">
              A small React app with public and protected routes backed by Auth0
              and a Cloudflare Worker.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {hasAuth0Config ? (
              isAuthenticated ? (
                <button
                  className="rounded-full bg-white px-5 py-2 text-sm font-medium text-neutral-950"
                  onClick={onLogout}
                >
                  Log out
                </button>
              ) : (
                <button
                  className="rounded-full bg-orange-400 px-5 py-2 text-sm font-medium text-neutral-950"
                  onClick={() => void onLogin()}
                >
                  Log in
                </button>
              )
            ) : null}
          </div>
        </header>

        <nav className="mt-10 flex flex-wrap gap-3">
          <Link
            className="rounded-full border border-white/10 px-4 py-2 text-sm text-neutral-200"
            to="/"
          >
            Home
          </Link>
          <Link
            className="rounded-full border border-white/10 px-4 py-2 text-sm text-neutral-200"
            to="/public"
          >
            Public page
          </Link>
          <Link
            className="rounded-full border border-white/10 px-4 py-2 text-sm text-neutral-200"
            to="/protected"
          >
            Protected page
          </Link>
        </nav>

        {children}
      </div>
    </main>
  )
}

function AuthPanel({
  isAuthLoading,
  isAuthenticated,
  user,
}: ProfilePanelProps) {
  return (
    <section className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/20">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Auth0 authentication</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-300">
            This app can keep some routes public while requiring login for
            others.
          </p>
        </div>
      </div>

      {!hasAuth0Config ? (
        <div className="mt-6 rounded-xl border border-amber-400/30 bg-amber-400/10 p-4 text-sm text-amber-100">
          Add{' '}
          <code className="rounded bg-black/20 px-2 py-1">
            VITE_AUTH0_DOMAIN
          </code>
          ,
          <code className="mx-1 rounded bg-black/20 px-2 py-1">
            VITE_AUTH0_CLIENT_ID
          </code>
          , and
          <code className="ml-1 rounded bg-black/20 px-2 py-1">
            VITE_AUTH0_CONNECTION
          </code>{' '}
          to enable Auth0.
        </div>
      ) : null}

      {hasAuth0Config && auth0Connection ? (
        <p className="mt-6 text-sm text-neutral-400">
          Using Auth0 connection{' '}
          <code className="rounded bg-black/20 px-2 py-1">
            {auth0Connection}
          </code>
        </p>
      ) : null}

      {hasAuth0Config && isAuthLoading ? (
        <p className="mt-6 text-neutral-300">Checking Auth0 session...</p>
      ) : null}

      {hasAuth0Config && isAuthenticated && user ? (
        <dl className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-white/10 bg-black/20 p-4">
            <dt className="text-sm text-neutral-400">Logged in as</dt>
            <dd className="mt-2 text-xl font-medium">
              {user.name ?? 'Unknown user'}
            </dd>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/20 p-4">
            <dt className="text-sm text-neutral-400">Email</dt>
            <dd className="mt-2 text-xl font-medium break-all">
              {user.email ?? 'No email returned'}
            </dd>
          </div>
        </dl>
      ) : null}
    </section>
  )
}

function WorkerPanel({ config, error }: WorkerPanelProps) {
  return (
    <section className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/20">
      <h2 className="text-lg font-semibold">Worker response</h2>

      {!config && !error ? (
        <p className="mt-4 text-neutral-300">Loading config...</p>
      ) : null}

      {error ? (
        <p className="mt-4 text-red-300">Failed to load: {error}</p>
      ) : null}

      {config ? (
        <dl className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-white/10 bg-black/20 p-4">
            <dt className="text-sm text-neutral-400">APP_ENV</dt>
            <dd className="mt-2 text-xl font-medium">{config.appEnv}</dd>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/20 p-4">
            <dt className="text-sm text-neutral-400">API_BASE_URL</dt>
            <dd className="mt-2 text-xl font-medium break-all">
              {config.apiBaseUrl}
            </dd>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/20 p-4">
            <dt className="text-sm text-neutral-400">FEATURE_SIGNUP</dt>
            <dd className="mt-2 text-xl font-medium">
              {String(config.featureSignup)}
            </dd>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/20 p-4">
            <dt className="text-sm text-neutral-400">API_SECRET present</dt>
            <dd className="mt-2 text-xl font-medium">
              {String(config.hasApiSecret)}
            </dd>
          </div>
        </dl>
      ) : null}
    </section>
  )
}

function HomePage(props: WorkerPanelProps & ProfilePanelProps) {
  return (
    <>
      <section className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/20">
        <h2 className="text-lg font-semibold">Home</h2>
        <p className="mt-4 max-w-2xl text-neutral-300">
          Start here, then try the public page and the protected page from the
          navigation above.
        </p>
      </section>
      <AuthPanel
        isAuthLoading={props.isAuthLoading}
        isAuthenticated={props.isAuthenticated}
        user={props.user}
      />
      <WorkerPanel config={props.config} error={props.error} />
    </>
  )
}

function PublicPage() {
  return (
    <section className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/20">
      <h2 className="text-lg font-semibold">Public page</h2>
      <p className="mt-4 max-w-2xl text-neutral-300">
        Anyone can visit this route without signing in. It is useful for
        marketing content, docs, or other public sections of your app.
      </p>
    </section>
  )
}

function ProtectedPage({
  user,
}: {
  user?: { name?: string | null; email?: string | null }
}) {
  return (
    <section className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/20">
      <h2 className="text-lg font-semibold">Protected page</h2>
      <p className="mt-4 max-w-2xl text-neutral-300">
        You are signed in, so this route can now show private app data.
      </p>
      <div className="mt-6 rounded-xl border border-emerald-400/20 bg-emerald-400/10 p-4 text-emerald-100">
        <p>Welcome back{user?.name ? `, ${user.name}` : ''}.</p>
        <p className="mt-2 text-sm text-emerald-50/80">
          {user?.email ?? 'No email returned from Auth0.'}
        </p>
      </div>
    </section>
  )
}

function ProtectedRoute({
  isAuthenticated,
  isAuthLoading,
  onLogin,
  children,
}: React.PropsWithChildren<{
  isAuthenticated: boolean
  isAuthLoading: boolean
  onLogin: () => Promise<void>
}>) {
  const location = useLocation()

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      void onLogin()
    }
  }, [isAuthenticated, isAuthLoading, onLogin])

  if (isAuthLoading) {
    return <p className="mt-10 text-neutral-300">Checking your login...</p>
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace state={{ from: location }} />
  }

  return <>{children}</>
}

function App() {
  const [config, setConfig] = useState<ConfigResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const {
    isAuthenticated,
    isLoading: isAuthLoading,
    loginWithRedirect,
    logout,
    user,
  } = useAuth0()

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const response = await fetch('/api/config')

        if (!response.ok) {
          throw new Error(`Request failed with ${response.status}`)
        }

        const data = (await response.json()) as ConfigResponse
        setConfig(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      }
    }

    void loadConfig()
  }, [])

  const handleLogin = async () => {
    await loginWithRedirect({
      authorizationParams: auth0Connection
        ? { connection: auth0Connection }
        : undefined,
    })
  }

  return (
    <Shell
      isAuthenticated={isAuthenticated}
      onLogin={handleLogin}
      onLogout={() =>
        void logout({
          logoutParams: { returnTo: window.location.origin },
        })
      }
    >
      <Routes>
        <Route
          path="/"
          element={
            <HomePage
              config={config}
              error={error}
              isAuthLoading={isAuthLoading}
              isAuthenticated={isAuthenticated}
              user={user}
            />
          }
        />
        <Route path="/public" element={<PublicPage />} />
        <Route
          path="/protected"
          element={
            <ProtectedRoute
              isAuthenticated={isAuthenticated}
              isAuthLoading={isAuthLoading}
              onLogin={handleLogin}
            >
              <ProtectedPage user={user} />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Shell>
  )
}

export default App
