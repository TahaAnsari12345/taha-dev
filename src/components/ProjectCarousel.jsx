import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import { isLowEnd } from '../lib/device';
import FeaturedProject from './FeaturedProject';
import ProjectCard from './ProjectCard';

const lowEnd = Boolean(isLowEnd());

/**
 * Phones/tablets: horizontal scroll-snap carousel. One card is mostly visible with the next one
 * peeking; side cards are scaled and rotated a little for depth (skipped on weak devices and for
 * reduced motion). The featured project (Shopzi) is always the first slide.
 */
export default function ProjectCarousel({ projects }) {
  const scroller = useRef(null);
  const slides = useRef([]);
  const [index, setIndex] = useState(0);
  const reduce = useReducedMotion();
  const depth = !reduce && !lowEnd;

  useEffect(() => {
    const el = scroller.current;
    let raf = 0;
    const update = () => {
      raf = 0;
      const center = el.scrollLeft + el.clientWidth / 2;
      let best = 0;
      let bestDist = Infinity;
      slides.current.forEach((s, i) => {
        if (!s) return;
        const mid = s.offsetLeft + s.offsetWidth / 2;
        const dist = Math.abs(mid - center);
        if (dist < bestDist) {
          bestDist = dist;
          best = i;
        }
        if (depth) {
          const d = (mid - center) / s.offsetWidth; // -1 (left neighbour) .. 0 (centred) .. 1 (right neighbour)
          const a = Math.min(Math.abs(d), 1);
          s.firstElementChild.style.transform = `perspective(900px) rotateY(${(-d * 10).toFixed(2)}deg) scale(${(1 - a * 0.05).toFixed(3)})`;
          s.firstElementChild.style.opacity = String((1 - a * 0.3).toFixed(2));
        }
      });
      setIndex(best);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    el.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [depth]);

  const goTo = (i) => {
    const el = scroller.current;
    const s = slides.current[i];
    if (!el || !s) return;
    el.scrollTo({ left: s.offsetLeft - (el.clientWidth - s.offsetWidth) / 2, behavior: reduce ? 'auto' : 'smooth' });
  };

  return (
    <div>
      <ul
        ref={scroller}
        role="region"
        aria-roledescription="carousel"
        aria-label="Projects"
        tabIndex={0}
        className="relative -mx-5 flex snap-x snap-mandatory items-start gap-3 overflow-x-auto overscroll-x-contain pb-4 pt-1 [-ms-overflow-style:none] [scrollbar-width:none] sm:-mx-8 [&::-webkit-scrollbar]:hidden"
        style={{
          paddingLeft: 'max(12vw, calc((100vw - 420px) / 2))',
          paddingRight: 'max(12vw, calc((100vw - 420px) / 2))',
        }}
      >
        {projects.map((p, i) => (
          <li
            key={p.id}
            ref={(node) => {
              slides.current[i] = node;
            }}
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${projects.length}: ${p.title}`}
            className="w-[76vw] max-w-[420px] shrink-0 snap-center"
          >
            <div className="origin-center will-change-transform">
              {p.featured ? <FeaturedProject project={p} compact /> : <ProjectCard project={p} />}
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-2 flex justify-center" role="group" aria-label="Choose project">
        {projects.map((p, i) => (
          <button
            key={p.id}
            type="button"
            onClick={() => goTo(i)}
            aria-label={`Show ${p.title}`}
            aria-current={i === index ? 'true' : undefined}
            className="grid h-11 w-8 place-items-center"
          >
            <span
              className={`block h-2 rounded-full transition-all duration-300 ${
                i === index ? 'w-6 bg-cyan shadow-[0_0_10px_rgb(var(--cyan)/0.8)]' : 'w-2 bg-muted/40'
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
