import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useScroll, useSpring } from 'framer-motion';
import { nav, profile } from '../data/portfolio';
import { lockScroll, scrollToId } from '../lib/scroll';
import { useTheme } from '../hooks/useTheme';
import Icon from './Icon';

/**
 * Scroll-spy: the active section is the last one whose top has passed 40% of the viewport.
 * Sections are looked up on every scroll because most of them are lazy-loaded and don't exist
 * in the DOM yet when the navbar mounts.
 */
function useActiveSection(ids) {
  const [active, setActive] = useState('');
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const line = window.innerHeight * 0.4;
      let current = '';
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= line) current = id;
      }
      setActive(current);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [ids]);
  return active;
}

const ids = nav.map((n) => n.id);

export default function Navbar() {
  const { theme, toggle } = useTheme();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const active = useActiveSection(ids);
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.3 });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    const wide = window.matchMedia('(min-width: 1024px)');
    const onWide = () => wide.matches && setOpen(false); // menu is phone/tablet only
    window.addEventListener('keydown', onKey);
    wide.addEventListener('change', onWide);
    lockScroll(true);
    return () => {
      window.removeEventListener('keydown', onKey);
      wide.removeEventListener('change', onWide);
      lockScroll(false);
    };
  }, [open]);

  const go = (id) => (e) => {
    e.preventDefault();
    setOpen(false);
    lockScroll(false); // release first so the smooth scroll isn't ignored
    scrollToId(id);
  };

  return (
    <header
      className="fixed inset-x-0 top-0 z-50 pl-[max(0.75rem,env(safe-area-inset-left))] pr-[max(0.75rem,env(safe-area-inset-right))] pt-3 sm:px-6"
      style={{ paddingTop: 'max(0.75rem, env(safe-area-inset-top))' }}
    >
      <nav
        aria-label="Primary"
        className={`glass relative z-10 mx-auto flex max-w-6xl items-center justify-between rounded-2xl px-4 py-2.5 transition-all duration-300 sm:px-5 ${
          scrolled ? 'shadow-glow' : ''
        }`}
      >
        <a href="#top" onClick={go('top')} className="flex items-center gap-2 font-display text-lg font-bold" aria-label="TA Taha Ansari, back to top">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brand to-violet text-sm text-white">
            {profile.initials}
          </span>
          <span className="hidden sm:inline">Taha Ansari</span>
        </a>

        <ul className="hidden items-center gap-1 lg:flex">
          {nav.map((n) => (
            <li key={n.id}>
              <a
                href={`#${n.id}`}
                onClick={go(n.id)}
                aria-current={active === n.id ? 'true' : undefined}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                  active === n.id ? 'bg-brand/15 text-cyan' : 'text-muted hover:text-fg'
                }`}
              >
                {n.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggle}
            className="grid h-11 w-11 place-items-center rounded-xl text-muted transition hover:bg-brand/15 hover:text-fg lg:h-10 lg:w-10"
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
          >
            <Icon name={theme === 'dark' ? 'sun' : 'moon'} />
          </button>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="grid h-11 w-11 place-items-center rounded-xl text-muted transition hover:bg-brand/15 hover:text-fg lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? 'Close menu' : 'Open menu'}
          >
            <Icon name={open ? 'close' : 'menu'} />
          </button>
        </div>

        <motion.span
          aria-hidden="true"
          className="absolute -bottom-px left-4 right-4 h-px origin-left bg-gradient-to-r from-brand via-cyan to-violet"
          style={{ scaleX: progress }}
        />
      </nav>

      {/* full-screen glass menu (phones / tablets) */}
      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Site menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
            className="glass fixed inset-0 z-0 flex flex-col justify-center overflow-y-auto px-8 lg:hidden"
            style={{
              background: 'rgb(var(--bg) / 0.94)',
              paddingTop: 'calc(env(safe-area-inset-top) + 5rem)',
              paddingBottom: 'calc(env(safe-area-inset-bottom) + 2rem)',
            }}
          >
            <ul className="mx-auto w-full max-w-sm space-y-1">
              {nav.map((n, i) => (
                <motion.li
                  key={n.id}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.35, delay: 0.04 * i, ease: [0.22, 1, 0.36, 1] }}
                >
                  <a
                    href={`#${n.id}`}
                    onClick={go(n.id)}
                    aria-current={active === n.id ? 'true' : undefined}
                    className={`flex min-h-[52px] items-center gap-4 rounded-2xl px-4 font-display text-3xl font-semibold transition ${
                      active === n.id ? 'bg-brand/15 text-cyan' : 'text-fg active:bg-brand/10'
                    }`}
                  >
                    <span className="font-mono text-xs text-muted">0{i + 1}</span>
                    {n.label}
                  </a>
                </motion.li>
              ))}
            </ul>
            <button
              type="button"
              onClick={toggle}
              className="btn-ghost mx-auto mt-8 w-full max-w-sm"
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
            >
              <Icon name={theme === 'dark' ? 'sun' : 'moon'} className="h-4 w-4" />
              {theme === 'dark' ? 'Light theme' : 'Dark theme'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
