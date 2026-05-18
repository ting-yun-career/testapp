import { createAppointment, getAppointments } from './appointment'
import { requireAuth0Jwt } from './auth'

type WorkerEnv = Env & {
  AUTH0_AUDIENCE?: string
  AUTH0_DOMAIN?: string
  DB?: D1Database
}

export default {
  async fetch(request, env) {
    const runtimeEnv = env as WorkerEnv
    const url = new URL(request.url)

    if (url.pathname === '/api/appointments' && request.method === 'GET') {
      const auth = await requireAuth0Jwt(request, runtimeEnv, [
        'get:appointment',
      ])

      if (!auth.ok) {
        return auth.response
      }

      return getAppointments(request, runtimeEnv)
    }

    if (url.pathname === '/api/appointments' && request.method === 'POST') {
      const auth = await requireAuth0Jwt(request, runtimeEnv, [
        'post:appointment',
      ])

      if (!auth.ok) {
        return auth.response
      }

      return createAppointment(request, runtimeEnv)
    }

    if (url.pathname.startsWith('/api/')) {
      return Response.json({ error: 'Not found.' }, { status: 404 })
    }

    return env.ASSETS.fetch(request)
  },
} satisfies ExportedHandler<Env>
