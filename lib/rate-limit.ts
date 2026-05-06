import 'server-only'

type RateLimitState = {
  count: number
  resetAt: number
}

type RateLimitOptions = {
  key: string
  limit: number
  windowMs: number
}

const buckets = new Map<string, RateLimitState>()

function pruneExpiredBuckets(now: number) {
  for (const [key, bucket] of buckets.entries()) {
    if (bucket.resetAt <= now) {
      buckets.delete(key)
    }
  }
}

function getClientIp(request: Request) {
  const forwardedFor = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const cfIp = request.headers.get('cf-connecting-ip')

  const candidate = forwardedFor?.split(',')[0]?.trim() || realIp || cfIp || 'unknown'
  return candidate.toLowerCase()
}

export function checkRateLimit(request: Request, options: RateLimitOptions) {
  const now = Date.now()

  if (buckets.size > 500) {
    pruneExpiredBuckets(now)
  }

  const clientIp = getClientIp(request)
  const bucketKey = `${options.key}:${clientIp}`
  const bucket = buckets.get(bucketKey)

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(bucketKey, { count: 1, resetAt: now + options.windowMs })
    return { allowed: true, retryAfterSeconds: Math.ceil(options.windowMs / 1000) }
  }

  bucket.count += 1

  if (bucket.count > options.limit) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
    }
  }

  return { allowed: true, retryAfterSeconds: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)) }
}
