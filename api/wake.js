import { applyCors, clientIp, createRateLimiter, originAllowed } from './_lib/http.js';

/**
 * GET /api/wake?id=<project id>
 *
 * Pings a free-tier backend so it spins up before a visitor opens the demo, and reports only
 * whether it is awake: `{ "ready": true | false }`.
 *
 * This is the ONLY file in the project that contains backend URLs. To change one, edit the map
 * below. The browser sends just an allow-listed id; any URL it might send is ignored, and no
 * backend URL is ever returned.
 */
const BACKENDS = {
  oakhire: 'https://oakhire.onrender.com',
  shopzi: 'https://temporary-repository001-backend.onrender.com',
  'ai-saas': 'https://aiverse-hpt6.onrender.com/',
  taskforge: 'https://taskforge-krwe.onrender.com/api/',
};

const PING_TIMEOUT_MS = 8000; // keep well under the function's maxDuration (see vercel.json)
const READY_CACHE_MS = 60_000; // an awake server stays awake for a while; don't re-ping on every poll
const limited = createRateLimiter({ windowMs: 60_000, max: 45 }); // ~20 polls/min per open tab

const readyUntil = new Map(); // id -> timestamp
const inFlight = new Map(); // id -> Promise<boolean>, so concurrent polls share one ping

async function ping(id) {
  try {
    const res = await fetch(BACKENDS[id], {
      method: 'GET',
      redirect: 'manual',
      headers: { 'User-Agent': 'portfolio-wake/1.0', Accept: '*/*' },
      signal: AbortSignal.timeout(PING_TIMEOUT_MS),
    });
    res.body?.cancel().catch(() => {});
    // Any answer below 500 means the app itself responded (a sleeping Render service answers 5xx or hangs).
    return res.status < 500;
  } catch {
    return false; // timeout / network error => still waking
  }
}

function isReady(id) {
  if ((readyUntil.get(id) ?? 0) > Date.now()) return Promise.resolve(true);
  if (!inFlight.has(id)) {
    const p = ping(id)
      .then((ok) => {
        if (ok) readyUntil.set(id, Date.now() + READY_CACHE_MS);
        return ok;
      })
      .finally(() => inFlight.delete(id));
    inFlight.set(id, p);
  }
  return inFlight.get(id);
}

export default async function handler(req, res) {
  applyCors(req, res, 'GET, OPTIONS');

  if (req.method === 'OPTIONS') return res.status(originAllowed(req) ? 204 : 403).end();
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET, OPTIONS');
    return res.status(405).json({ ready: false });
  }
  if (!originAllowed(req)) return res.status(403).json({ ready: false });

  if (limited(clientIp(req))) {
    res.setHeader('Retry-After', '60');
    return res.status(429).json({ ready: false });
  }

  const id = typeof req.query?.id === 'string' ? req.query.id : '';
  if (!/^[a-z0-9-]{1,32}$/.test(id) || !Object.hasOwn(BACKENDS, id)) {
    return res.status(400).json({ ready: false });
  }

  return res.status(200).json({ ready: await isReady(id) });
}
