import { Redis } from '@upstash/redis/cloudflare'

// Queue-length based concurrency limiter.
// Tracks how many requests are currently in-flight (awaiting async work).
// Per-isolate — use Durable Objects for a global queue across all instances.
const MAX_QUEUE = 3
let activeRequests = 0

const CACHE_KEY = 'cache:/api/test'
const CACHE_TTL = 60  // seconds

export async function handleTest(_request: Request, env: Env): Promise<Response> {
  if (activeRequests >= MAX_QUEUE) {
    return Response.json(
      { error: 'Queue full', activeRequests, maxQueue: MAX_QUEUE },
      { status: 429 },
    )
  }

  activeRequests++
  try {
    const redis = new Redis({
      url: env.UPSTASH_REDIS_REST_URL,
      token: env.UPSTASH_REDIS_REST_TOKEN,
    })

    const cached = await redis.get<object>(CACHE_KEY)
    if (cached) {
      return Response.json(cached, { headers: { 'X-Cache': 'HIT', 'X-Queue-Depth': String(activeRequests) } })
    }

    const data = {
      message: 'Hello from /api/test',
      generatedAt: new Date().toISOString(),
      notes: {
        cache: `Stored in Upstash Redis for ${CACHE_TTL}s. All CF PoPs share this cache.`,
        rateLimit: `Queue-length limiter: max ${MAX_QUEUE} concurrent requests per isolate. Rejected with 429 when full.`,
      },
    }

    await redis.set(CACHE_KEY, data, { ex: CACHE_TTL })

    return Response.json(data, { headers: { 'X-Cache': 'MISS', 'X-Queue-Depth': String(activeRequests) } })
  } finally {
    activeRequests--
  }
}
