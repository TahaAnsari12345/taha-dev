import { useEffect, useRef, useState } from 'react';
import { animate, useInView, useReducedMotion } from 'framer-motion';

/** Counts from 0 to `value` once visible. Non-numeric stats pass `text` instead. */
export default function Counter({ value, decimals = 0, suffix = '', text }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const reduce = useReducedMotion();
  const [shown, setShown] = useState(reduce ? value : 0);

  useEffect(() => {
    if (text !== undefined || !inView) return undefined;
    if (reduce) {
      setShown(value);
      return undefined;
    }
    const controls = animate(0, value, {
      duration: 1.6,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: setShown,
    });
    return () => controls.stop();
  }, [inView, reduce, value, text]);

  return (
    <span ref={ref}>
      {text !== undefined ? text : `${shown.toFixed(decimals)}${suffix}`}
    </span>
  );
}
