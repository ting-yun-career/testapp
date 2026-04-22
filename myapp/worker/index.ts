import { createAppointment } from './appointment'

type WorkerEnv = Env & {
  DB?: D1Database
}

export default {
  async fetch(request, env) {
    const runtimeEnv = env as WorkerEnv
    const url = new URL(request.url)

    if (url.pathname === '/api/config') {
      return Response.json({
        appEnv: env.APP_ENV,
        apiBaseUrl: env.API_BASE_URL,
        featureSignup: env.FEATURE_SIGNUP,
        hasApiSecret: Boolean(env.API_SECRET),
      })
    }

    if (url.pathname === '/api/appointments' && request.method === 'POST') {
      return createAppointment(request, runtimeEnv)
    }

    if (url.pathname.startsWith('/api/')) {
      return Response.json({ error: 'Not found.' }, { status: 404 })
    }

    return env.ASSETS.fetch(request)
  },
} satisfies ExportedHandler<Env>
