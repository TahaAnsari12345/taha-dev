import { applyCors, clientIp, createRateLimiter, originAllowed } from './_lib/http.js';

/**
 * GET /api/github
 *
 * Live numbers for the GitHub section. The username is fixed here (never read from the request), and
 * the optional GITHUB_TOKEN env variable only raises GitHub's rate limit. It is never returned.
 */
const USERNAME = 'TahaAnsari12345';
const API = 'https://api.github.com';
const TIMEOUT_MS = 8000;
const MAX_PAGES = 5; // 500 repos is far beyond what this profile needs
const limited = createRateLimiter({ windowMs: 60_000, max: 30 });

let lastGood = null; // last successful payload, served (stale: true) if GitHub fails or rate limits

async function gh(path) {
  const headers = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'portfolio-github-stats',
    'X-GitHub-Api-Version': '2022-11-28',
  };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  const res = await fetch(`${API}${path}`, { headers, signal: AbortSignal.timeout(TIMEOUT_MS) });
  if (!res.ok) throw new Error(`github ${res.status}`);
  return res.json();
}

async function allRepos() {
  const repos = [];
  for (let page = 1; page <= MAX_PAGES; page += 1) {
    const batch = await gh(`/users/${USERNAME}/repos?per_page=100&sort=pushed&page=${page}`);
    repos.push(...batch);
    if (batch.length < 100) break;
  }
  return repos;
}

async function build() {
  const [user, repos] = await Promise.all([gh(`/users/${USERNAME}`), allRepos()]);
  const own = repos.filter((r) => !r.fork);

  const counts = {};
  own.forEach((r) => {
    if (r.language) counts[r.language] = (counts[r.language] || 0) + 1;
  });
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  const topLanguages = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, n]) => ({ name, count: n, percent: total ? Math.round((n / total) * 100) : 0 }));

  const latestRepos = [...own]
    .sort((a, b) => new Date(b.pushed_at) - new Date(a.pushed_at))
    .slice(0, 3)
    .map((r) => ({
      name: r.name,
      description: r.description,
      language: r.language,
      stars: r.stargazers_count,
      html_url: r.html_url,
      pushed_at: r.pushed_at,
    }));

  return {
    followers: user.followers,
    following: user.following,
    publicRepos: user.public_repos,
    totalStars: own.reduce((sum, r) => sum + r.stargazers_count, 0),
    topLanguages,
    latestRepos,
    updatedAt: new Date().toISOString(),
  };
}

export default async function handler(req, res) {
  applyCors(req, res, 'GET, OPTIONS');

  if (req.method === 'OPTIONS') return res.status(originAllowed(req) ? 204 : 403).end();
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET, OPTIONS');
    return res.status(405).json({ error: 'method_not_allowed' });
  }
  if (!originAllowed(req)) return res.status(403).json({ error: 'forbidden' });
  if (limited(clientIp(req))) {
    res.setHeader('Retry-After', '60');
    return res.status(429).json({ error: 'too_many_requests' });
  }

  try {
    lastGood = await build();
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    return res.status(200).json(lastGood);
  } catch {
    // never forward GitHub's error text or anything about the request
    if (lastGood) {
      res.setHeader('Cache-Control', 's-maxage=60');
      return res.status(200).json({ ...lastGood, stale: true });
    }
    res.setHeader('Cache-Control', 'no-store');
    return res.status(502).json({ error: 'github_unavailable' });
  }
}
