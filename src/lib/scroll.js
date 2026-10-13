import { ensureMounted } from './sections';

let lenis = null;

export const setLenis = (instance) => {
  lenis = instance;
};

/** Smooth-scroll to a section id (falls back to native scrolling). Mounts deferred sections first. */
export async function scrollToId(id) {
  if (id !== 'top') await ensureMounted(id);
  const el = id === 'top' ? document.body : document.getElementById(id);
  if (!el) return;
  if (lenis) {
    if (id === 'top') lenis.scrollTo(0, { duration: 1.4 });
    else lenis.scrollTo(el, { offset: -64, duration: 1.4 });
  } else {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  if (id !== 'top') history.replaceState(null, '', `#${id}`);
}

/** Freeze / release page scrolling (used while the full-screen mobile menu is open). */
export function lockScroll(locked) {
  document.documentElement.style.overflow = locked ? 'hidden' : '';
  if (lenis) (locked ? lenis.stop() : lenis.start());
}
