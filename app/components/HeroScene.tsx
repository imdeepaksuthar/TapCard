'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import {
  AdaptiveDpr,
  AdaptiveEvents,
  Environment,
  Float,
  Lightformer,
  PerformanceMonitor,
  RoundedBox,
} from '@react-three/drei';
import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import type { DeviceTier } from '@/lib/useDeviceTier';

interface HeroSceneProps {
  tier: DeviceTier;
  isTouch: boolean;
  maxDpr: number;
}

/**
 * Per-tier quality presets. Everything that costs GPU/CPU — geometry detail,
 * particle count, reflections, anti-aliasing — is dialled off as the tier drops
 * so a low-end phone runs the same scene at a fraction of the cost.
 */
const QUALITY = {
  high: { smoothness: 5, ringSegs: 64, particles: 70, env: 128, antialias: true },
  mid: { smoothness: 3, ringSegs: 40, particles: 36, env: 64, antialias: false },
  low: { smoothness: 2, ringSegs: 24, particles: 0, env: 0, antialias: false },
} as const;

/* ── Animated NFC "tap" waves — the product motif ── */
function NfcWaves({ segments, z }: { segments: number; z: number }) {
  const rings = [useRef<THREE.Mesh>(null!), useRef<THREE.Mesh>(null!), useRef<THREE.Mesh>(null!)];

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    rings.forEach((r, i) => {
      if (!r.current) return;
      const p = (t * 0.6 + i * 0.6) % 1.8;
      r.current.scale.setScalar(0.35 + p * 0.55);
      (r.current.material as THREE.MeshBasicMaterial).opacity = Math.max(0, 0.55 - p * 0.32);
    });
  });

  return (
    <group position={[1.05, 0.55, z]} rotation={[0, 0, -0.7]}>
      {rings.map((r, i) => (
        <mesh key={i} ref={r}>
          <ringGeometry args={[0.18, 0.215, segments, 1, 0, Math.PI * 1.35]} />
          <meshBasicMaterial color="#60a5fa" transparent side={THREE.DoubleSide} />
        </mesh>
      ))}
    </group>
  );
}

/* ── The hero 3D model: a premium NFC business card ── */
function TapCard({ tier, isTouch }: { tier: DeviceTier; isTouch: boolean }) {
  const q = QUALITY[tier];
  const group = useRef<THREE.Group>(null!);
  const sheen = useRef<THREE.ShaderMaterial>(null!);
  const pointer = useRef({ x: 0, y: 0 });

  // Card geometry (credit-card 1.6:1 ratio).
  const W = 3.2;
  const H = 2.0;
  const D = 0.08;
  const Z = D / 2 + 0.003; // front-face offset

  // Subtle animated gradient + sheen for the card face — one cheap plane, no textures.
  const faceShader = useMemo(
    () => ({
      uniforms: { uTime: { value: 0 } },
      vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
      fragmentShader: `
        uniform float uTime; varying vec2 vUv;
        void main(){
          vec3 col = mix(vec3(0.04,0.05,0.14), vec3(0.16,0.11,0.42), vUv.y);
          float band = 1.0 - abs(fract(vUv.x - uTime * 0.08) * 2.0 - 1.0);
          col += smoothstep(0.6, 1.0, band) * 0.10 * vec3(0.5,0.65,1.0);
          gl_FragColor = vec4(col, 1.0);
        }`,
    }),
    []
  );

  // Cursor parallax — pointer devices only; touch screens skip the listener entirely.
  useEffect(() => {
    if (isTouch) return;
    const onMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      pointer.current.y = -(e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, [isTouch]);

  useFrame((state, delta) => {
    const g = group.current;
    if (!g) return;
    const t = state.clock.elapsedTime;
    // Frame-rate independent smoothing so 60Hz and 120Hz devices feel identical.
    const k = Math.min(1, delta * 3);

    const targetRotY = Math.sin(t * 0.3) * 0.4 + pointer.current.x * 0.45;
    const targetRotX = Math.cos(t * 0.24) * 0.1 + pointer.current.y * 0.28;
    g.rotation.y += (targetRotY - g.rotation.y) * k;
    g.rotation.x += (targetRotX - g.rotation.x) * k;

    // Scale the card to the live viewport so it reads the same on any screen size.
    const target = THREE.MathUtils.clamp(state.viewport.width / 6.5, 0.62, 1.25);
    g.scale.setScalar(g.scale.x + (target - g.scale.x) * k);

    if (sheen.current) sheen.current.uniforms.uTime.value = t;
  });

  return (
    <Float speed={1.1} rotationIntensity={0.15} floatIntensity={0.5}>
      <group ref={group}>
        {/* Metallic body */}
        <RoundedBox args={[W, H, D]} radius={0.14} smoothness={q.smoothness}>
          <meshStandardMaterial color="#0a0a14" metalness={0.85} roughness={0.22} />
        </RoundedBox>

        {/* Gradient face */}
        <mesh position={[0, 0, Z]}>
          <planeGeometry args={[W - 0.1, H - 0.1]} />
          <shaderMaterial ref={sheen} {...faceShader} />
        </mesh>

        {/* Top accent bar */}
        <mesh position={[0, H / 2 - 0.2, Z + 0.001]}>
          <planeGeometry args={[0.7, 0.045]} />
          <meshBasicMaterial color="#818cf8" />
        </mesh>

        {/* Gold NFC chip */}
        <group position={[-W / 2 + 0.45, -H / 2 + 0.4, Z]}>
          <RoundedBox args={[0.42, 0.32, 0.02]} radius={0.04} smoothness={2}>
            <meshStandardMaterial color="#d6a916" metalness={0.95} roughness={0.25} />
          </RoundedBox>
          <mesh position={[0, 0, 0.012]}>
            <planeGeometry args={[0.12, 0.12]} />
            <meshStandardMaterial color="#f5d472" metalness={1} roughness={0.15} />
          </mesh>
        </group>

        {/* NFC tap waves */}
        <NfcWaves segments={q.ringSegs} z={Z + 0.002} />
      </group>
    </Float>
  );
}

/* ── Ambient particle field (skipped entirely on low tier) ── */
function Particles({ count }: { count: number }) {
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 12;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 8;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 4 - 2;
    }
    return arr;
  }, [count]);

  const ref = useRef<THREE.Points>(null!);
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.02;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color="#818cf8"
        size={0.02}
        transparent
        opacity={0.35}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

function Lights({ lit }: { lit: boolean }) {
  return (
    <>
      {/* Brighter ambient when there's no reflective environment to carry the look. */}
      <ambientLight intensity={lit ? 0.35 : 0.75} />
      <directionalLight position={[5, 4, 6]} intensity={1.3} />
      <directionalLight position={[-5, -3, -4]} intensity={0.6} color="#818cf8" />
    </>
  );
}

export default function HeroScene({ tier, isTouch, maxDpr }: HeroSceneProps) {
  const q = QUALITY[tier];
  const wrapRef = useRef<HTMLDivElement>(null);
  const [dpr, setDpr] = useState(maxDpr);
  // Drives the render loop: pause to 'never' = zero GPU work when unseen.
  const [frameloop, setFrameloop] = useState<'always' | 'never'>('always');

  // Stop rendering when the hero scrolls offscreen or the tab is backgrounded.
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    let onScreen = true;
    let foreground = !document.hidden;
    const apply = () => setFrameloop(onScreen && foreground ? 'always' : 'never');

    const io = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry.isIntersecting;
        apply();
      },
      { threshold: 0.01 }
    );
    io.observe(el);

    const onVisibility = () => {
      foreground = !document.hidden;
      apply();
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      io.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  return (
    <div ref={wrapRef} className="absolute inset-0">
      <Canvas
        frameloop={frameloop}
        dpr={dpr}
        camera={{ position: [0, 0, 5], fov: 40 }}
        gl={{
          antialias: q.antialias,
          alpha: true,
          powerPreference: 'high-performance',
          stencil: false,
        }}
        style={{ pointerEvents: 'none' }}
      >
        <Suspense fallback={null}>
          {/* Sustained low FPS → drop pixel ratio; recovery → restore it. */}
          <PerformanceMonitor
            onDecline={() => setDpr(1)}
            onIncline={() => setDpr(maxDpr)}
            onFallback={() => setDpr(1)}
            flipflops={3}
          >
            <Lights lit={q.env > 0} />
            <TapCard tier={tier} isTouch={isTouch} />
            {q.particles > 0 && <Particles count={q.particles} />}

            {/* Reflections from an in-memory light rig — baked once, no HDR download. */}
            {q.env > 0 && (
              <Environment resolution={q.env} frames={1}>
                <Lightformer form="rect" intensity={2} color="#3b82f6" position={[-3, 2, 3]} scale={[4, 4, 1]} />
                <Lightformer form="rect" intensity={1.6} color="#8b5cf6" position={[3, -1, 2]} scale={[4, 4, 1]} />
                <Lightformer form="circle" intensity={2} color="#ffffff" position={[0, 3, -2]} scale={3} />
              </Environment>
            )}
          </PerformanceMonitor>

          {/* Lower resolution while moving; throttle raycasting under load. */}
          <AdaptiveDpr pixelated />
          <AdaptiveEvents />
        </Suspense>
      </Canvas>
    </div>
  );
}
