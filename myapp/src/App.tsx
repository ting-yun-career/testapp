import { useEffect, useState } from 'react'

type ConfigResponse = {
  appEnv: string
  apiBaseUrl: string
  featureSignup: boolean
  hasApiSecret: boolean
}

function App() {
  const [config, setConfig] = useState<ConfigResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

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

  return (
    <main className="min-h-screen bg-neutral-950 px-6 py-16 text-neutral-50">
      <div className="mx-auto max-w-3xl">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-orange-400">
          React + Worker example
        </p>
        <h1 className="mt-4 text-5xl font-semibold tracking-tight">
          MyApp
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-neutral-300">
          This page fetches <code className="rounded bg-white/10 px-2 py-1 text-sm">/api/config</code> from your
          Cloudflare Worker and shows the result below.
        </p>

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
                <dd className="mt-2 text-xl font-medium break-all">{config.apiBaseUrl}</dd>
              </div>
              <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                <dt className="text-sm text-neutral-400">FEATURE_SIGNUP</dt>
                <dd className="mt-2 text-xl font-medium">{String(config.featureSignup)}</dd>
              </div>
              <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                <dt className="text-sm text-neutral-400">API_SECRET present</dt>
                <dd className="mt-2 text-xl font-medium">{String(config.hasApiSecret)}</dd>
              </div>
            </dl>
          ) : null}
        </section>
      </div>
    </main>
  )
}

export default App
