'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, RoundedBox, Text, useTexture } from '@react-three/drei';
import { Suspense, useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';

interface Scene3DProps {
  scrollProgress: React.RefObject<{ value: number }>;
}

/* ── Subtle animated NFC pulse ── */
function NfcPulse({ position }: { position: [number, number, number] }) {
  const refs = [useRef<THREE.Mesh>(null!), useRef<THREE.Mesh>(null!), useRef<THREE.Mesh>(null!)];

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    refs.forEach((ref, i) => {
      if (!ref.current) return;
      const phase = (t * 0.7 + i * 0.6) % 2.2;
      ref.current.scale.setScalar(1 + phase * 0.4);
      (ref.current.material as THREE.MeshBasicMaterial).opacity = Math.max(0, 0.5 - phase * 0.23);
    });
  });

  return (
    <group position={position}>
      {refs.map((ref, i) => (
        <mesh key={i} ref={ref}>
          <ringGeometry args={[0.06, 0.075, 24]} />
          <meshBasicMaterial color="#60a5fa" transparent opacity={0.4} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </group>
  );
}

/* ── Holographic shimmer shader ── */
function HoloShimmer() {
  const matRef = useRef<THREE.ShaderMaterial>(null!);

  const shader = useMemo(() => ({
    uniforms: { uTime: { value: 0 } },
    vertexShader: `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
    fragmentShader: `
      uniform float uTime; varying vec2 vUv;
      void main() {
        float s = sin(vUv.x*10.0 + vUv.y*6.0 + uTime*1.2)*0.5+0.5;
        s *= sin(vUv.x*5.0 - uTime*0.6)*0.5+0.5;
        vec3 c = mix(vec3(0.22,0.38,0.95), vec3(0.55,0.45,0.95), s);
        gl_FragColor = vec4(c, s*0.08);
      }`,
    transparent: true, side: THREE.FrontSide,
  }), []);

  useFrame(({ clock }) => { if (matRef.current) matRef.current.uniforms.uTime.value = clock.getElapsedTime(); });

  return (
    <mesh position={[0, 0, 0.043]}>
      <planeGeometry args={[2.92, 1.78]} />
      <shaderMaterial ref={matRef} {...shader} />
    </mesh>
  );
}

/* ── NFC Business Card ── */
/* ── Product logo loaded as texture ── */
function CardLogo({ position }: { position: [number, number, number] }) {
  const texture = useTexture('/logo-dark.png');
  texture.colorSpace = THREE.SRGBColorSpace;

  const img = texture.image as HTMLImageElement | undefined;
  const aspect = img ? img.width / img.height : 3;
  const h = 0.2;
  const w = h * aspect;

  return (
    <mesh position={position}>
      <planeGeometry args={[w, h]} />
      <meshBasicMaterial map={texture} transparent />
    </mesh>
  );
}

function NFCCard({ scrollProgress }: { scrollProgress: React.RefObject<{ value: number }> }) {
  const groupRef = useRef<THREE.Group>(null!);
  const mouseRef = useRef({ x: 0, y: 0 });
  const sizeRef = useRef<'mobile' | 'tablet' | 'desktop'>('desktop');
  const glowRef = useRef<THREE.Mesh>(null!);

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      sizeRef.current = w < 640 ? 'mobile' : w < 1024 ? 'tablet' : 'desktop';
    };
    update();
    window.addEventListener('resize', update, { passive: true });
    return () => window.removeEventListener('resize', update);
  }, []);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouseRef.current = {
        x: (e.clientX / window.innerWidth - 0.5) * 2,
        y: -(e.clientY / window.innerHeight - 0.5) * 2,
      };
    };
    window.addEventListener('mousemove', onMove, { passive: true });
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const p = scrollProgress.current?.value ?? 0;
    const size = sizeRef.current;

    // Position — shifted right on desktop, centered on mobile
    const targetX = size === 'desktop' ? 1.1 - p * 1.1 : 0;
    const targetRotY = p * Math.PI * 2 + mouseRef.current.x * 0.25;
    const targetRotX = -p * 0.35 + mouseRef.current.y * 0.15;
    let targetY = -p * 1.6;
    if (size !== 'desktop') targetY = -0.4 - p * 1.2;

    // Scale — smaller on mobile/tablet
    const base = size === 'mobile' ? 0.52 : size === 'tablet' ? 0.7 : 0.88;
    const targetScale = base * (1 - p * 0.15);

    const g = groupRef.current;
    const l = THREE.MathUtils.lerp;
    g.position.x = l(g.position.x, targetX, 0.06);
    g.position.y = l(g.position.y, targetY, 0.06);
    g.rotation.x = l(g.rotation.x, targetRotX, 0.06);
    g.rotation.y = l(g.rotation.y, targetRotY, 0.06);
    g.scale.setScalar(l(g.scale.x, targetScale, 0.06));

    // Edge glow pulse
    if (glowRef.current) {
      const pulse = Math.sin(clock.getElapsedTime() * 1.8) * 0.02 + 0.06;
      (glowRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = pulse;
    }
  });

  // Card dimensions (credit card ratio 85.6 x 53.98mm ≈ 1.586:1)
  const W = 3.0;
  const H = 1.89;
  const D = 0.06;
  const R = 0.12;
  const Z = D / 2 + 0.002; // front face z

  return (
    <Float speed={1.0} rotationIntensity={0.08} floatIntensity={0.2}>
      <group ref={groupRef}>

        {/* ── Card body ── */}
        <RoundedBox args={[W, H, D]} radius={R} smoothness={4}>
          <meshStandardMaterial color="#08080e" metalness={0.88} roughness={0.18} />
        </RoundedBox>

        {/* Edge glow */}
        <mesh ref={glowRef}>
          <RoundedBox args={[W + 0.04, H + 0.04, 0.015]} radius={R + 0.02} smoothness={4}>
            <meshStandardMaterial color="#0f0f20" metalness={0.6} roughness={0.3} emissive="#6366f1" emissiveIntensity={0.06} transparent opacity={0.4} />
          </RoundedBox>
        </mesh>

        {/* ── Front face base ── */}
        <mesh position={[0, 0, Z]}>
          <planeGeometry args={[W - 0.08, H - 0.08]} />
          <meshStandardMaterial color="#0a0a18" metalness={0.55} roughness={0.35} emissive="#1a1a3a" emissiveIntensity={0.03} />
        </mesh>

        {/* Holographic shimmer */}
        <HoloShimmer />

        {/* ── Top accent line — single clean gradient ── */}
        <mesh position={[0, H / 2 - 0.06, Z + 0.001]}>
          <planeGeometry args={[W - 0.08, 0.012]} />
          <meshBasicMaterial color="#6366f1" />
        </mesh>

        {/* ── Product Logo ── */}
        <CardLogo position={[-W / 2 + 0.55, H / 2 - 0.25, Z + 0.003]} />

        {/* ── Tagline ── */}
        <Text
          position={[-W / 2 + 0.22, H / 2 - 0.4, Z + 0.002]}
          fontSize={0.055}
          color="#64748b"
          anchorX="left"
          anchorY="middle"
          letterSpacing={0.05}
        >
          Digital Business Card
        </Text>

        {/* ── Thin separator ── */}
        <mesh position={[0, 0.12, Z + 0.001]}>
          <planeGeometry args={[W - 0.5, 0.002]} />
          <meshBasicMaterial color="#334155" transparent opacity={0.3} />
        </mesh>

        {/* ── Contact info rows ── */}
        {[
          { y: 0, color: '#3b82f6', label: '+91 99838 78055' },
          { y: -0.17, color: '#8b5cf6', label: 'hello@cardsetu.com' },
          { y: -0.34, color: '#06b6d4', label: 'www.cardsetu.com' },
        ].map((row, i) => (
          <group key={i} position={[-W / 2 + 0.28, row.y, Z + 0.001]}>
            <mesh>
              <circleGeometry args={[0.035, 12]} />
              <meshBasicMaterial color={row.color} transparent opacity={0.6} />
            </mesh>
            <Text position={[0.12, 0, 0.001]} fontSize={0.058} color="#94a3b8" anchorX="left" anchorY="middle">
              {row.label}
            </Text>
          </group>
        ))}

        {/* ── QR code area (bottom-right) ── */}
        <group position={[W / 2 - 0.38, -H / 2 + 0.35, Z + 0.001]}>
          <mesh>
            <planeGeometry args={[0.38, 0.38]} />
            <meshStandardMaterial color="#0c1022" metalness={0.2} roughness={0.5} />
          </mesh>
          {/* QR dots pattern */}
          {[
            [-0.1, 0.1], [0.1, 0.1], [-0.1, -0.1], [0.1, -0.1],
            [0, 0], [-0.05, 0.05], [0.05, -0.05], [0, 0.08], [0, -0.08],
          ].map(([x, y], i) => (
            <mesh key={i} position={[x, y, 0.001]}>
              <planeGeometry args={[0.025, 0.025]} />
              <meshBasicMaterial color="#475569" transparent opacity={0.7} />
            </mesh>
          ))}
          {/* Corner markers */}
          {[[-0.12, 0.12], [0.12, 0.12], [-0.12, -0.12]].map(([x, y], i) => (
            <mesh key={`c${i}`} position={[x, y, 0.001]}>
              <planeGeometry args={[0.05, 0.05]} />
              <meshBasicMaterial color="#64748b" transparent opacity={0.6} />
            </mesh>
          ))}
        </group>

        {/* ── NFC chip (bottom-left) ── */}
        <group position={[-W / 2 + 0.35, -H / 2 + 0.28, Z + 0.005]}>
          <RoundedBox args={[0.36, 0.26, 0.012]} radius={0.03} smoothness={2}>
            <meshStandardMaterial color="#c9960c" metalness={0.95} roughness={0.2} emissive="#a07008" emissiveIntensity={0.04} />
          </RoundedBox>
          {/* Circuit lines */}
          {[-0.07, -0.035, 0, 0.035, 0.07].map((y, i) => (
            <mesh key={i} position={[0, y, 0.008]}>
              <planeGeometry args={[0.24 - Math.abs(y) * 1.2, 0.0015]} />
              <meshBasicMaterial color="#b8860b" transparent opacity={0.6} />
            </mesh>
          ))}
          {/* Center pad */}
          <mesh position={[0, 0, 0.008]}>
            <planeGeometry args={[0.07, 0.07]} />
            <meshStandardMaterial color="#daa520" metalness={1} roughness={0.15} />
          </mesh>
        </group>

        {/* ── NFC pulse icon (top-right area) ── */}
        <NfcPulse position={[W / 2 - 0.3, H / 2 - 0.28, Z + 0.002]} />
        <mesh position={[W / 2 - 0.3, H / 2 - 0.28, Z + 0.001]}>
          <circleGeometry args={[0.03, 12]} />
          <meshBasicMaterial color="#60a5fa" transparent opacity={0.7} />
        </mesh>

        {/* ── Social dots (bottom center) ── */}
        {[-0.12, -0.04, 0.04, 0.12].map((x, i) => (
          <mesh key={`s${i}`} position={[x, -H / 2 + 0.12, Z + 0.001]}>
            <circleGeometry args={[0.025, 10]} />
            <meshBasicMaterial color={['#3b82f6', '#8b5cf6', '#ec4899', '#06b6d4'][i]} transparent opacity={0.45} />
          </mesh>
        ))}

        {/* ── Brand URL (bottom-right, above QR) ── */}
        <Text
          position={[W / 2 - 0.38, -H / 2 + 0.12, Z + 0.002]}
          fontSize={0.045}
          color="#475569"
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.06}
        >
          cardsetu.com
        </Text>

        {/* ═══ Back face ═══ */}
        <mesh position={[0, 0, -Z]} rotation={[0, Math.PI, 0]}>
          <planeGeometry args={[W - 0.08, H - 0.08]} />
          <meshStandardMaterial color="#070710" metalness={0.75} roughness={0.25} />
        </mesh>
        {/* Magnetic stripe */}
        <mesh position={[0, 0.42, -Z - 0.001]} rotation={[0, Math.PI, 0]}>
          <planeGeometry args={[W - 0.08, 0.2]} />
          <meshStandardMaterial color="#151525" metalness={0.4} roughness={0.45} />
        </mesh>
        {/* Back brand name */}
        <Text
          position={[0, 0.08, -Z - 0.002]}
          rotation={[0, Math.PI, 0]}
          fontSize={0.18}
          color="#1e1e3a"
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.08}
        >
          CARD SETU
        </Text>
        {/* Back tagline */}
        <Text
          position={[0, -0.08, -Z - 0.002]}
          rotation={[0, Math.PI, 0]}
          fontSize={0.06}
          color="#2a2a4a"
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.12}
        >
          DIGITAL BUSINESS CARD
        </Text>
        {/* Back accent line */}
        <mesh position={[0, -0.25, -Z - 0.001]} rotation={[0, Math.PI, 0]}>
          <planeGeometry args={[1.6, 0.006]} />
          <meshBasicMaterial color="#6366f1" transparent opacity={0.3} />
        </mesh>
        {/* Back URL */}
        <Text
          position={[0, -0.38, -Z - 0.002]}
          rotation={[0, Math.PI, 0]}
          fontSize={0.055}
          color="#4a4a6a"
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.05}
        >
          www.cardsetu.com
        </Text>
      </group>
    </Float>
  );
}

/* ── Particles ── */
function FloatingParticles() {
  const positions = useMemo(() => {
    const count = 80;
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 14;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 10;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 5 - 2;
    }
    return arr;
  }, []);

  const ref = useRef<THREE.Points>(null!);
  useFrame((_, delta) => { if (ref.current) ref.current.rotation.y += delta * 0.01; });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#818cf8" size={0.018} transparent opacity={0.35} sizeAttenuation depthWrite={false} />
    </points>
  );
}

/* ── Adaptive DPR ── */
function AdaptiveDpr() {
  const { gl } = useThree();
  useEffect(() => {
    gl.setPixelRatio(window.innerWidth < 768 ? 1 : Math.min(window.devicePixelRatio, 1.5));
  }, [gl]);
  return null;
}

export default function Scene3D({ scrollProgress }: Scene3DProps) {
  return (
    <Canvas
      camera={{ position: [0, 0, 4.5], fov: 38 }}
      dpr={[1, 1.5]}
      gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}
      style={{ pointerEvents: 'none' }}
    >
      <Suspense fallback={null}>
        <AdaptiveDpr />
        <ambientLight intensity={0.35} />
        <directionalLight position={[4, 3, 5]} intensity={1.1} />
        <directionalLight position={[-3, -2, -2]} intensity={0.3} color="#6366f1" />
        <pointLight position={[0, 1.5, 3]} intensity={0.5} color="#3b82f6" distance={8} />
        <FloatingParticles />
        <NFCCard scrollProgress={scrollProgress} />
      </Suspense>
    </Canvas>
  );
}
