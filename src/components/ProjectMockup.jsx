import { useId } from 'react';

/**
 * Stylised "floating screen" placeholder per project kind (pure SVG, themed by CSS variables).
 * To use a real screenshot instead, set `image` on the project in src/data/portfolio.js.
 */
const panel = 'rgb(var(--surface))';
const line = 'rgb(var(--line) / 0.22)';
const faint = 'rgb(var(--line) / 0.12)';

function Bars({ x, y, w, rows, gap = 14, h = 7, color }) {
  return rows.map((frac, i) => (
    <rect key={i} x={x} y={y + i * gap} width={w * frac} height={h} rx={h / 2} fill={color} opacity={i === 0 ? 0.9 : 0.35} />
  ));
}

const scenes = {
  crm: (a) => (
    <>
      <rect x="12" y="38" width="64" height="190" rx="8" fill={panel} stroke={line} />
      <Bars x={22} y={52} w={44} rows={[1, 0.8, 0.9, 0.7, 0.85]} gap={18} h={8} color={a} />
      {['New', 'Follow-up', 'Interview', 'Joined'].map((t, i) => (
        <g key={t} transform={`translate(${88 + i * 76}, 38)`}>
          <rect width="68" height="190" rx="8" fill={faint} />
          <rect x="8" y="8" width="38" height="6" rx="3" fill={a} opacity="0.8" />
          {[0, 1, 2].slice(0, 3 - (i % 2)).map((k) => (
            <g key={k}>
              <rect x="6" y={26 + k * 52} width="56" height="44" rx="6" fill={panel} stroke={line} />
              <rect x="12" y={33 + k * 52} width="34" height="5" rx="2.5" fill={a} opacity="0.6" />
              <rect x="12" y={45 + k * 52} width="42" height="4" rx="2" fill="rgb(var(--muted))" opacity="0.4" />
              <circle cx="52" cy={36 + k * 52} r="3" fill={i === 3 ? '#34d399' : '#fbbf24'} />
            </g>
          ))}
        </g>
      ))}
    </>
  ),
  shop: (a) => (
    <>
      <rect x="12" y="38" width="376" height="28" rx="8" fill={panel} stroke={line} />
      <rect x="22" y="48" width="90" height="8" rx="4" fill={a} opacity="0.8" />
      <rect x="330" y="46" width="48" height="12" rx="6" fill={a} />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <g key={i} transform={`translate(${12 + (i % 3) * 126}, ${78 + Math.floor(i / 3) * 78})`}>
          <rect width="118" height="70" rx="8" fill={panel} stroke={line} />
          <rect x="8" y="8" width="102" height="32" rx="6" fill={a} opacity={0.15 + (i % 3) * 0.08} />
          <rect x="8" y="48" width="56" height="5" rx="2.5" fill="rgb(var(--fg))" opacity="0.5" />
          <rect x="8" y="58" width="30" height="5" rx="2.5" fill={a} opacity="0.8" />
        </g>
      ))}
    </>
  ),
  ai: (a) => (
    <>
      <rect x="12" y="38" width="376" height="190" rx="10" fill={panel} stroke={line} />
      <rect x="28" y="54" width="170" height="34" rx="12" fill={faint} />
      <Bars x={40} y={64} w={140} rows={[1, 0.6]} gap={10} h={5} color="rgb(var(--muted))" />
      <rect x="170" y="100" width="200" height="56" rx="12" fill={a} opacity="0.25" stroke={a} />
      <Bars x={184} y={114} w={170} rows={[1, 0.85, 0.5]} gap={11} h={5} color={a} />
      <rect x="28" y="168" width="250" height="38" rx="12" fill={faint} />
      <Bars x={40} y={180} w={200} rows={[1, 0.7]} gap={10} h={5} color="rgb(var(--muted))" />
      <path d="M352 190 l4 -10 l4 10 l10 4 l-10 4 l-4 10 l-4 -10 l-10 -4z" fill={a} />
    </>
  ),
  kanban: (a) => (
    <>
      {['To do', 'In progress', 'Done'].map((t, i) => (
        <g key={t} transform={`translate(${12 + i * 126}, 38)`}>
          <rect width="118" height="190" rx="8" fill={faint} />
          <rect x="10" y="10" width="46" height="6" rx="3" fill={a} opacity={0.5 + i * 0.25} />
          {[0, 1, 2].slice(0, 3 - (i === 1 ? 1 : 0) - (i === 2 ? 0 : 0)).map((k) => (
            <g key={k}>
              <rect x="8" y={28 + k * 52} width="102" height="44" rx="6" fill={panel} stroke={line} />
              <rect x="16" y={36 + k * 52} width="62" height="5" rx="2.5" fill="rgb(var(--fg))" opacity="0.55" />
              <rect x="16" y={48 + k * 52} width="40" height="4" rx="2" fill="rgb(var(--muted))" opacity="0.45" />
              <circle cx="98" cy={60 + k * 52} r="5" fill={a} opacity="0.7" />
            </g>
          ))}
        </g>
      ))}
    </>
  ),
  vision: (a) => (
    <>
      <rect x="12" y="38" width="376" height="190" rx="10" fill="rgb(var(--bg))" stroke={line} />
      <rect x="40" y="70" width="110" height="120" rx="6" fill="none" stroke={a} strokeWidth="2" strokeDasharray="6 4" />
      <rect x="40" y="56" width="62" height="14" rx="3" fill={a} />
      <rect x="190" y="104" width="150" height="86" rx="6" fill="none" stroke="#34d399" strokeWidth="2" strokeDasharray="6 4" />
      <rect x="190" y="90" width="48" height="14" rx="3" fill="#34d399" />
      <path d="M70 160 q20 -50 50 -14 t30 24" fill="none" stroke={a} strokeOpacity="0.5" strokeWidth="3" />
      <g transform="translate(282 58)" fill="none" stroke="rgb(var(--fg))" strokeOpacity="0.7" strokeWidth="3">
        <circle cx="14" cy="14" r="11" />
        <circle cx="52" cy="14" r="11" />
        <path d="M25 14h16M3 14L-4 8M63 14l7-6" />
      </g>
    </>
  ),
};

export default function ProjectMockup({ kind = 'crm', accent = '#2563eb', title = '' }) {
  const id = useId().replace(/:/g, '');
  const scene = (scenes[kind] ?? scenes.crm)(accent);
  return (
    <svg viewBox="0 0 400 240" width="400" height="240" role="img" aria-label={`${title} interface preview`} className="h-full w-full">
      <defs>
        <linearGradient id={`bg-${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={accent} stopOpacity="0.28" />
          <stop offset="1" stopColor="rgb(139 92 246)" stopOpacity="0.14" />
        </linearGradient>
      </defs>
      <rect width="400" height="240" rx="14" fill="rgb(var(--bg))" />
      <rect width="400" height="240" rx="14" fill={`url(#bg-${id})`} />
      <rect width="400" height="28" rx="14" fill={panel} opacity="0.9" />
      <rect y="14" width="400" height="14" fill={panel} opacity="0.9" />
      {['#f87171', '#fbbf24', '#34d399'].map((c, i) => (
        <circle key={c} cx={16 + i * 14} cy="14" r="4" fill={c} />
      ))}
      <rect x="80" y="8" width="200" height="12" rx="6" fill={faint} />
      {scene}
    </svg>
  );
}
