import { useSyncExternalStore } from 'react';

/** Phones and tablets: everything below the `lg` breakpoint. The desktop design is untouched above it. */
export const NARROW_QUERY = '(max-width: 1023px)';

const mq = typeof window !== 'undefined' ? window.matchMedia(NARROW_QUERY) : null;

export const isNarrow = () => Boolean(mq?.matches);

/** Shared (one listener) narrow-viewport hook. */
export const useNarrow = () =>
  useSyncExternalStore(
    (cb) => {
      if (!mq) return () => {};
      // Safari < 14 only has the deprecated addListener/removeListener
      if (mq.addEventListener) {
        mq.addEventListener('change', cb);
        return () => mq.removeEventListener('change', cb);
      }
      mq.addListener?.(cb);
      return () => mq.removeListener?.(cb);
    },
    () => Boolean(mq?.matches),
    () => false,
  );

/** Weak hardware or data-saver: heavy effects (backdrop blur, 3D card depth) are switched off on narrow screens. */
export const isLowEnd = () => {
  if (typeof navigator === 'undefined') return false;
  return (
    (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4) ||
    (navigator.deviceMemory && navigator.deviceMemory <= 4) ||
    navigator.connection?.saveData === true
  );
};
