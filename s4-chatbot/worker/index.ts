export default {
  async fetch(request, env) {
    const url = new URL(request.url)

    if (url.pathname.startsWith('/api/')) {
      return Response.json({ message: 'Hello from the s4-chatbot worker' })
    }

    return env.ASSETS.fetch(request)
  },
} satisfies ExportedHandler<Env>
