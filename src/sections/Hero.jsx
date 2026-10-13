import { lazy, useEffect, useRef, useState } from 'react';
import { cancelIdle, idle } from '../lib/idle';
import { loadGsap } from '../lib/gsap';
import { profile } from '../data/portfolio';
import { scrollToId } from '../lib/scroll';
import { markHeroReady } from '../lib/ready';
import { useTheme } from '../hooks/useTheme';
import useDeviceTier from '../hooks/useDeviceTier';
import useTyping from '../hooks/useTyping';
import Lazy3D from '../components/Lazy3D';
import Icon from '../components/Icon';
import Socials from '../components/Socials';

const HeroScene = lazy(() => import('../three/HeroScene'));

// Floating tech chips around the centre of the 3D scene (the sphere and orbit ring sit behind this box)
const floaters = [
  { label: 'React', cls: 'left-[2%] top-[16%]', delay: '0s' },
  { label: 'Node.js', cls: 'right-[0%] top-[30%]', delay: '1.2s' },
  { label: 'AI / ML', cls: 'left-[0%] bottom-[22%]', delay: '2.1s' },
  { label: 'PostgreSQL', cls: 'right-[4%] bottom-[10%]', delay: '0.6s' },
];

/**
 * Box that holds the hero's visual space. Desktop (lg+): an invisible 440px box the full-width 3D
 * scene is centred on. Phones/tablets: the box is the scene itself (about 40svh tall, above the text).
 */
function ChipField({ children }) {
  return (
    <div
      aria-hidden={children ? undefined : 'true'}
      className="relative h-[40svh] min-h-[250px] w-full max-w-[420px] sm:h-[400px] sm:w-[400px] lg:h-[440px] lg:w-[440px] lg:max-w-none"
    >
      {children}
      {floaters.map((f) => (
        <span
          key={f.label}
          aria-hidden="true"
          style={{ animationDelay: f.delay }}
          className={`glass absolute z-[1] animate-float rounded-xl max-lg:[-webkit-backdrop-filter:none] max-lg:[backdrop-filter:none] px-2 py-1 font-mono text-[10px] text-cyan sm:px-3 sm:py-1.5 sm:text-xs ${f.cls}`}
        >
          {f.label}
        </span>
      ))}
    </div>
  );
}

/** Static stand-in for the 3D scene (phones: shown first, and kept when WebGL / motion is unavailable). */
function StaticOrb({ faded }) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 grid place-items-center transition-opacity duration-700 ${faded ? 'opacity-0' : 'opacity-100'}`}
    >
      <div className="relative aspect-square h-[82%]">
        <div
          className="absolute inset-[17%] rounded-full"
          style={{
            background: 'radial-gradient(circle at 32% 28%, #93c5fd 0%, #2563eb 38%, #1e3a8a 78%, #0f172a 100%)',
            boxShadow: '0 0 90px 12px rgb(var(--brand) / 0.5)',
          }}
        />
        <div className="absolute inset-[3%] animate-spin-slow rounded-full border border-cyan/50" style={{ animationDuration: '24s' }} />
        <div
          className="absolute inset-[-6%] rounded-full border border-violet/60"
          style={{ transform: 'rotateX(72deg) rotateZ(-18deg)', animation: 'none' }}
        />
      </div>
    </div>
  );
}

/**
 * The cycling headline lives in its own component so each keystroke re-renders only this node,
 * not the whole hero. Screen readers get the full list once instead of every typed letter.
 */
function TypedRole({ still }) {
  const text = useTyping(profile.roles, { still });
  return (
    <p>
      <span className="sr-only">{profile.roles.join('. ')}</span>
      <span aria-hidden="true" className={still ? '' : 'cursor-caret'}>
        {text}
      </span>
    </p>
  );
}

export default function Hero() {
  const tier = useDeviceTier();
  const { theme } = useTheme();
  const content = useRef(null);
  const media = useRef(null);
  const sceneBox = useRef(null);
  const mobile = tier.narrow;
  const [enhance, setEnhance] = useState(false); // phones: start the WebGL scene once the page is interactive
  const [sceneReady, setSceneReady] = useState(false);
  const [glFailed, setGlFailed] = useState(false);

  // Scroll parallax via GSAP ScrollTrigger, fetched after the page is idle (not on the critical path).
  useEffect(() => {
    if (tier.reduce) return undefined;
    let ctx;
    let cancelled = false;
    const idleId = idle(
      () =>
        loadGsap().then(({ gsap }) => {
          if (cancelled) return;
          ctx = gsap.context(() => {
            gsap.to(content.current, {
              yPercent: -10,
              ease: 'none',
              scrollTrigger: { trigger: content.current, start: 'top 20%', end: 'bottom top', scrub: true },
            });
            gsap.to(media.current, {
              yPercent: 8,
              ease: 'none',
              scrollTrigger: { trigger: media.current, start: 'top 30%', end: 'bottom top', scrub: true },
            });
          });
        }),
      3000,
    );
    return () => {
      cancelled = true;
      cancelIdle(idleId);
      ctx?.revert();
    };
  }, [tier.reduce]);

  // Phones: the static orb paints first, so the loading screen never waits for WebGL.
  useEffect(() => {
    if (mobile) markHeroReady();
  }, [mobile]);

  // Phones: hold the Three.js scene back until the first touch/scroll/key (or 7 s), so first load stays fast.
  useEffect(() => {
    if (!mobile || tier.reduce) return undefined;
    const events = ['touchstart', 'pointerdown', 'scroll', 'keydown'];
    let timer;
    const go = () => {
      setEnhance(true);
      events.forEach((e) => window.removeEventListener(e, go));
      clearTimeout(timer);
    };
    events.forEach((e) => window.addEventListener(e, go, { passive: true, once: true }));
    timer = setTimeout(go, 7000);
    return () => {
      events.forEach((e) => window.removeEventListener(e, go));
      clearTimeout(timer);
    };
  }, [mobile, tier.reduce]);

  // Phones: subtle scroll parallax on the scene box (cheap transform, only while the hero is on screen)
  useEffect(() => {
    if (!mobile || tier.reduce) return undefined;
    let raf = 0;
    const update = () => {
      raf = 0;
      const y = window.scrollY;
      if (sceneBox.current && y < window.innerHeight * 1.2) sceneBox.current.style.transform = `translate3d(0, ${(y * 0.14).toFixed(1)}px, 0)`;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(raf);
    };
  }, [mobile, tier.reduce]);

  return (
    <section id="top" className="relative flex min-h-[100svh] items-center overflow-hidden pb-16 pt-28 lg:pt-24">
      {/* ambient background */}
      <div className="blob -left-32 top-10 h-80 w-80 bg-brand" aria-hidden="true" />
      <div className="blob -right-20 bottom-0 h-96 w-96 bg-violet" aria-hidden="true" />
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.35] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]"
        style={{
          backgroundImage:
            'linear-gradient(rgb(var(--line) / 0.07) 1px, transparent 1px), linear-gradient(90deg, rgb(var(--line) / 0.07) 1px, transparent 1px)',
          backgroundSize: '56px 56px',
        }}
      />

      {/* Desktop: full-width 3D scene (lazy-loaded after first paint). Phones get theirs inside the box below. */}
      {!mobile && (
        <Lazy3D
          Scene={HeroScene}
          tier={tier}
          light={theme === 'light'}
          onReady={markHeroReady}
          onSettled={markHeroReady}
          className="pointer-events-none absolute inset-0 z-0"
        />
      )}

      <div className="container-x relative z-10 grid items-center gap-12 lg:grid-cols-2 lg:gap-8">
        <div ref={content} className="order-2 text-center lg:order-1 lg:text-left">
          <div className="mb-6 flex justify-center lg:justify-start">
            <span className="glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 font-mono text-xs">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              {profile.badge}
            </span>
          </div>

          <p className="font-mono text-sm text-cyan">
            Hi, I&apos;m
          </p>
          <h1 className="mt-2 text-[clamp(2.25rem,11.5vw,3rem)] font-bold leading-[1.05] sm:text-6xl xl:text-7xl">
            <span className="gradient-text">{profile.name}</span>
          </h1>

          <div className="mt-5 min-h-[3.25rem] text-xl font-medium text-fg sm:min-h-[2rem] sm:text-2xl">
            <TypedRole still={tier.reduce} />
          </div>

          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-muted sm:text-lg lg:mx-0">
            {profile.intro}
          </p>

          <div className="mt-8 grid grid-cols-2 gap-3 sm:flex sm:flex-wrap sm:justify-center lg:justify-start">
            <button type="button" className="btn-primary max-sm:px-3" onClick={() => scrollToId('projects')}>
              View Projects
            </button>
            <a href={profile.resume} download={profile.resumeFileName} className="btn-ghost max-sm:px-3">
              <Icon name="download" className="h-4 w-4" /> Download Resume
            </a>
            <button type="button" className="btn-ghost max-sm:col-span-2" onClick={() => scrollToId('contact')}>
              Contact Me
            </button>
          </div>

          <div className="mt-8 flex justify-center lg:justify-start">
            <Socials />
          </div>
        </div>

        {/* wrapper = GSAP scroll-parallax target (desktop) */}
        <div ref={media} className="order-1 flex justify-center lg:order-2">
          <ChipField>
            {mobile && (
              <div ref={sceneBox} className="absolute inset-0 will-change-transform">
                {/* gradient orb paints first; the lighter 3D scene fades in over it when ready */}
                <StaticOrb faded={sceneReady && !glFailed} />
                {!tier.reduce && (
                  <Lazy3D
                    Scene={HeroScene}
                    tier={tier}
                    light={theme === 'light'}
                    enabled={enhance}
                    onReady={() => setSceneReady(true)}
                    onSettled={() => setGlFailed(true)}
                    className={`pointer-events-none absolute inset-0 transition-opacity duration-700 ${sceneReady ? 'opacity-100' : 'opacity-0'}`}
                  />
                )}
              </div>
            )}
          </ChipField>
        </div>
      </div>

      <button
        type="button"
        onClick={() => scrollToId('about')}
        className="absolute bottom-5 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em] text-muted transition hover:text-cyan lg:flex"
        aria-label="Scroll to About section"
      >
        Scroll
        <span className="block h-8 w-px animate-pulse bg-gradient-to-b from-cyan to-transparent" />
      </button>
    </section>
  );
}
