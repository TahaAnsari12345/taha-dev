import { useEffect, useRef } from 'react';
import { useReducedMotion } from 'framer-motion';

/** Soft spotlight that trails the pointer. Fine pointers only; off for reduced motion. */
export default function CursorGlow() {
  const ref = useRef(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return undefined;
    const el = ref.current;
    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    let tx = x;
    let ty = y;
    let raf = 0;

    const loop = () => {
      x += (tx - x) * 0.14;
      y += (ty - y) * 0.14;
      el.style.transform = `translate3d(${x - 200}px, ${y - 200}px, 0)`;
      raf = Math.abs(tx - x) + Math.abs(ty - y) > 0.5 ? requestAnimationFrame(loop) : 0;
    };
    const onMove = (e) => {
      tx = e.clientX;
      ty = e.clientY;
      el.style.opacity = '1';
      if (!raf) raf = requestAnimationFrame(loop);
    };
    const onLeave = () => {
      el.style.opacity = '0';
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    document.documentElement.addEventListener('pointerleave', onLeave);
    return () => {
      window.removeEventListener('pointermove', onMove);
      document.documentElement.removeEventListener('pointerleave', onLeave);
      cancelAnimationFrame(raf);
    };
  }, [reduce]);

  if (reduce) return null;
  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-[55] max-lg:hidden h-[400px] w-[400px] rounded-full opacity-0 transition-opacity duration-300"
      style={{
        background: 'radial-gradient(circle, rgb(var(--cyan) / 0.16) 0%, rgb(var(--brand) / 0.09) 38%, transparent 68%)',
        willChange: 'transform',
      }}
    />
  );
}
