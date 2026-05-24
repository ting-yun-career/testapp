import { createAppointment, deleteAppointment, getAppointments } from './appointment'
import { requireAuth0Jwt } from './auth'
import { createPaymentIntent } from './stripe'

type WorkerEnv = Env & {
  AUTH0_AUDIENCE?: string
  AUTH0_DOMAIN?: string
  DB?: D1Database
  STRIPE_SECRET_KEY?: string
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

    const deleteMatch = url.pathname.match(/^\/api\/appointments\/([^/]+)$/)
    if (deleteMatch && request.method === 'DELETE') {
      const auth = await requireAuth0Jwt(request, runtimeEnv, [
        'delete:appointment',
      ])

      if (!auth.ok) {
        return auth.response
      }

      return deleteAppointment(deleteMatch[1], runtimeEnv)
    }

    if (url.pathname === '/api/payments/create-intent' && request.method === 'POST') {
      const auth = await requireAuth0Jwt(request, runtimeEnv, [])
      if (!auth.ok) return auth.response
      return createPaymentIntent(request, runtimeEnv as WorkerEnv & { STRIPE_SECRET_KEY: string })
    }

    if (url.pathname.startsWith('/api/')) {
      return Response.json({ error: 'Not found.' }, { status: 404 })
    }

    return env.ASSETS.fetch(request)
  },
} satisfies ExportedHandler<Env>
