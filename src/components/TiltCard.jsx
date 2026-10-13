import { motion, useMotionTemplate, useMotionValue, useReducedMotion, useSpring, useTransform } from 'framer-motion';
import useMediaQuery from '../hooks/useMediaQuery';

/**
 * 3D tilt that follows the pointer, with a moving glare. Children can use
 * `transform: translateZ(...)` for depth because the card is `preserve-3d`.
 * Falls back to a flat card on touch devices and for reduced motion.
 */
export default function TiltCard({ children, className = '', max = 9 }) {
  const reduce = useReducedMotion();
  const hoverable = useMediaQuery('(hover: hover) and (pointer: fine)');
  const enabled = hoverable && !reduce;

  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const rotateY = useSpring(useTransform(px, [0, 1], [-max, max]), { stiffness: 160, damping: 18 });
  const rotateX = useSpring(useTransform(py, [0, 1], [max, -max]), { stiffness: 160, damping: 18 });
  const glare = useMotionTemplate`radial-gradient(420px circle at ${useTransform(px, (v) => `${v * 100}%`)} ${useTransform(
    py,
    (v) => `${v * 100}%`,
  )}, rgb(255 255 255 / 0.12), transparent 60%)`;

  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width);
    py.set((e.clientY - r.top) / r.height);
  };
  const onLeave = () => {
    px.set(0.5);
    py.set(0.5);
  };

  if (!enabled) return <div className={className}>{children}</div>;

  return (
    <div style={{ perspective: 1100 }} className="h-full">
      <motion.div
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
        className={`relative h-full ${className}`}
      >
        {children}
        <motion.span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-[inherit]"
          style={{ background: glare }}
        />
      </motion.div>
    </div>
  );
}
