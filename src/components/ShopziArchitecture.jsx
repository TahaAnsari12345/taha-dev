import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import { motion, useReducedMotion, useSpring } from 'framer-motion';
import useMediaQuery from '../hooks/useMediaQuery';
import Icon from './Icon';

/**
 * Layered Shopzi architecture diagram. Content (nodes, connections, checkout path) comes from
 * `shopzi.architecture` in src/data/portfolio.js.
 *  - Desktop: horizontal layers on a 3D-tilted plane (nodes float above it), glowing connectors with
 *    particles; the tilt eases toward flat and follows the pointer on hover.
 *  - Phones / reduced motion: vertical stack, no tilt, subtle line animation only.
 * Animations pause while the diagram is off-screen.
 */
const W = 1000;
const H = 600;
const BASE_X = 7; // resting tilt (deg)
const BASE_Y = -6;
const TOP_Y = 52; // y of the "order confirmed" return line

const COLORS = {
  frontend: 'var(--brand)',
  backend: 'var(--cyan)',
  database: 'var(--violet)',
  payment: '52 211 153',
  storage: '251 191 36',
};
const rgb = (kind, a = 1) => `rgb(${COLORS[kind]} / ${a})`;
const fs = (px, min) => `max(${min}px, calc(var(--u, 1) * ${px}px))`;
const u = (px) => `calc(var(--u, 1) * ${px}px)`;

const anchor = (n, side) =>
  ({
    left: [n.x - n.w / 2, n.y],
    right: [n.x + n.w / 2, n.y],
    top: [n.x, n.y - n.h / 2],
    bottom: [n.x, n.y + n.h / 2],
  })[side];

/** Path + midpoint for a connection between two nodes (smooth curve, or a rounded run over the top). */
function route(a, b, { fromSide, toSide, route: mode }) {
  if (mode === 'top') {
    const [x1, y1] = anchor(a, 'top');
    const [x2, y2] = anchor(b, 'top');
    const r = 16;
    return {
      d: `M${x1} ${y1} V${TOP_Y + r} Q${x1} ${TOP_Y} ${x1 - r} ${TOP_Y} H${x2 + r} Q${x2} ${TOP_Y} ${x2} ${TOP_Y + r} V${y2}`,
      mid: { x: (x1 + x2) / 2, y: TOP_Y },
    };
  }
  const [x1, y1] = anchor(a, fromSide);
  const [x2, y2] = anchor(b, toSide);
  const horizontal = fromSide === 'left' || fromSide === 'right';
  const c = horizontal ? (x2 - x1) / 2 : (y2 - y1) / 2;
  const d = horizontal
    ? `M${x1} ${y1} C${x1 + c} ${y1}, ${x2 - c} ${y2}, ${x2} ${y2}`
    : `M${x1} ${y1} C${x1} ${y1 + c}, ${x2} ${y2 - c}, ${x2} ${y2}`;
  return { d, mid: { x: (x1 + x2) / 2, y: (y1 + y2) / 2 } };
}

function NodeBody({ n }) {
  return (
    <div className="flex h-full flex-col" style={{ gap: u(4) }}>
      <div className="flex items-center" style={{ gap: u(8) }}>
        <span
          className="grid shrink-0 place-items-center"
          style={{ width: fs(26, 20), height: fs(26, 20), borderRadius: u(8), background: rgb(n.kind, 0.2), color: rgb(n.kind) }}
        >
          <Icon name={n.icon} className="h-3/5 w-3/5" />
        </span>
        <h4 className="font-display font-semibold leading-tight" style={{ fontSize: fs(14.5, 11) }}>
          {n.title}
        </h4>
      </div>
      <p className="leading-snug text-muted" style={{ fontSize: fs(11.5, 9.5) }}>
        {n.caption}
      </p>
    </div>
  );
}

const cardStyle = (n) => ({
  padding: u(10),
  borderRadius: u(16),
  borderColor: rgb(n.kind, 0.55),
  background: `linear-gradient(135deg, ${rgb(n.kind, 0.16)}, transparent 62%), rgb(var(--glass) / var(--glass-alpha))`,
  boxShadow: `0 0 ${u(26)} -${u(6)} ${rgb(n.kind, 0.5)}, inset 0 1px 0 rgb(255 255 255 / 0.07)`,
});

/** One animated connector: soft glow, solid line, flowing dashes, and particles travelling along it. */
function Line({ d, color, bright, active, particles, i }) {
  const dur = bright ? 2.6 : 3.4 + (i % 3) * 0.5;
  const ink = bright ? 'rgb(var(--fg) / 0.9)' : color;
  return (
    <motion.g
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, delay: 0.5 + i * 0.1 }}
    >
      <path d={d} fill="none" stroke={color} strokeWidth={bright ? 11 : 7} strokeOpacity={bright ? 0.3 : 0.16} strokeLinecap="round" />
      <path d={d} fill="none" stroke={color} strokeWidth={bright ? 2.8 : 1.6} strokeOpacity={bright ? 1 : 0.75} strokeLinecap="round" />
      <path
        d={d}
        className="flow-line"
        fill="none"
        stroke={ink}
        strokeWidth={bright ? 1.8 : 1.1}
        strokeOpacity={bright ? 0.85 : 0.55}
        style={{ animationPlayState: active ? 'running' : 'paused' }}
      />
      {particles &&
        [0, 1].map((k) => (
          <circle key={k} r={bright ? 4.5 : 3} fill={ink} style={{ filter: `drop-shadow(0 0 5px ${color})` }}>
            <animateMotion dur={`${dur}s`} begin={`${-(k * dur) / 2}s`} repeatCount="indefinite" path={d} />
          </circle>
        ))}
    </motion.g>
  );
}

function Pill({ x, y, n, label, tone = 'cyan' }) {
  return (
    <div
      className="absolute flex items-center whitespace-nowrap rounded-full border font-mono"
      style={{
        left: `${x / 10}%`,
        top: `${y / 6}%`,
        transform: 'translate(-50%, -50%) translateZ(64px)',
        gap: u(5),
        padding: `${u(2.5)} ${u(8)} ${u(2.5)} ${u(3)}`,
        fontSize: fs(10.5, 9),
        borderColor: `rgb(var(--${tone}) / 0.7)`,
        background: 'rgb(var(--bg) / 0.88)',
        boxShadow: `0 0 ${u(14)} rgb(var(--${tone}) / 0.4)`,
      }}
    >
      {n && (
        <span
          className="grid place-items-center rounded-full font-bold"
          style={{ width: fs(16, 14), height: fs(16, 14), background: `rgb(var(--${tone}))`, color: 'rgb(var(--bg))' }}
        >
          {n}
        </span>
      )}
      <span className="text-fg">{label}</span>
    </div>
  );
}

function Horizontal({ data }) {
  const wrap = useRef(null);
  const box = useRef(null);
  const svg = useRef(null);
  const [active, setActive] = useState(false);
  const rx = useSpring(BASE_X, { stiffness: 110, damping: 18 });
  const ry = useSpring(BASE_Y, { stiffness: 110, damping: 18 });

  const { edges, legs } = useMemo(() => {
    const byId = Object.fromEntries(data.nodes.map((n) => [n.id, n]));
    return {
      edges: data.edges.map((e) => ({ ...e, kind: byId[e.to].kind, ...route(byId[e.from], byId[e.to], e) })),
      legs: data.checkout.legs.map((l) => ({ ...l, ...route(byId[l.from], byId[l.to], l) })),
    };
  }, [data]);

  // pause line/particle animation while off-screen
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setActive(e.isIntersecting), { threshold: 0.1 });
    io.observe(wrap.current);
    return () => io.disconnect();
  }, []);
  useEffect(() => {
    const el = svg.current;
    if (!el?.pauseAnimations) return;
    if (active) el.unpauseAnimations();
    else el.pauseAnimations();
  }, [active]);

  // text and padding scale with the rendered width (1 unit = 1px at 1000px wide)
  useEffect(() => {
    const ro = new ResizeObserver(([e]) => box.current?.style.setProperty('--u', String(e.contentRect.width / W)));
    ro.observe(box.current);
    return () => ro.disconnect();
  }, []);

  const onMove = (e) => {
    const r = wrap.current.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    ry.set(px * 9); // near-flat while hovering, leaning slightly toward the pointer
    rx.set(-py * 7);
  };
  const onLeave = () => {
    rx.set(BASE_X);
    ry.set(BASE_Y);
  };

  return (
    <div ref={wrap} onPointerMove={onMove} onPointerLeave={onLeave} className="relative mx-auto w-full max-w-[1000px]" style={{ perspective: 1400 }}>
      <motion.div style={{ rotateX: rx, rotateY: ry, transformStyle: 'preserve-3d' }}>
        <div ref={box} className="relative w-full" style={{ aspectRatio: `${W} / ${H}`, transformStyle: 'preserve-3d' }}>
          {/* layer bands */}
          {data.layers.map((l) => (
            <div
              key={l.id}
              aria-hidden="true"
              className="absolute rounded-3xl border"
              style={{
                left: `${l.x / 10}%`,
                width: `${l.w / 10}%`,
                top: '2%',
                bottom: '2%',
                borderColor: 'rgb(var(--line) / 0.16)',
                background: 'rgb(var(--brand) / 0.04)',
              }}
            >
              <span
                className="absolute font-mono uppercase text-muted"
                style={{ left: u(16), top: u(10), fontSize: fs(11, 9), letterSpacing: '0.25em' }}
              >
                {l.label}
              </span>
            </div>
          ))}

          {/* connectors, slightly above the plane */}
          <div className="pointer-events-none absolute inset-0" style={{ transform: 'translateZ(14px)' }}>
            <svg ref={svg} viewBox={`0 0 ${W} ${H}`} className="h-full w-full overflow-visible" aria-hidden="true">
              {edges.map((e, i) => (
                <Line key={`${e.from}-${e.to}`} d={e.d} color={rgb(e.kind)} active={active} particles i={i} />
              ))}
              {legs.map((l, i) => (
                <Line key={`co-${i}`} d={l.d} color="rgb(var(--cyan))" bright active={active} particles i={edges.length + i} />
              ))}
            </svg>
          </div>

          {/* nodes float above the connectors */}
          {data.nodes.map((n, i) => (
            <motion.div
              key={n.id}
              className="glass absolute"
              style={{ left: `${(n.x - n.w / 2) / 10}%`, top: `${(n.y - n.h / 2) / 6}%`, width: `${n.w / 10}%`, height: `${n.h / 6}%`, z: 40, ...cardStyle(n) }}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.55, delay: i * 0.08 }}
            >
              <NodeBody n={n} />
            </motion.div>
          ))}

          {/* checkout step tags + confirmation label */}
          {data.checkout.tags.map((t) => {
            const { mid } = legs[t.leg];
            return <Pill key={t.n} x={mid.x} y={mid.y + (t.dy ?? 0)} n={t.n} label={t.label} />;
          })}
          <Pill x={legs[legs.length - 1].mid.x + 130} y={TOP_Y} label={`✓ ${data.checkout.returnLabel}`} />
        </div>
      </motion.div>
    </div>
  );
}

function FlowDown({ color }) {
  return (
    <svg width="2" height="30" viewBox="0 0 2 30" className="mx-auto block overflow-visible" aria-hidden="true">
      <line x1="1" y1="0" x2="1" y2="30" stroke={color} strokeWidth="2" strokeOpacity="0.5" className="flow-line" />
    </svg>
  );
}

function Stacked({ data }) {
  const steps = data.checkout.tags;
  return (
    <div className="mx-auto max-w-xl" style={{ '--u': 1 }}>
      {data.layers.map((layer, i) => {
        const nodes = data.nodes.filter((n) => n.layer === layer.id);
        return (
          <Fragment key={layer.id}>
            {i > 0 && <FlowDown color="rgb(var(--cyan))" />}
            <section className="rounded-2xl border p-3" style={{ borderColor: 'rgb(var(--line) / 0.16)', background: 'rgb(var(--brand) / 0.04)' }}>
              <h4 className="mb-3 font-mono text-[10px] uppercase tracking-[0.25em] text-muted">{layer.label}</h4>
              <ul className="grid gap-3 sm:grid-cols-2">
                {nodes.map((n, k) => (
                  <li
                    key={n.id}
                    className={`glass ${nodes.length % 2 && k === nodes.length - 1 ? 'sm:col-span-2' : ''}`}
                    style={cardStyle(n)}
                  >
                    <NodeBody n={n} />
                  </li>
                ))}
              </ul>
            </section>
          </Fragment>
        );
      })}

      <div className="mt-4 rounded-2xl border p-3" style={{ borderColor: 'rgb(var(--cyan) / 0.5)', background: 'rgb(var(--cyan) / 0.06)' }}>
        <h4 className="mb-2 font-mono text-[10px] uppercase tracking-[0.25em] text-cyan">Checkout path</h4>
        <ol className="flex flex-wrap items-center gap-x-2 gap-y-2 font-mono text-xs">
          {steps.map((t) => (
            <Fragment key={t.n}>
              <li className="flex items-center gap-1.5 rounded-full border border-cyan/60 px-2 py-0.5">
                <span className="grid h-4 w-4 place-items-center rounded-full bg-cyan text-[10px] font-bold text-bg">{t.n}</span>
                {t.label}
              </li>
              <span aria-hidden="true" className="text-cyan">
                →
              </span>
            </Fragment>
          ))}
          <li className="rounded-full border border-cyan/60 px-2 py-0.5">✓ {data.checkout.returnLabel}</li>
        </ol>
      </div>
    </div>
  );
}

function Legend({ items }) {
  return (
    <ul className="mt-8 flex flex-wrap justify-center gap-x-5 gap-y-2 font-mono text-[11px] text-muted" aria-label="Legend">
      {items.map((l) => (
        <li key={l.kind} className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: rgb(l.kind), boxShadow: `0 0 8px ${rgb(l.kind, 0.8)}` }} />
          {l.label}
        </li>
      ))}
      <li className="flex items-center gap-2">
        <span className="h-0.5 w-6 rounded-full bg-cyan" style={{ boxShadow: '0 0 8px rgb(var(--cyan))' }} />
        Checkout path
      </li>
    </ul>
  );
}

export default function ShopziArchitecture({ data }) {
  const reduce = useReducedMotion();
  const desktop = useMediaQuery('(min-width: 1024px)');
  const label =
    'Shopzi architecture: buyers and sellers use a React app on Vercel. It talks to an Express API on Render, which uses Clerk for authentication and roles, PostgreSQL on Neon for data, Stripe Checkout for payments and Cloudinary for images. Checkout: cart, stock check, payment, then order confirmed back in the app.';
  return (
    <figure aria-label={label}>
      {desktop && !reduce ? <Horizontal data={data} /> : <Stacked data={data} />}
      <Legend items={data.legend} />
    </figure>
  );
}
