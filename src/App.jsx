import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import Lenis from 'lenis';
import { ThemeProvider } from './hooks/useTheme';
import { ToastProvider } from './components/Toast';
import { setLenis, scrollToId } from './lib/scroll';
import { SECTION_ORDER } from './lib/sections';
import { cancelIdle, idle } from './lib/idle';
import { loadGsap } from './lib/gsap';
import Loader from './components/Loader';
import CursorGlow from './components/CursorGlow';
import DeferredSection from './components/DeferredSection';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Hero from './sections/Hero';
import About from './sections/About';

function useSmoothScroll() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const lenis = new Lenis({ duration: 1.15, smoothWheel: true });
    setLenis(lenis);

    let raf = requestAnimationFrame(function loop(time) {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    });

    // Keep GSAP ScrollTrigger in sync with Lenis once GSAP has been fetched (after idle).
    let off;
    let cancelled = false;
    const idleId = idle(
      () =>
        loadGsap().then(({ ScrollTrigger }) => {
          if (!cancelled) off = lenis.on('scroll', ScrollTrigger.update);
        }),
      3000,
    );

    return () => {
      cancelled = true;
      cancelIdle(idleId);
      cancelAnimationFrame(raf);
      off?.();
      lenis.destroy();
      setLenis(null);
    };
  }, []);
}

export default function App() {
  const [loading, setLoading] = useState(true);
  const onDone = useCallback(() => setLoading(false), []);
  useSmoothScroll();

  // Jump to a deep-linked section (e.g. /#projects) once the intro finishes.
  useEffect(() => {
    if (loading || !window.location.hash) return;
    const id = window.location.hash.slice(1);
    if (id) scrollToId(id);
  }, [loading]);

  return (
    <ThemeProvider>
      <ToastProvider>
        <div className="grain">
          <a
            href="#main"
            className="sr-only z-[110] rounded-lg bg-brand px-4 py-2 text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
          >
            Skip to content
          </a>
          <AnimatePresence>{loading && <Loader onDone={onDone} />}</AnimatePresence>
          <CursorGlow />
          <Navbar />
          <main id="main" tabIndex={-1} className="outline-none">
            <Hero />
            <About />
            {SECTION_ORDER.map((id) => (
              <DeferredSection key={id} id={id} />
            ))}
          </main>
          <Footer />
        </div>
      </ToastProvider>
    </ThemeProvider>
  );
}
