import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import { CanvasTexture, MathUtils, SRGBColorSpace } from 'three';
import { mouse } from '../lib/mouse';
import { skillCloud } from '../data/portfolio';

/** Compact (phones/tablets): only the most important chips, so they stay readable and uncrowded. */
const COMPACT_LABELS = ['JavaScript', 'Python', 'React', 'Node.js', 'Express', 'PostgreSQL', 'MongoDB', 'Prisma', 'Stripe', 'NLP', 'OpenCV', 'Git'];
const COMPACT_ITEMS = COMPACT_LABELS.map((l) => skillCloud.find((s) => s.label === l)).filter(Boolean);
const LABEL_SCALE = [1.3, 0.38, 1];
const COMPACT_LABEL_SCALE = [1.15, 0.336, 1];

/** Renders a text chip into a canvas so we need no font files for the 3D labels. */
function makeLabelTexture(text, hue, fontPx = 62) {
  const w = 512;
  const h = 150;
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d');
  const r = 36;
  ctx.beginPath();
  ctx.roundRect(8, 8, w - 16, h - 16, r);
  ctx.fillStyle = 'rgba(15, 23, 42, 0.82)';
  ctx.fill();
  ctx.lineWidth = 5;
  ctx.strokeStyle = hue;
  ctx.stroke();
  ctx.fillStyle = hue;
  ctx.font = `600 ${fontPx}px system-ui, -apple-system, "Segoe UI", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, w / 2, h / 2 + 4);
  const tex = new CanvasTexture(c);
  tex.colorSpace = SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

function Label({ item, position, float, compact }) {
  const texture = useMemo(() => makeLabelTexture(item.label, item.hue, compact ? 72 : 62), [item, compact]);
  useEffect(() => () => texture.dispose(), [texture]);

  const sprite = (
    <sprite position={position} scale={compact ? COMPACT_LABEL_SCALE : LABEL_SCALE}>
      <spriteMaterial map={texture} transparent depthWrite={false} toneMapped={false} />
    </sprite>
  );
  return float ? (
    <Float speed={1.6} floatIntensity={0.7} rotationIntensity={0}>
      {sprite}
    </Float>
  ) : (
    sprite
  );
}

/** Evenly spreads n points over a sphere (Fibonacci lattice). */
function spherePoints(n, radius) {
  const golden = Math.PI * (3 - Math.sqrt(5));
  return Array.from({ length: n }, (_, i) => {
    const y = 1 - (i / (n - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const t = golden * i;
    return [Math.cos(t) * r * radius, y * radius * 0.85, Math.sin(t) * r * radius];
  });
}

/** Compact only: keeps the whole cluster inside the box whatever its aspect ratio (360px phone .. tablet). */
function CompactCamera() {
  const camera = useThree((s) => s.camera);
  const aspect = useThree((s) => s.size.width / Math.max(1, s.size.height));
  useLayoutEffect(() => {
    camera.position.z = MathUtils.clamp((8.2 * 0.96) / aspect, 6.8, 9.5);
  }, [camera, aspect]);
  return null;
}

/** Compact only: tells the page the canvas drew its first frame (so it can drop the static fallback). */
function FirstFrame({ onReady }) {
  const done = useRef(false);
  useFrame(() => {
    if (done.current) return;
    done.current = true;
    onReady?.();
  });
  return null;
}

function Cluster({ low, animate, compact, drag }) {
  const group = useRef();
  const spin = useRef(0);
  const items = useMemo(() => (compact ? COMPACT_ITEMS : low ? skillCloud.slice(0, 14) : skillCloud), [low, compact]);
  const points = useMemo(() => spherePoints(items.length, compact ? 2 : 2.7), [items, compact]);

  useFrame((_, dt) => {
    if (!animate || !group.current) return;
    // compact: touch-drag steering (drag is zeroed on release, so it eases back to the idle spin); else cursor
    const pointer = compact && drag?.current ? drag.current : mouse;
    spin.current += dt * 0.18;
    group.current.rotation.y = MathUtils.damp(group.current.rotation.y, spin.current + pointer.x * (compact ? 0.9 : 0.6), 4, dt);
    group.current.rotation.x = MathUtils.damp(group.current.rotation.x, -pointer.y * (compact ? 0.4 : 0.3), 4, dt);
  });

  return (
    <group ref={group} rotation={[0.15, 0.4, 0]}>
      <mesh>
        <icosahedronGeometry args={[0.9, low ? 1 : 3]} />
        <meshStandardMaterial color="#2563eb" emissive="#2563eb" emissiveIntensity={0.9} roughness={0.3} metalness={0.5} />
      </mesh>
      <mesh>
        <icosahedronGeometry args={[1.25, 1]} />
        <meshBasicMaterial color="#22d3ee" wireframe transparent opacity={0.3} />
      </mesh>
      {items.map((item, i) => (
        <Label key={item.label} item={item} position={points[i]} float={!low && animate} compact={compact} />
      ))}
    </group>
  );
}

export default function SkillsScene({ active, tier, compact = false, drag, onReady }) {
  const { low, reduce } = tier;
  return (
    <Canvas
      camera={{ position: [0, 0, 7.5], fov: 45 }}
      dpr={compact ? [1, 1.5] : low ? 1 : [1, 1.5]}
      frameloop={reduce ? 'demand' : active ? 'always' : 'never'}
      gl={{ antialias: !low, alpha: true, powerPreference: 'high-performance' }}
    >
      <ambientLight intensity={0.7} />
      <pointLight position={[0, 0, 4]} intensity={60} color="#22d3ee" />
      {compact && <CompactCamera />}
      {compact && <FirstFrame onReady={onReady} />}
      <Cluster low={low} animate={!reduce} compact={compact} drag={drag} />
    </Canvas>
  );
}
