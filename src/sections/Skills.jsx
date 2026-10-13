import { lazy, useEffect, useRef, useState } from 'react';
import { skillGroups } from '../data/portfolio';
import useDeviceTier from '../hooks/useDeviceTier';
import useNearViewport from '../hooks/useNearViewport';
import { isLowEnd } from '../lib/device';
import Icon from '../components/Icon';
import Lazy3D from '../components/Lazy3D';
import Reveal from '../components/Reveal';
import SectionHeading from '../components/SectionHeading';

const SkillsScene = lazy(() => import('../three/SkillsScene'));

/** Plain CSS sphere, shown only if the compact canvas has not drawn a frame in time. */
function StaticSphere() {
  return (
    <div className="pointer-events-none absolute inset-0 grid place-items-center" aria-hidden="true">
      <div
        className="h-32 w-32 rounded-full"
        style={{
          background: 'radial-gradient(circle at 35% 30%, #67e8f9 0%, #2563eb 48%, #1e1b4b 100%)',
          boxShadow: '0 0 60px rgb(37 99 235 / 0.55), 0 0 0 14px rgb(34 211 238 / 0.08)',
        }}
      />
    </div>
  );
}

/**
 * Phones/tablets: lighter cluster steered by touch-drag. Mounted only on narrow screens, so its state
 * (drag, first-frame, failure) starts fresh every time the viewport crosses 1024px.
 * Not rendered (cards only) for reduced motion, weak hardware or when WebGL fails.
 */
function CompactCluster({ tier }) {
  const [failed, setFailed] = useState(false);
  const [frameReady, setFrameReady] = useState(false);
  const [stalled, setStalled] = useState(false);
  const [boxRef, near] = useNearViewport({ once: true, margin: '300px' });
  // Touch-drag steering: x/y in -1..1 relative to the box, zeroed on release (eases back to idle spin)
  const drag = useRef({ x: 0, y: 0 });
  const dragging = useRef(false);

  // Safety net: no first frame 4 s after the box comes near the viewport -> show the static sphere
  useEffect(() => {
    if (!near || frameReady) return undefined;
    const t = setTimeout(() => setStalled(true), 4000);
    return () => clearTimeout(t);
  }, [near, frameReady]);

  const aim = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    drag.current.x = Math.max(-1, Math.min(1, ((e.clientX - r.left) / r.width) * 2 - 1));
    drag.current.y = Math.max(-1, Math.min(1, -(((e.clientY - r.top) / r.height) * 2 - 1)));
  };
  const dragStart = (e) => {
    dragging.current = true;
    aim(e);
  };
  const dragMove = (e) => {
    if (dragging.current) aim(e);
  };
  const dragEnd = () => {
    dragging.current = false;
    drag.current.x = 0;
    drag.current.y = 0;
  };

  if (failed) return null;
  return (
    <Reveal>
      <div
        ref={boxRef}
        className="glass relative mb-8 h-[320px] select-none overflow-hidden rounded-3xl"
        style={{ touchAction: 'pan-y' }}
        onPointerDown={dragStart}
        onPointerMove={dragMove}
        onPointerUp={dragEnd}
        onPointerCancel={dragEnd}
        onLostPointerCapture={dragEnd}
      >
        {stalled && !frameReady && <StaticSphere />}
        <Lazy3D
          Scene={SkillsScene}
          tier={tier}
          compact
          drag={drag}
          onReady={() => setFrameReady(true)}
          onSettled={() => setFailed(true)}
          className="absolute inset-0"
        />
        <p className="pointer-events-none absolute bottom-3 left-0 right-0 text-center font-mono text-[11px] uppercase tracking-[0.25em] text-muted">
          Drag to steer the cluster
        </p>
      </div>
    </Reveal>
  );
}

export default function Skills() {
  const tier = useDeviceTier();
  // `tier.low` is always true on narrow screens, so check the hardware signal itself
  const lowEnd = Boolean(isLowEnd());

  return (
    <section id="skills" className="section">
      <div className="blob -left-24 top-40 h-80 w-80 bg-violet" aria-hidden="true" />
      <div className="container-x">
        <SectionHeading eyebrow="02 / Skills" title="A toolkit that spans" accent="the whole stack">
          From pixel-level UI to databases, auth, payments, deployment and the AI layer on top.
        </SectionHeading>

        {/* Desktop: full cluster steered by the cursor. Narrow screens get a compact touch-drag version below. */}
        {!tier.narrow && (
          <Reveal>
            <div className="glass relative mb-10 h-[340px] overflow-hidden rounded-3xl sm:h-[440px]">
              <Lazy3D Scene={SkillsScene} tier={tier} className="absolute inset-0" />
              <p className="pointer-events-none absolute bottom-3 left-0 right-0 text-center font-mono text-[11px] uppercase tracking-[0.25em] text-muted">
                Move your cursor to steer the cluster
              </p>
            </div>
          </Reveal>
        )}
        {tier.narrow && !tier.reduce && !lowEnd && <CompactCluster key="compact" tier={tier} />}

        <ul className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3">
          {skillGroups.map((g, i) => (
            <Reveal key={g.title} as="li" delay={(i % 3) * 0.08}>
              <article className="glass group h-full rounded-2xl p-4 transition sm:p-6 duration-300 hover:-translate-y-1 hover:border-cyan/40 hover:shadow-glow-cyan">
                <div className="mb-3 flex items-center gap-2 sm:mb-4 sm:gap-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand/15 sm:h-10 sm:w-10 text-cyan transition group-hover:bg-brand group-hover:text-white">
                    <Icon name={g.icon} />
                  </span>
                  <h3 className="text-base font-semibold leading-tight sm:text-lg">{g.title}</h3>
                </div>
                <ul className="flex flex-wrap gap-1.5 sm:gap-2">
                  {g.items.map((s) => (
                    <li key={s} className="chip max-sm:!px-2 max-sm:!py-0.5 max-sm:!text-[11px]">
                      {s}
                    </li>
                  ))}
                </ul>
              </article>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
