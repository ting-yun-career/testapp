export default {
  fetch(request, env) {
    const url = new URL(request.url)

    if (url.pathname === '/api/config') {
      return Response.json({
        appEnv: env.APP_ENV,
        apiBaseUrl: env.API_BASE_URL,
        featureSignup: env.FEATURE_SIGNUP,
        hasApiSecret: Boolean(env.API_SECRET),
      })
    }

    if (url.pathname.startsWith('/api/')) {
      return Response.json({
        name: 'Cloudflare',
      })
    }

    return env.ASSETS.fetch(request)
  },
} satisfies ExportedHandler<Env>
