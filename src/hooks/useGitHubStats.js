import { useCallback, useEffect, useRef, useState } from 'react';

const REFRESH_MS = 5 * 60 * 1000;
const MIN_GAP_MS = 30 * 1000; // don't refetch on tab-focus more often than this

/**
 * Live GitHub numbers from our own /api/github endpoint (the browser never calls GitHub directly).
 * Status: 'loading' | 'ok' | 'error'. Refetches every 5 minutes and when the tab becomes visible again.
 * After a first success, a later failed refresh keeps the last good data on screen.
 */
export default function useGitHubStats() {
  const [state, setState] = useState({ status: 'loading', data: null });
  const lastFetch = useRef(0);
  const inFlight = useRef(null);

  const load = useCallback(() => {
    if (inFlight.current) return;
    const ctrl = new AbortController();
    inFlight.current = ctrl;
    lastFetch.current = Date.now();
    fetch('/api/github', { signal: ctrl.signal, headers: { Accept: 'application/json' } })
      .then((res) => {
        if (!res.ok) throw new Error('bad status');
        return res.json();
      })
      .then((data) => {
        if (typeof data?.followers !== 'number') throw new Error('bad payload');
        setState({ status: 'ok', data });
      })
      .catch((err) => {
        if (err.name === 'AbortError') return;
        setState((s) => (s.data ? s : { status: 'error', data: null }));
      })
      .finally(() => {
        if (inFlight.current === ctrl) inFlight.current = null;
      });
  }, []);

  useEffect(() => {
    load();
    const timer = setInterval(() => {
      if (document.visibilityState === 'visible') load();
    }, REFRESH_MS);
    const onVisible = () => {
      if (document.visibilityState === 'visible' && Date.now() - lastFetch.current > MIN_GAP_MS) load();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisible);
      inFlight.current?.abort();
      inFlight.current = null;
    };
  }, [load]);

  return state;
}
