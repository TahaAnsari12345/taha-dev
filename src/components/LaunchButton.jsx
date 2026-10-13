import { useEffect, useRef, useState } from 'react';
import { launchDemo, prewarm } from '../lib/launch';
import Icon from './Icon';

const ext = { target: '_blank', rel: 'noopener noreferrer' };

/**
 * "Live Demo" button for projects whose backend sleeps on free hosting.
 *
 * Click: opens a loading tab right away, wakes the server via /api/wake, then sends that tab to the
 * live site. Ctrl/Cmd/Shift/middle-click still behave like a normal link. If the browser blocks the
 * popup, an in-page "Server is ready, open demo" link appears when the server is up.
 * Pre-warming (hover, focus, scroll into view) is throttled inside lib/launch.js.
 */
export default function LaunchButton({ wakeId, url, title }) {
  const [state, setState] = useState('idle'); // idle | waking | ready
  const [blocked, setBlocked] = useState(false);
  const [secs, setSecs] = useState(0);
  const wrap = useRef(null);
  const alive = useRef(true);

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  // Pre-warm once when the button scrolls into view.
  useEffect(() => {
    const el = wrap.current;
    if (!el || !wakeId || typeof IntersectionObserver === 'undefined') return undefined;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          prewarm(wakeId);
          io.disconnect();
        }
      },
      { threshold: 0.6 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [wakeId]);

  const onClick = (e) => {
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return; // let the browser handle it
    e.preventDefault();
    if (state === 'waking') return;
    setSecs(0);
    const run = launchDemo({
      id: wakeId,
      url,
      title,
      onTick: (s) => alive.current && setSecs(s),
      onState: (s) => {
        if (!alive.current) return;
        if (s === 'waking') setState('waking');
        else if (s === 'ready') setState('ready');
        else setState('idle'); // opened | cancelled
      },
    });
    setBlocked(run.popupBlocked);
  };

  const busy = state === 'waking';

  return (
    <div ref={wrap} className="flex flex-col items-start gap-2">
      <a
        href={url}
        {...ext}
        onClick={onClick}
        onPointerEnter={() => prewarm(wakeId)}
        onFocus={() => prewarm(wakeId)}
        aria-busy={busy}
        aria-label={`${title}: live demo (opens in a new tab)`}
        className={`btn-primary ${busy ? 'pointer-events-none opacity-90' : ''}`}
      >
        {busy ? (
          <>
            <Icon name="spinner" className="h-4 w-4 animate-spin" /> Waking server{secs ? ` · ${secs}s` : '...'}
          </>
        ) : (
          <>
            Live Demo <Icon name="external" className="h-4 w-4" />
          </>
        )}
      </a>

      <div role="status" aria-live="polite" className="max-w-[260px] text-[11px] leading-snug text-muted">
        {busy && blocked && "Your browser blocked the new tab. Hang tight, I'll show a button when the server is awake."}
        {state === 'ready' && (
          <a
            href={url}
            {...ext}
            onClick={() => setState('idle')}
            className="btn-primary !min-h-[40px] !px-4 !py-2 !text-xs"
          >
            Server is ready, open demo <Icon name="external" className="h-3.5 w-3.5" />
          </a>
        )}
      </div>
    </div>
  );
}
