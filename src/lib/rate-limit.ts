interface Entry {
  count: number
  resetAt: number
}

const store = new Map<string, Entry>()
let lastClean = Date.now()

function maybeClean() {
  const now = Date.now()
  if (now - lastClean < 60_000) return
  lastClean = now
  for (const [key, entry] of store) {
    if (now > entry.resetAt) store.delete(key)
  }
}

/**
 * Returns true if request is allowed, false if rate-limited.
 * @param key       Unique bucket key (e.g. `auth:${ip}`)
 * @param max       Max requests allowed in the window
 * @param windowMs  Window size in milliseconds
 */
export function checkRateLimit(key: string, max: number, windowMs: number): boolean {
  maybeClean()
  const now = Date.now()
  const entry = store.get(key)

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs })
    return true
  }

  if (entry.count >= max) return false

  entry.count++
  return true
}

export function getClientIp(req: Request): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    'unknown'
  )
}

export function rateLimitResponse() {
  return new Response(
    JSON.stringify({ error: 'Demasiados intentos. Espera un momento e inténtalo de nuevo.' }),
    { status: 429, headers: { 'Content-Type': 'application/json', 'Retry-After': '60' } }
  )
}
