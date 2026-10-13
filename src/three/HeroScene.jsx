import { useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { MeshDistortMaterial } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { AdditiveBlending, MathUtils, NormalBlending } from 'three';
import { mouse } from '../lib/mouse';

/** A shell of points around the core. Two layers rotate at different speeds to read as "orbiting". */
function Particles({ count, color, size, speed, animate, light, inner = 2.7, spread = 3 }) {
  const ref = useRef();
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i += 1) {
      const r = inner + Math.random() * spread;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      arr[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = r * Math.cos(phi) * 0.75;
      arr[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
    }
    return arr;
  }, [count, inner, spread]);

  useFrame((_, dt) => {
    if (!animate || !ref.current) return;
    ref.current.rotation.y += dt * speed;
    ref.current.rotation.x += dt * speed * 0.2;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial
        size={size}
        color={color}
        transparent
        opacity={light ? 0.9 : 0.85}
        sizeAttenuation
        depthWrite={false}
        blending={light ? NormalBlending : AdditiveBlending}
      />
    </points>
  );
}

function Core({ low, animate, light }) {
  const shell = useRef();
  const ring = useRef();

  useFrame((_, dt) => {
    if (!animate) return;
    if (shell.current) {
      shell.current.rotation.y += dt * 0.15;
      shell.current.rotation.x += dt * 0.07;
    }
    if (ring.current) ring.current.rotation.z += dt * 0.25;
  });

  return (
    <group>
      <mesh>
        <icosahedronGeometry args={[1.45, low ? 20 : 44]} />
        <MeshDistortMaterial
          color="#2563eb"
          emissive="#1d4ed8"
          emissiveIntensity={0.6}
          roughness={0.18}
          metalness={0.65}
          distort={0.42}
          speed={animate ? 1.6 : 0}
        />
      </mesh>
      <mesh ref={shell}>
        <icosahedronGeometry args={[1.9, 2]} />
        <meshBasicMaterial color={light ? '#0891b2' : '#22d3ee'} wireframe transparent opacity={light ? 0.35 : 0.22} />
      </mesh>
      <mesh ref={ring} rotation={[Math.PI / 2.4, 0, 0]}>
        <torusGeometry args={[2.45, 0.012, 8, low ? 90 : 160]} />
        <meshBasicMaterial color={light ? '#6d28d9' : '#a78bfa'} transparent opacity={0.8} />
      </mesh>
    </group>
  );
}

/** Positions the whole scene beside the photo on desktop / above the text on mobile, and follows the pointer. */
function Rig({ children, animate, narrow }) {
  const group = useRef();
  const viewport = useThree((s) => s.viewport);
  const width = useThree((s) => s.size.width);
  const wide = width >= 1024;
  // Phones/tablets: the canvas is its own box above the text, so centre the scene and fit it to the box.
  const pos = narrow ? [0, 0, 0] : wide ? [viewport.width * 0.235, 0, 0] : [0, viewport.height * 0.2, 0];
  const scale = narrow
    ? MathUtils.clamp((Math.min(viewport.width, viewport.height) * 0.9) / 5, 0.55, 1.1)
    : wide
      ? MathUtils.clamp(width / 1560, 0.75, 0.92)
      : MathUtils.clamp(width / 520, 0.55, 0.9);

  useFrame((state, dt) => {
    if (!animate || !group.current) return;
    const g = group.current;
    if (narrow) {
      // slow idle float + a gentle lean toward the finger while dragging
      const t = state.clock.elapsedTime;
      g.position.y = Math.sin(t * 0.9) * 0.1;
      g.rotation.y = MathUtils.damp(g.rotation.y, mouse.x * 0.45 + Math.sin(t * 0.35) * 0.25, 3, dt);
      g.rotation.x = MathUtils.damp(g.rotation.x, -mouse.y * 0.3 + Math.sin(t * 0.5) * 0.06, 3, dt);
      return;
    }
    g.rotation.y = MathUtils.damp(g.rotation.y, mouse.x * 0.55, 3, dt);
    g.rotation.x = MathUtils.damp(g.rotation.x, -mouse.y * 0.35, 3, dt);
  });

  return (
    <group position={pos} scale={scale}>
      <group ref={group}>{children}</group>
    </group>
  );
}

/** Reports once the scene has actually rendered a frame (used to dismiss the loading screen). */
function ReadySignal({ onReady }) {
  const done = useRef(false);
  useFrame(() => {
    if (done.current) return;
    done.current = true;
    onReady?.();
  });
  return null;
}

export default function HeroScene({ active, tier, light, onReady }) {
  const { low, reduce, narrow } = tier;
  const animate = !reduce;

  return (
    <Canvas
      camera={{ position: [0, 0, 7], fov: 45 }}
      dpr={narrow ? [1, 1.5] : low ? 1 : [1, 1.75]}
      frameloop={reduce ? 'demand' : active ? 'always' : 'never'}
      gl={{ antialias: !low, alpha: true, powerPreference: 'high-performance' }}
    >
      <ReadySignal onReady={onReady} />
      <ambientLight intensity={light ? 1.1 : 0.55} />
      <directionalLight position={[3, 3, 4]} intensity={light ? 2 : 2.4} />
      <pointLight position={[-4, -2, 3]} intensity={50} color="#a78bfa" />
      <pointLight position={[4, -3, 2]} intensity={50} color="#22d3ee" />
      <Rig animate={animate} narrow={narrow}>
        <Core low={low} animate={animate} light={light} />
        <Particles
          count={narrow ? 230 : low ? 260 : 1100}
          color={light ? '#0e7490' : '#67e8f9'}
          size={low ? 0.05 : 0.035}
          speed={0.06}
          animate={animate}
          light={light}
        />
        <Particles
          count={narrow ? 70 : low ? 90 : 380}
          color={light ? '#6d28d9' : '#c4b5fd'}
          size={low ? 0.06 : 0.045}
          speed={-0.09}
          animate={animate}
          light={light}
          inner={2.2}
          spread={1.6}
        />
      </Rig>
      {!low && !light && (
        <EffectComposer multisampling={0} disableNormalPass>
          <Bloom intensity={0.75} luminanceThreshold={0.3} luminanceSmoothing={0.5} mipmapBlur />
        </EffectComposer>
      )}
    </Canvas>
  );
}
