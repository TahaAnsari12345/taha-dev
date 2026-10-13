import { Suspense, useEffect, useRef } from 'react';
import { PLACEHOLDER_HEIGHT, SECTION_ORDER, mountUpTo, sectionComponents, useMountedIndex } from '../lib/sections';

/** Keeps a lightweight, same-id placeholder in the page until the visitor is about to reach it. */
export default function DeferredSection({ id }) {
  const mounted = useMountedIndex();
  const mine = SECTION_ORDER.indexOf(id);
  const ref = useRef(null);
  const show = mounted >= mine;

  useEffect(() => {
    if (show || !ref.current) return undefined;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && mountUpTo(id), { rootMargin: '700px 0px' });
    io.observe(ref.current);
    return () => io.disconnect();
  }, [show, id]);

  const placeholder = (
    <div ref={ref} id={id} aria-hidden="true" className="scroll-mt-[4.5rem]" style={{ minHeight: PLACEHOLDER_HEIGHT[id] }} />
  );
  if (!show) return placeholder;

  const Section = sectionComponents[id];
  return (
    <Suspense fallback={placeholder}>
      <Section />
    </Suspense>
  );
}
