import { useEffect, useState } from 'react';
import { animate, motion, useReducedMotion } from 'framer-motion';
import { profile } from '../data/portfolio';
import { heroReady } from '../lib/ready';

/** Short branded intro. Waits for web fonts (capped) so the page doesn't jump when it reveals. */
export default function Loader({ onDone }) {
  const reduce = useReducedMotion();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const cap = (p, ms) => Promise.race([p, new Promise((r) => setTimeout(r, ms))]);
    // Fade out only after fonts are ready AND the hero scene has drawn its first frame
    // (each capped, so a slow device or a crashed scene can never trap the visitor here).
    const fontsReady = Promise.all([cap(document.fonts?.ready ?? Promise.resolve(), 1500), cap(heroReady, 4500)]);
    const controls = animate(0, 100, {
      duration: reduce ? 0.25 : 0.8,
      ease: 'easeInOut',
      onUpdate: (v) => setProgress(Math.round(v)),
      onComplete: () => fontsReady.then(() => !cancelled && onDone()),
    });
    return () => {
      cancelled = true;
      controls.stop();
    };
  }, [onDone, reduce]);

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-bg"
      exit={{ opacity: 0, scale: 1.04 }}
      transition={{ duration: 0.55, ease: 'easeInOut' }}
      role="progressbar"
      aria-label="Loading portfolio"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={progress}
    >
      <div className="relative flex h-24 w-24 items-center justify-center">
        <span className="absolute inset-0 animate-spin-slow rounded-full border-2 border-transparent border-t-cyan border-r-brand" />
        <span className="font-display text-3xl font-bold gradient-text">{profile.initials}</span>
      </div>
      <p className="mt-6 font-mono text-xs uppercase tracking-[0.3em] text-muted">Loading experience</p>
      <div className="mt-4 h-1 w-48 overflow-hidden rounded-full bg-muted/20">
        <div
          className="h-full rounded-full bg-gradient-to-r from-brand via-cyan to-violet"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="mt-2 font-mono text-xs text-muted">{progress === 100 ? 'Almost there' : `${progress}%`}</p>
    </motion.div>
  );
}
