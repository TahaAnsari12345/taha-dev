// Shared helpers for the serverless functions. The leading underscore keeps Vercel from
// exposing this folder as routes.

export const clientIp = (req) =>
  String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown')
    .split(',')[0]
    .trim();

/** Same-origin, localhost (dev) and any ALLOWED_ORIGINS entry are allowed. No Origin header => allowed. */
export function originAllowed(req) {
  const origin = req.headers.origin;
  if (!origin) return true;
  let host;
  try {
    host = new URL(origin).host;
  } catch {
    return false;
  }
  if (host === req.headers.host) return true;
  if (/^(localhost|127\.0\.0\.1)(:\d+)?$/.test(host)) return true;
  const extra = (process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((s) => s.trim().replace(/\/$/, ''))
    .filter(Boolean);
  return extra.includes(origin);
}

/** Sets CORS headers for allowed cross-origin callers. Same-origin requests need none. */
export function applyCors(req, res, methods) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  const origin = req.headers.origin;
  if (origin && originAllowed(req)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Methods', methods);
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Max-Age', '600');
  }
}

/** Fixed-window, in-memory limiter (per warm serverless instance). Returns a `hit(key)` function. */
export function createRateLimiter({ windowMs, max }) {
  const hits = new Map();
  return function limited(key) {
    const now = Date.now();
    if (hits.size > 500) for (const [k, v] of hits) if (now - v.start > windowMs) hits.delete(k);
    const entry = hits.get(key);
    if (!entry || now - entry.start > windowMs) {
      hits.set(key, { start: now, count: 1 });
      return false;
    }
    entry.count += 1;
    return entry.count > max;
  };
}
