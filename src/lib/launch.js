/**
 * Demo launching for projects hosted on free-tier backends that go to sleep.
 *
 * The browser only ever talks to our own `/api/wake?id=<project id>` (see api/wake.js); backend
 * URLs live there and nowhere else.
 */
export const POLL_MS = 3000; // gap between readiness checks
export const GIVE_UP_MS = 90_000; // open the demo anyway after this long
export const PREWARM_TTL_MS = 10 * 60 * 1000; // pre-warm at most once per project per 10 minutes

const lastPrewarm = new Map();

async function checkReady(id) {
  const res = await fetch(`/api/wake?id=${encodeURIComponent(id)}`, { cache: 'no-store' });
  if (!res.ok) return false;
  const body = await res.json();
  return body.ready === true;
}

/** Fire-and-forget wake-up ping, throttled per project (also across reloads in the same tab). */
export function prewarm(id) {
  if (typeof window === 'undefined' || navigator.connection?.saveData) return false;
  const now = Date.now();
  let last = lastPrewarm.get(id) ?? 0;
  try {
    last = Math.max(last, Number(sessionStorage.getItem(`prewarm:${id}`)) || 0);
  } catch {
    /* storage unavailable */
  }
  if (now - last < PREWARM_TTL_MS) return false;
  lastPrewarm.set(id, now);
  try {
    sessionStorage.setItem(`prewarm:${id}`, String(now));
  } catch {
    /* storage unavailable */
  }
  checkReady(id).catch(() => {});
  return true;
}

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

function writeLoadingPage(win, title, url) {
  win.document.open();
  win.document.write(`<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex">
<title>Waking up ${esc(title)}...</title>
<style>
html,body{height:100%;margin:0}
body{display:grid;place-items:center;background:#0f172a;color:#f1f5f9;font-family:system-ui,-apple-system,"Segoe UI",sans-serif;text-align:center}
main{max-width:420px;padding:24px}
.spin{width:56px;height:56px;margin:0 auto 24px;border-radius:50%;border:3px solid rgba(148,163,184,.25);border-top-color:#22d3ee;border-right-color:#2563eb;animation:s 1s linear infinite}
@keyframes s{to{transform:rotate(360deg)}}
h1{font-size:22px;margin:0 0 10px}
p{color:#94a3b8;line-height:1.55;margin:0 0 12px;font-size:15px}
#t{font-family:ui-monospace,Consolas,monospace;color:#22d3ee}
a{color:#22d3ee}
@media (prefers-reduced-motion:reduce){.spin{animation-duration:4s}}
</style></head><body><main role="status">
<div class="spin" aria-hidden="true"></div>
<h1>Waking up ${esc(title)}</h1>
<p>This project runs on free hosting, so the first visit can take up to a minute. You will be taken there automatically.</p>
<p><span id="t">0s</span></p>
<p><a href="${esc(url)}" rel="noopener noreferrer">Open it now anyway</a></p>
</main></body></html>`);
  win.document.close();
}

/**
 * Start a launch. Call it synchronously inside the click handler, otherwise the browser treats the
 * new tab as an unsolicited popup and blocks it.
 *
 *  - Opens a loading tab immediately and polls /api/wake every POLL_MS.
 *  - Navigates that tab to `url` when the backend is ready, or after GIVE_UP_MS regardless.
 *  - If the popup is blocked, nothing opens; `onState('ready')` fires instead so the page can show
 *    an in-page "open demo" button.
 *
 * onState receives: 'waking' | 'opened' | 'ready' | 'cancelled'; onTick receives elapsed seconds.
 */
export function launchDemo({ id, url, title, onState = () => {}, onTick = () => {} }) {
  let win = null;
  try {
    win = window.open('', '_blank');
  } catch {
    win = null;
  }
  if (win) {
    try {
      win.opener = null; // the demo site must not be able to reach back into this page
      writeLoadingPage(win, title, url);
    } catch {
      /* tab not scriptable; we can still navigate it */
    }
  }

  const started = Date.now();
  let pollTimer;
  let deadlineTimer;
  let finished = false;

  const stop = () => {
    finished = true;
    clearTimeout(pollTimer);
    clearTimeout(deadlineTimer);
  };

  const finish = () => {
    if (finished) return;
    stop();
    lastPrewarm.set(id, Date.now());
    if (win && !win.closed) {
      win.location.replace(url);
      onState('opened');
    } else if (win) {
      onState('cancelled'); // visitor closed the loading tab
    } else {
      onState('ready'); // popup blocked: let the page offer the link
    }
  };

  const poll = async () => {
    if (finished) return;
    if (win && win.closed) {
      stop();
      onState('cancelled');
      return;
    }
    let ready = false;
    try {
      ready = await checkReady(id);
    } catch {
      ready = false; // transient network error: keep trying until the deadline
    }
    if (finished) return;
    if (ready) return finish();

    const secs = Math.round((Date.now() - started) / 1000);
    onTick(secs);
    try {
      const el = win && !win.closed && win.document.getElementById('t');
      if (el) el.textContent = `${secs}s`;
    } catch {
      /* ignore */
    }
    pollTimer = setTimeout(poll, POLL_MS);
  };

  deadlineTimer = setTimeout(finish, GIVE_UP_MS);
  onState('waking');
  poll();

  return {
    popupBlocked: !win,
    cancel() {
      if (finished) return;
      stop();
      onState('cancelled');
    },
  };
}
