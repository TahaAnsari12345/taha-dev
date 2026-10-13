import { useMemo } from 'react';
import { useReducedMotion } from 'framer-motion';
import { isLowEnd, useNarrow } from '../lib/device';

/**
 * Decides how heavy the 3D scenes may be.
 *  - narrow: viewport < 1024px (phones/tablets) -> layout + a lighter mobile scene, touch tilt, deferred start
 *  - low:    narrow, touch-first, data-saver or weak hardware -> fewer particles, no postprocessing, lower DPR
 *  - reduce: user prefers reduced motion -> single still frame (desktop) / static CSS fallback (narrow)
 * `narrow` follows the (max-width: 1023px) media query live (rotating a tablet, resizing the window).
 */
export default function useDeviceTier() {
  const reduce = useReducedMotion() ?? false;
  const narrow = useNarrow();
  return useMemo(() => {
    if (typeof window === 'undefined') return { low: true, reduce, narrow: true };
    const coarse = window.matchMedia('(pointer: coarse)').matches;
    return { low: narrow || coarse || Boolean(isLowEnd()), reduce, narrow };
  }, [reduce, narrow]);
}
