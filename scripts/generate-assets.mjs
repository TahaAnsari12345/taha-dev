/**
 * Generates the share image and icon set into public/ (no browser needed).
 * Run with:  npm run assets
 */
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { Resvg } from '@resvg/resvg-js';

const out = join(dirname(fileURLToPath(import.meta.url)), '..', 'public');
const font = "Segoe UI, Helvetica Neue, Arial, sans-serif";

const png = (svg, width) =>
  new Resvg(svg, { fitTo: { mode: 'width', value: width }, font: { loadSystemFonts: true, defaultFontFamily: 'Arial' } })
    .render()
    .asPng();

// ---------- Open Graph / Twitter card (1200x630) ----------
const og = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0f172a"/><stop offset="1" stop-color="#16213f"/></linearGradient>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#2563eb"/><stop offset=".55" stop-color="#22d3ee"/><stop offset="1" stop-color="#a78bfa"/></linearGradient>
    <radialGradient id="o1" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#2563eb" stop-opacity=".55"/><stop offset="1" stop-color="#2563eb" stop-opacity="0"/></radialGradient>
    <radialGradient id="o2" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#8b5cf6" stop-opacity=".4"/><stop offset="1" stop-color="#8b5cf6" stop-opacity="0"/></radialGradient>
    <radialGradient id="core" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#60a5fa"/><stop offset=".6" stop-color="#2563eb"/><stop offset="1" stop-color="#1e3a8a"/></radialGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <circle cx="930" cy="300" r="360" fill="url(#o1)"/>
  <circle cx="1100" cy="560" r="260" fill="url(#o2)"/>
  <g stroke="#94a3b8" stroke-opacity=".08">
    ${Array.from({ length: 22 }, (_, i) => `<path d="M${i * 56} 0V630"/>`).join('')}
    ${Array.from({ length: 12 }, (_, i) => `<path d="M0 ${i * 56}H1200"/>`).join('')}
  </g>
  <!-- orb -->
  <circle cx="930" cy="310" r="150" fill="url(#core)"/>
  <circle cx="930" cy="310" r="205" fill="none" stroke="#22d3ee" stroke-opacity=".5" stroke-width="2"/>
  <ellipse cx="930" cy="310" rx="250" ry="80" fill="none" stroke="#a78bfa" stroke-opacity=".7" stroke-width="2" transform="rotate(-18 930 310)"/>
  ${[[760, 150], [1090, 190], [1120, 430], [800, 500], [700, 330], [1010, 90], [1040, 520]]
    .map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="${3 + (i % 3)}" fill="${i % 2 ? '#a78bfa' : '#67e8f9'}"/>`)
    .join('')}
  <!-- text -->
  <rect x="72" y="92" width="320" height="40" rx="20" fill="#0f172a" stroke="#34d399" stroke-opacity=".5"/>
  <circle cx="98" cy="112" r="6" fill="#34d399"/>
  <text x="116" y="118" font-family="${font}" font-size="18" fill="#e2e8f0">Open to Software Engineer roles</text>
  <text x="72" y="270" font-family="${font}" font-size="104" font-weight="700" fill="url(#g)">Taha Ansari</text>
  <text x="72" y="340" font-family="${font}" font-size="40" font-weight="600" fill="#f1f5f9">Full-Stack Developer &amp; AI/ML Engineer</text>
  <text x="72" y="396" font-family="${font}" font-size="26" fill="#94a3b8">Turning ideas into deployed products</text>
  ${['React', 'Node.js', 'PostgreSQL', 'RAG']
    .map((t, i) => {
      const x = 72 + [0, 118, 262, 424][i];
      const w = [100, 126, 144, 84][i];
      return `<rect x="${x}" y="450" width="${w}" height="44" rx="22" fill="#2563eb" fill-opacity=".18" stroke="#22d3ee" stroke-opacity=".45"/>
  <text x="${x + w / 2}" y="479" text-anchor="middle" font-family="Consolas, Courier New, monospace" font-size="20" fill="#e2e8f0">${t}</text>`;
    })
    .join('\n  ')}
</svg>`;
writeFileSync(join(out, 'og-image.png'), png(og, 1200));

// ---------- Icons ----------
const icon = (size, pad = 0) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="${size}" height="${size}">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2563eb"/><stop offset="1" stop-color="#8b5cf6"/></linearGradient></defs>
  <rect width="64" height="64" rx="${pad ? 0 : 16}" fill="#0f172a"/>
  <rect x="${2 + pad}" y="${2 + pad}" width="${60 - 2 * pad}" height="${60 - 2 * pad}" rx="${pad ? 12 : 14}" fill="none" stroke="url(#g)" stroke-width="3"/>
  <text x="32" y="43" text-anchor="middle" font-family="Arial, sans-serif" font-weight="700" font-size="30" fill="url(#g)">TA</text>
</svg>`;

const f32 = png(icon(32), 32);
writeFileSync(join(out, 'favicon-32.png'), f32);
writeFileSync(join(out, 'apple-touch-icon.png'), png(icon(180, 4), 180));
writeFileSync(join(out, 'icon-192.png'), png(icon(192), 192));
writeFileSync(join(out, 'icon-512.png'), png(icon(512), 512));

// favicon.ico = ICONDIR + one PNG-compressed 32x32 entry
const header = Buffer.alloc(22);
header.writeUInt16LE(0, 0); // reserved
header.writeUInt16LE(1, 2); // type: icon
header.writeUInt16LE(1, 4); // image count
header.writeUInt8(32, 6); // width
header.writeUInt8(32, 7); // height
header.writeUInt16LE(1, 10); // planes
header.writeUInt16LE(32, 12); // bits per pixel
header.writeUInt32LE(f32.length, 14); // image size
header.writeUInt32LE(22, 18); // image offset
writeFileSync(join(out, 'favicon.ico'), Buffer.concat([header, f32]));

writeFileSync(
  join(out, 'site.webmanifest'),
  JSON.stringify(
    {
      name: 'Taha Ansari | Developer Portfolio',
      short_name: 'Taha Ansari',
      icons: [
        { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
        { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
      ],
      theme_color: '#0f172a',
      background_color: '#0f172a',
      display: 'standalone',
    },
    null,
    2,
  ) + '\n',
);

console.log('Generated: og-image.png, favicon.ico, favicon-32.png, apple-touch-icon.png, icon-192.png, icon-512.png, site.webmanifest');
