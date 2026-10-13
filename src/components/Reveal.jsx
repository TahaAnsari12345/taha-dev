import { motion, useReducedMotion } from 'framer-motion';
import { isLowEnd, useNarrow } from '../lib/device';

const lowEnd = Boolean(isLowEnd());

/**
 * Fades/slides children in once when they scroll into view.
 * On phones/tablets (and not on weak hardware) cards also tilt up into place with a little
 * rotateX / scale for CSS-only 3D depth. Desktop keeps the original fade + rise.
 */
export default function Reveal({ children, delay = 0, y = 28, className = '', as = 'div' }) {
  const reduce = useReducedMotion();
  const depth = useNarrow() && !lowEnd && !reduce;
  const Tag = motion[as] ?? motion.div;
  return (
    <Tag
      className={className}
      initial={
        reduce
          ? false
          : depth
            ? { opacity: 0, y, rotateX: 14, scale: 0.97, transformPerspective: 900 }
            : { opacity: 0, y }
      }
      whileInView={depth ? { opacity: 1, y: 0, rotateX: 0, scale: 1 } : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-70px' }}
      transition={{ duration: 0.75, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </Tag>
  );
}
