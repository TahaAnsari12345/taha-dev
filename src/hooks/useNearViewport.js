import { useEffect, useRef, useState } from 'react';

/** Tracks whether an element is near the viewport. `once` keeps it true after the first sighting. */
export default function useNearViewport({ once = false, margin = '200px' } = {}) {
  const ref = useRef(null);
  const [near, setNear] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setNear(true);
      return undefined;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setNear(true);
          if (once) io.disconnect();
        } else if (!once) {
          setNear(false);
        }
      },
      { rootMargin: margin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [once, margin]);

  return [ref, near];
}
